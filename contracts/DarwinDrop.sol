pragma solidity 0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IDarwinDrop.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract DarwinDrop is IDarwinDrop, UUPSUpgradeable, OwnableUpgradeable {

    modifier onlyAirdropOwner(uint256 _airdropId) {
        if(airdrops[_airdropId].airdropOwner != msg.sender) revert NotAirdropOwner();
        _;
    }

    uint256 public airdropCreationPriceEth;
    uint256 public airdropPromotionPriceEth;
    uint256 public lastAirdropId;
    uint256 public maxDelayForAirdropStart;

    address public wallet1;

    uint256 public recoverFeesDeadline;

    mapping(uint256 => AirDrop) public airdrops;
    mapping(uint256 => AirdropMeta) public airdropMeta;
    mapping(address => bool) public feeWhitelist;

    mapping(uint256 => uint256) public creationTime;

    IUniswapV2Pair pair;

    IERC20 darwin;

    function initialize(address _darwin) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __DarwinDrop_init_unchained(_darwin);
        __UUPSUpgradeable_init_unchained();
    }

    function __DarwinDrop_init_unchained(address _darwin) private onlyInitializing {
        airdropCreationPriceEth = 0.1 ether;
        airdropPromotionPriceEth = 1 ether;

        maxDelayForAirdropStart = 15 days;

        recoverFeesDeadline = 600;

        darwin = IERC20(_darwin);

        // Set wallet1 to receive fees from airdrops
        wallet1 = 0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd;
        // Whitelist Kieran's wallet from paying fees, for Darwin drops
        setFeeWhitelist(0xe4e672ED86b8f6782e889F125e977bcF54018232, true);
        // Whitelist wallet for BNB drops
        setFeeWhitelist(0xB997c232019487d49c4b45238401434e8c852cAe, true);
    }

    //end airdrop that has optional endtime
    function endAirDrop(uint256 _id) external onlyAirdropOwner(_id) {
        if (airdropMeta[_id].status != AirdropStatus.ACTIVE) revert AirdropNotActive();
        if (airdrops[_id].endTime != 0) revert AirdropHasEndTime();

        airdrops[_id].endTime = block.timestamp;

        emit AirdropEnded(_id);
    }

    //distribute tokens to participants
    function airDropTokens(address[] calldata _recipient, uint256 _id) external onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        if(meta.status != AirdropStatus.ACTIVE) revert AirdropNotActive();

        AirDrop memory drop = airdrops[_id];

        if(_recipient.length > drop.airdropMaxParticipants) revert AirdropFull();

        if(drop.endTime == 0 || drop.endTime > block.timestamp) revert AirdropStillInProgress();

        uint256 airdropAmount = drop.airdropTokenAmount / _recipient.length;

        uint256 usersNotReceivingTokens;

        IERC20 airdropToken = IERC20(drop.airdropTokenAddress);
        IERC20 requirementToken = IERC20(drop.requirementTokenAddress);

        for (uint256 i = 0; i < _recipient.length; ) {
            if (drop.requirementType == AirDropRequirementType.TOKEN_REQUIRED || drop.requirementType == AirDropRequirementType.NFT_REQUIRED) {
                if (requirementToken.balanceOf(_recipient[i]) < drop.requirementTokenAmount) {
                    unchecked {
                        ++i;
                        ++usersNotReceivingTokens;
                    }
                    continue;
                }
            }

            if(airdropToken.transfer(_recipient[i], airdropAmount) == false) revert TokenTransferFailed();

            unchecked {
                ++i;
            }
        }

        meta.status = AirdropStatus.TOKEN_DISTRIBUTED;
        meta.distributedTokens += (_recipient.length - usersNotReceivingTokens) * airdropAmount;
        meta.recepientCount += (_recipient.length - usersNotReceivingTokens);

        _transferOut(meta.ethSpent, wallet1);

        emit AirdropDistributed(_id, meta.distributedTokens, meta.recepientCount, _recipient);
    }

    function cancelAirDrop(uint256 id) external {
        AirDrop memory drop = airdrops[id];
        AirdropMeta storage meta = airdropMeta[id];

        if(drop.airdropOwner != msg.sender) revert UnauthorizedToCancel();

        if(drop.endTime != 0 && drop.endTime < block.timestamp) revert AirdropOver();

        if(meta.status != AirdropStatus.ACTIVE) revert AirdropAlreadyCanceled();

        _cancelAirDrop(id);

        emit AirdropCancelled(id, msg.sender);
    }

    function _cancelAirDrop(uint256 id) private {
        AirDrop memory drop = airdrops[id];
        AirdropMeta storage meta = airdropMeta[id];

        meta.status = AirdropStatus.CANCELLED;
        meta.ownerWithdrawnTokens = drop.airdropTokenAmount;

        if(IERC20(drop.airdropTokenAddress).transfer(drop.airdropOwner, drop.airdropTokenAmount) == false) revert TokenTransferFailed();

        // Allows creator to recover their paid fees if they created the airdrop less than 10 minutes before cancelling it
        if(block.timestamp < creationTime[drop.id] + recoverFeesDeadline) {
            _transferOut(meta.ethSpent, drop.airdropOwner);
        }
    }

    function withdrawRemainingTokens(uint256 _id) external onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        if(meta.status == AirdropStatus.CANCELLED) revert AirdropNotActive();

        if(meta.status == AirdropStatus.ACTIVE) {
            _cancelAirDrop(_id);
        } else {
            uint256 remainingTokensAmount = airdrops[_id].airdropTokenAmount - meta.distributedTokens - meta.ownerWithdrawnTokens;

            meta.ownerWithdrawnTokens += remainingTokensAmount;

            IERC20(airdrops[_id].airdropTokenAddress).transfer(msg.sender, remainingTokensAmount);
        }
    }


    function getAirDropDetails(uint256 _id) external view returns (AirDrop memory, AirdropMeta memory) {
        return (airdrops[_id], airdropMeta[_id]);
    }

    function createAirdropMeta(
        CreateAirDropParams calldata params,
        uint256 dropId,
        uint256 ethSpent
    ) private {
        airdropMeta[dropId] = AirdropMeta({
            ethSpent: ethSpent,
            distributedTokens: 0,
            recepientCount: 0,
            ownerWithdrawnTokens: 0,
            isPromoted: params.isPromoted,
            status: AirdropStatus.ACTIVE
        });
    }

    function createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId) external payable returns (uint256 dropId) {

        uint256 ethFees;

        if(feeWhitelist[msg.sender] == false) {
            ethFees = params.isPromoted ? airdropCreationPriceEth + airdropPromotionPriceEth : airdropCreationPriceEth;
            if(msg.value != ethFees) revert InvalidValueSent();
        }

        dropId = _createAirdrop(params, dropDetailsId, ethFees);

        return dropId;

    }

    function _createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId, uint256 amountSpent) internal returns (uint256) {
        uint256 dropId = lastAirdropId++;

        if(params.endTime != 0 && params.endTime <= params.startTime) revert InvalidEndDate();

        if(block.timestamp > params.startTime) revert InvalidStartTime();

        if((block.timestamp + maxDelayForAirdropStart) < params.startTime) revert MaxStartTimeExceeded();

        AirDrop memory airDrop = AirDrop({
            id: dropId,
            airdropOwner: msg.sender,
            airdropTokenAddress: params.airdropTokenAddress,
            airdropTokenAmount: params.airdropTokenAmount,
            startTime: params.startTime,
            endTime: params.endTime,
            airdropMaxParticipants: params.airdropMaxParticipants,
            requirementTokenAddress: params.requirementTokenAddress,
            requirementTokenAmount: params.requirementTokenAmount,
            airDropType: params.airDropType,
            requirementType: params.requirementType
        });

        creationTime[dropId] = block.timestamp;

        createAirdropMeta(params, dropId, amountSpent);

        airdrops[dropId] = airDrop;
        
        emit AirDropCreated(airDrop, airdropMeta[dropId], msg.sender, dropId, dropDetailsId);

        if(IERC20(params.airdropTokenAddress).transferFrom(msg.sender, address(this), params.airdropTokenAmount) == false) revert TokenTransferFailed(); 

        return dropId;
    }

    function _transferOut(uint amount, address receiver) internal {
        (bool success, ) = payable(receiver).call{value: amount}("");
        if(success == false) revert EthTransferFailed();
    }

    // calculate price based on pair reserves
    function getDarwinAmount(uint amount) public view returns(uint)
    {
        if(address(pair) == address(0)) revert PairNotSet();

        (uint Res0, uint Res1,) = pair.getReserves();

        if(pair.token1() != address(darwin)) {
            (Res0, Res1) = (Res1, Res0);
        }
        
        return((amount*Res1)/Res0); // return amount of darwin is worth inputed amount
    }

    function setWallet1(address _address) external onlyOwner {
        wallet1 = _address;
    }
    
    function setAirdropCreationPriceEth(uint256 _price) external onlyOwner {
        airdropCreationPriceEth = _price;
    }

    function setAirdropPromotionPriceEth(uint256 _price) external onlyOwner {
        airdropPromotionPriceEth = _price;
    }

    function setMaxDelayForAirdropStart(uint256 _number) external onlyOwner {
        maxDelayForAirdropStart = _number;
    }

    function setPool(address _pair) external onlyOwner {
        pair = IUniswapV2Pair(_pair);
    }

    function setFeeWhitelist(address _address, bool _value) public onlyOwner {
        feeWhitelist[_address] = _value;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
    }

    function setRecoverFeesDeadline(uint256 _newRecoverFeesDeadline) external onlyOwner {
        recoverFeesDeadline = _newRecoverFeesDeadline;
    }
}