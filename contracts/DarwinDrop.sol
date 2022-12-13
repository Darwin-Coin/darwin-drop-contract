pragma solidity 0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IDarwinDrop.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract DarwinDrop is IDarwinDrop, UUPSUpgradeable, OwnableUpgradeable {

    modifier onlyCommunity() {
        if(msg.sender != darwinCommunityAddress) revert NotDarwinCommunity();
        _;
    }

    modifier onlyAirdropOwner(uint256 _airdropId) {
        if(airdrops[_airdropId].airdropOwner != msg.sender) revert NotAirdropOwner();
        _;
    }

    uint256 public airdropCreationPriceEth;
    uint256 public airdropPromotionPriceEth;
    uint256 public lastAirdropId;
    uint256 public maxDelayForAirdropStart;
    uint256 public maxAirdropDuration;

    address public darwinCommunityAddress;
    address public DarwinTeamAddress;

    mapping(uint256 => AirDrop) public airdrops;
    mapping(uint256 => AirdropMeta) public airdropMeta;
    mapping(address => bool) public feeWhitelist;

    IUniswapV2Pair pair;

    IERC20 darwin;

    function initialize(address _community, address _darwin) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __DarwinDrop_init_unchained(_community, _darwin);
        __UUPSUpgradeable_init_unchained();
    }

    function __DarwinDrop_init_unchained(address _community, address _darwin) private onlyInitializing {
        darwinCommunityAddress = _community;

        airdropCreationPriceEth = 0.1 ether;
        airdropPromotionPriceEth = 1 ether;

        maxDelayForAirdropStart = 15 days;
        maxAirdropDuration = 20 days;

        darwin = IERC20(_darwin);

    }

    //distribute tokens to participants
    function airDropTokens(address[] calldata _recipient, uint256 _id) external onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        if(meta.status != AirdropStatus.ACTIVE) revert AirdropNotActive();

        AirDrop memory drop = airdrops[_id];

        if(_recipient.length > drop.airdropMaxParticipants) revert AirdropFull();

        if(drop.endTime > block.timestamp) revert AirdropStillInProgress();

        uint256 airdropAmount = drop.airDropType == AirDropType.TOKEN_LIMITED ? drop.tokensPerUser : drop.airdropTokenAmount / _recipient.length;

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

        _transferOut(meta.feesPayed, darwinCommunityAddress, meta.payedWithDarwin);

        emit AirdropDistributed(_id, meta.distributedTokens, meta.recepientCount, _recipient);
    }

    function cancelAirDrop(uint256 id) external {
        AirDrop memory drop = airdrops[id];
        AirdropMeta storage meta = airdropMeta[id];

        if(drop.airdropOwner != msg.sender && darwinCommunityAddress != msg.sender) revert UnauthorizedToCancel();

        if(drop.endTime < block.timestamp) revert AirdropOver();

        if(meta.status != AirdropStatus.ACTIVE) revert AirdropAlreadyCanceled();

        meta.status = AirdropStatus.CANCELLED;
        meta.ownerWithdrawnTokens = drop.airdropTokenAmount;

        if(IERC20(drop.airdropTokenAddress).transfer(drop.airdropOwner, drop.airdropTokenAmount) == false) revert TokenTransferFailed();

        _transferOut(meta.feesPayed, drop.airdropOwner, meta.payedWithDarwin);

        emit AirdropCancelled(id, msg.sender);
    }

    function withdrawRemainingTokens(uint256 _id) external onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        if(meta.status == AirdropStatus.ACTIVE) revert AirdropActive();

        uint256 remainingTokensAmount = airdrops[_id].airdropTokenAmount - meta.distributedTokens - meta.ownerWithdrawnTokens;

        meta.ownerWithdrawnTokens += remainingTokensAmount;

        IERC20(airdrops[_id].airdropTokenAddress).transfer(msg.sender, remainingTokensAmount);
    }


    function getAirDropDetails(uint256 _id) external view returns (AirDrop memory, AirdropMeta memory) {

        return (airdrops[_id], airdropMeta[_id]);
    }

    function createAirdropMeta(
        CreateAirDropParams calldata params,
        uint256 dropId,
        uint256 feesPayed,
        bool payedWithDarwin
    ) private {
        airdropMeta[dropId] = AirdropMeta({
            feesPayed: feesPayed,
            distributedTokens: 0,
            recepientCount: 0,
            ownerWithdrawnTokens: 0,
            isPromoted: params.isPromoted,
            payedWithDarwin: payedWithDarwin,
            status: AirdropStatus.ACTIVE
        });
    }

    function createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId) external payable returns (uint256 dropId) {

        uint256 ethFees;

        if(feeWhitelist[msg.sender] == false) {
            ethFees = params.isPromoted ? airdropCreationPriceEth + airdropPromotionPriceEth : airdropCreationPriceEth;
            if(msg.value != ethFees) revert InvalidValueSent();
        }

        dropId = _createAirdrop(params, dropDetailsId, ethFees, false);
        
         if (ethFees != 0 ) {
            (bool sent, bytes memory data) = DarwinTeamAddress.call{value: ethSpent}("");
            require(sent, "Failed to send Ether");
         }

        return dropId;

    }

    function createAirdropWithDarwin(CreateAirDropParams calldata params, uint256 dropDetailsId) external returns (uint256 dropId) {

        uint amountDarwin;

        if(feeWhitelist[msg.sender] == false) {
            uint256 ethFees = params.isPromoted ? airdropCreationPriceEth + airdropPromotionPriceEth : airdropCreationPriceEth;
            amountDarwin = getDarwinAmount(ethFees);
        }

        dropId = _createAirdrop(params, dropDetailsId, amountDarwin, true);
        if(amountDarwin > 0) {
            if(!darwin.transferFrom(msg.sender, address(this), amountDarwin)) revert TokenTransferFailed();

        }

    }

    function _createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId, uint256 amountSpent, bool payedWithDarwin) internal returns (uint256) {
        uint256 dropId = lastAirdropId++;

        if(params.endTime < block.timestamp) revert InvalidEndDate();

        if(block.timestamp > params.startTime) revert InvalidStartTime();

        if((block.timestamp + maxDelayForAirdropStart) < params.startTime) revert MaxStartTimeExceeded();

        if(params.endTime - params.startTime > maxAirdropDuration) revert MaxDurationExceeded();

        AirDrop memory airDrop = AirDrop({
            id: dropId,
            airdropOwner: msg.sender,
            airdropTokenAddress: params.airdropTokenAddress,
            airdropTokenAmount: params.airdropTokenAmount,
            tokensPerUser: params.tokensPerUser,
            startTime: params.startTime,
            endTime: params.endTime,
            airdropMaxParticipants: params.airdropMaxParticipants,
            requirementTokenAddress: params.requirementTokenAddress,
            requirementTokenAmount: params.requirementTokenAmount,
            airDropType: params.airDropType,
            requirementType: params.requirementType
        });

        createAirdropMeta(params, dropId, amountSpent, payedWithDarwin);

        airdrops[dropId] = airDrop;
        
        emit AirDropCreated(airDrop, airdropMeta[dropId], msg.sender, dropId, dropDetailsId);

        if(IERC20(params.airdropTokenAddress).transferFrom(msg.sender, address(this), params.airdropTokenAmount) == false) revert TokenTransferFailed(); 

        return dropId;
    }

    function _transferOut(uint amount, address receiver, bool transferDarwin) internal {
        if(transferDarwin) {
            if(darwin.transfer(receiver, amount) == false) revert TokenTransferFailed();
        } else {
            (bool success, ) = receiver.call{value: amount}("");
            if(success == false) revert EthTransferFailed();
        }
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

    function setAirdropCreationPriceEth(uint256 _price) external onlyCommunity {
        airdropCreationPriceEth = _price;
    }

    function setAirdropPromotionPriceEth(uint256 _price) external onlyCommunity {
        airdropPromotionPriceEth = _price;
    }

    function setCommunityAddress(address _CommunityAddress) external onlyCommunity {
        darwinCommunityAddress = _CommunityAddress;
    }

    function setMaxDelayForAirdropStart(uint256 _number) external onlyCommunity {
        maxDelayForAirdropStart = _number;
    }

    function setMaxAirdropDuration(uint256 _difference) external onlyCommunity {
        maxAirdropDuration = _difference;
    }

    function setPool(address _pair) external onlyCommunity {
        pair = IUniswapV2Pair(_pair);
    }

    function setFeeWhitelist(address _address, bool _value) external onlyCommunity {

        feeWhitelist[_address] = _value;

    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {

    }
}
