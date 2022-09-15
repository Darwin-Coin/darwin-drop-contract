pragma solidity ^0.8.4;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract DarwinDrop is Initializable, ContextUpgradeable, OwnableUpgradeable {
    using AddressUpgradeable for address;

    event AirDropCreated(AirDrop airdrop, AirdropMeta meta, address indexed creatorAddress, uint256 dropId, uint256 dropDetailsId);
    event AirdropCancelled(uint256 id, address canceller);
    event AirdropDistributed(uint256 id, uint256 totalAmount, uint256 totalRecepients, address[] recepients, bool[] tokenReceived);
    event AirdropEnded(uint256 id);

    enum AirDropType {
        LOTTERY,
        USER_LIMITED,
        TOKEN_LIMITED
    }

    enum AirDropRequirementType {
        TOKEN_REQUIRED,
        NFT_REQUIRED,
        PASSWORD,
        NONE
    }

    enum AirdropStatus {
        ACTIVE,
        CANCELLED,
        TOKEN_DISTRIBUTED
    }

    struct AirDrop {
        uint256 id;
        address airdropOwner;
        address airdropTokenAddress;
        uint256 airdropTokenAmount;
        uint256 tokensPerUser;
        uint256 startTime;
        uint256 endTime;
        uint256 airdropMaxParticipants;
        address requirementTokenAddress;
        uint256 requirementTokenAmount;
        AirDropType airDropType;
        AirDropRequirementType requirementType;
    }

    struct AirdropMeta {
        uint256 ethSpent;
        uint256 distributedTokens;
        uint256 recepientCount;
        uint256 ownerWithdrawnTokens;
        bool isPromoted;
        AirdropStatus status;
    }

    struct CreateAirDropParams {
        address airdropTokenAddress;
        uint256 airdropTokenAmount;
        uint256 tokensPerUser;
        uint256 startTime;
        uint256 endTime;
        uint256 airdropMaxParticipants;
        address requirementTokenAddress;
        uint256 requirementTokenAmount;
        bool isPromoted;
        AirDropType airDropType;
        AirDropRequirementType requirementType;
    }

    modifier onlyNotCommunity() {
        require(msg.sender == darwinCommunityAddress, "DD::onlyNotCommunity: Unauthorized");

        _;
    }

    modifier onlyAirdropOwner(uint256 _airdropId) {
        require(airdrops[_airdropId].airdropOwner == msg.sender, "DD::onlyAirdropOwner: Unauthorized");

        _;
    }

    uint256 public airdropCreationPriceEth;
    uint256 public airdropPromotionPriceEth;
    uint256 public lastAirdropId;
    uint256 public maxDelayForAirdropStart;

    address public darwinCommunityAddress;

    mapping(uint256 => AirDrop) public airdrops;
    mapping(uint256 => AirdropMeta) public airdropMeta;

    function initialize(address _NotCommunity) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __NotDrop_init_unchained(_NotCommunity);
    }

    function __NotDrop_init_unchained(address _NotCommunity) private onlyInitializing {
        darwinCommunityAddress = _NotCommunity;

        airdropCreationPriceEth = 0.1 ether;
        airdropPromotionPriceEth = 1 ether;

        lastAirdropId = 0;
        maxDelayForAirdropStart = 15 days;
    }

    //distribute tokens to participants
    function airDropTokens(address[] calldata _recipient, uint256 _id) public onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        require(meta.status == AirdropStatus.ACTIVE, "DD::airDropTokens: airDrop is not active");

        AirDrop memory drop = airdrops[_id];

        require(_recipient.length <= drop.airdropMaxParticipants, "DD::airDropTokens: airDrop is full");

        require(drop.endTime == 0 || drop.endTime <= block.timestamp, "DD::airDropTokens:AirDrop is still active");

        uint256 airdropAmount = drop.airDropType == AirDropType.TOKEN_LIMITED ? drop.tokensPerUser : drop.airdropTokenAmount / _recipient.length;

        bool[] memory airdropReceived = new bool[](_recipient.length);
        uint256 usersNotReceivingTokens = 0;

        for (uint256 i = 0; i < _recipient.length; ) {
            if (drop.requirementType == AirDropRequirementType.TOKEN_REQUIRED || drop.requirementType == AirDropRequirementType.NFT_REQUIRED) {
                if (IERC20(drop.requirementTokenAddress).balanceOf(_recipient[i]) < drop.requirementTokenAmount) {
                    airdropReceived[i] = false;
                    unchecked {
                        ++i;
                        ++usersNotReceivingTokens;
                    }
                    continue;
                }
            }

            IERC20(drop.airdropTokenAddress).transfer(_recipient[i], airdropAmount);

            airdropReceived[i] = true;

            unchecked {
                ++i;
            }
        }

        meta.status = AirdropStatus.TOKEN_DISTRIBUTED;
        meta.distributedTokens += (_recipient.length - usersNotReceivingTokens) * airdropAmount;
        meta.recepientCount += (_recipient.length - usersNotReceivingTokens);

        emit AirdropDistributed(_id, meta.distributedTokens, meta.recepientCount, _recipient, airdropReceived);
    }

    function cancelAirDrop(uint256 id) public {
        AirDrop memory drop = airdrops[id];
        AirdropMeta storage meta = airdropMeta[id];

        require(drop.airdropOwner == msg.sender || darwinCommunityAddress == msg.sender, "DD::cancelAirDrop: Unauthorized");

        require(drop.endTime == 0 || drop.endTime >= block.timestamp, "DD::cancelAirDrop: airDrop already ended");

        require(meta.status == AirdropStatus.ACTIVE, "DD::cancelAirDrop: airDrop is not active");

        meta.ownerWithdrawnTokens = drop.airdropTokenAmount;

        IERC20(drop.airdropTokenAddress).transfer(drop.airdropOwner, drop.airdropTokenAmount);

        _cancleAirdrop(id);
    }

    function _cancleAirdrop(uint256 id) private {
        AirdropMeta storage meta = airdropMeta[id];
        meta.status = AirdropStatus.CANCELLED;

        if (meta.ethSpent > airdropCreationPriceEth) {
            uint256 extraTokens = meta.ethSpent - airdropCreationPriceEth;

            if (address(this).balance >= extraTokens) {
                payable(airdrops[id].airdropOwner).transfer(extraTokens);
            }
        }

        emit AirdropCancelled(id, msg.sender);
    }

    function withdrawRemainingTokens(uint256 _id) public onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        require(meta.status != AirdropStatus.CANCELLED, "DD::withdrawRemainingTokens: airdrop has been cancelled");

        if (meta.status == AirdropStatus.ACTIVE) {
            _cancleAirdrop(_id);
        }

        uint256 remainingTokensAmount = airdrops[_id].airdropTokenAmount - meta.distributedTokens - meta.ownerWithdrawnTokens;

        meta.ownerWithdrawnTokens += remainingTokensAmount;

        IERC20(airdrops[_id].airdropTokenAddress).transfer(msg.sender, remainingTokensAmount);
    }

    function endAirDrop(uint256 _id) public onlyAirdropOwner(_id) {
        require(airdropMeta[_id].status == AirdropStatus.ACTIVE, "DD::endAirDrop: Airdrop is not active");
        require(airdrops[_id].endTime == 0, "DD::endAirDrop: Can't end airdrop with preddefined end time");

        airdrops[_id].endTime = block.timestamp;

        emit AirdropEnded(_id);
    }

    function setAirdropCreationPriceEth(uint256 _price) public onlyNotCommunity {
        airdropCreationPriceEth = _price;
    }

    function setNotCommunityAddress(address _NotCommunityAddress) public onlyNotCommunity {
        darwinCommunityAddress = _NotCommunityAddress;
    }

    function setMaxDelayForAirdropStart(uint256 _number) public onlyNotCommunity {
        maxDelayForAirdropStart = _number;
    }

    function getAirDropDetails(uint256 _id) public view returns (AirDrop memory, AirdropMeta memory) {
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

    function createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId) public payable returns (uint256) {
        uint256 dropId = lastAirdropId++;

        require(params.endTime == 0 || params.endTime >= block.timestamp, "DD::createAirdrop: invalid end date");

        require((block.timestamp + maxDelayForAirdropStart) > params.startTime, "DD::createAirdrop: too late start time");

        uint256 ethSpent = params.isPromoted ? airdropCreationPriceEth + airdropPromotionPriceEth : airdropCreationPriceEth;

        require(msg.value >= ethSpent, "DD::createAirdrop: not enough base token sent");

        IERC20(params.airdropTokenAddress).transferFrom(msg.sender, address(this), params.airdropTokenAmount);

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

        createAirdropMeta(params, dropId, ethSpent);

        airdrops[dropId] = airDrop;

        if (msg.value > ethSpent) {
            payable(msg.sender).transfer(msg.value - ethSpent);
        }

        emit AirDropCreated(airDrop, airdropMeta[dropId], msg.sender, dropId, dropDetailsId);

        return dropId;
    }
}
