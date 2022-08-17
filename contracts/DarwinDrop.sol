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
    event TokenClaimed(address indexed claimer, address indexed airdropTokenAddress, uint256 amount);
    event AirdropCancelled(uint256 id, address tokenAddress, address canceller);
    event AirdropDistributed(uint256 id, address tokenAddress);

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
    uint256 public maxAirdropDuration;

    address public darwinCommunityAddress;

    //checks whether specific airdop has been administered to the user
    mapping(uint256 => address) public airdropRecepients;
    mapping(uint256 => AirDrop) public airdrops;
    mapping(uint256 => AirdropMeta) public airdropMeta;

    mapping(address => uint256) public pendingWithdrawals;

    function initialize(address _NotCommunity) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __NotDrop_init_unchained(_NotCommunity);
    }

    function __NotDrop_init_unchained(address _NotCommunity) private onlyInitializing {
        darwinCommunityAddress = _NotCommunity;

        airdropCreationPriceEth = 0.1 ether;

        lastAirdropId = 0;
        maxDelayForAirdropStart = 15 days;
        maxAirdropDuration = 20 days;
    }

    //distribute tokens to participants
    function airDropTokens(
        address[] calldata _recipient,
        uint256 _id,
        uint256 _totalParticipants
    ) public onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        require(meta.status != AirdropStatus.CANCELLED, "DD::airDropTokens: airDrop has been cancelled");

        AirDrop memory drop = airdrops[_id];

        require(_recipient.length <= drop.airdropMaxParticipants && _totalParticipants <= drop.airdropMaxParticipants, "DD::airDropTokens: airDrop is full");

        require(drop.endTime <= block.timestamp, "DD::airDropTokens:AirDrop is still active");

        uint256 airdropAmount = drop.airDropType == AirDropType.TOKEN_LIMITED ? drop.tokensPerUser : drop.airdropTokenAmount / _totalParticipants;

        for (uint256 i = 0; i < _recipient.length; i++) {
            if (drop.requirementType == AirDropRequirementType.TOKEN_REQUIRED) {
                require(
                    IERC20(drop.requirementTokenAddress).balanceOf(_recipient[i]) >= drop.requirementTokenAmount,
                    "DD::airDropTokens: Recepient does have requirement tokens"
                );
            } else if (drop.requirementType == AirDropRequirementType.NFT_REQUIRED) {
                require(IERC20(drop.requirementTokenAddress).balanceOf(_recipient[i]) >= 1, "DD::airDropTokens: Recepient does have requirement tokens");
            }

            require(airdropRecepients[_id] != _recipient[i], "DD::airDropTokens: user has already got this drop!");

            IERC20(drop.airdropTokenAddress).transfer(_recipient[i], airdropAmount);

            emit TokenClaimed(_recipient[i], drop.airdropTokenAddress, airdropAmount);
        }

        meta.status = AirdropStatus.TOKEN_DISTRIBUTED;
        meta.distributedTokens += _recipient.length * airdropAmount;
    }

    function cancelAirDrop(uint256 id, address tokenAddress) public {
        AirDrop memory drop = airdrops[id];
        AirdropMeta storage meta = airdropMeta[id];

        require(drop.airdropOwner == msg.sender || darwinCommunityAddress == msg.sender, "DD::cancelAirDrop: Unauthorized");

        require(drop.endTime >= block.timestamp, "DD::cancelAirDrop: airDrop already ended");

        require(meta.status == AirdropStatus.ACTIVE, "DD::cancelAirDrop: airDrop already cancelled");

        meta.status = AirdropStatus.CANCELLED;
        meta.ownerWithdrawnTokens = drop.airdropTokenAmount;

        IERC20(drop.airdropTokenAddress).transfer(msg.sender, drop.airdropTokenAmount);

        if (address(this).balance >= meta.ethSpent) {
            payable(msg.sender).transfer(meta.ethSpent);
        }

        emit AirdropCancelled(id, tokenAddress, msg.sender);
    }

    function withdrawRemainingTokens(uint256 _id) public onlyAirdropOwner(_id) {
        AirdropMeta storage meta = airdropMeta[_id];

        require(meta.status != AirdropStatus.ACTIVE, "DD::cancelAirDrop: airDrop is active");

        uint256 remainingTokensAmount = airdrops[_id].airdropTokenAmount - meta.distributedTokens - meta.ownerWithdrawnTokens;

        meta.ownerWithdrawnTokens += remainingTokensAmount;

        IERC20(airdrops[_id].airdropTokenAddress).transfer(msg.sender, remainingTokensAmount);
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

    function setMaxAirdropDuration(uint256 _difference) public onlyNotCommunity {
        maxAirdropDuration = _difference;
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
            ownerWithdrawnTokens: 0,
            isPromoted: params.isPromoted,
            status: AirdropStatus.ACTIVE
        });
    }

    function createAirdrop(CreateAirDropParams calldata params, uint256 dropDetailsId) public payable returns (uint256) {
        uint256 dropId = lastAirdropId++;

        require(params.endTime >= block.timestamp, "DD::createAirdrop: invalid end date");

        require((block.timestamp + maxDelayForAirdropStart) > params.startTime, "DD::createAirdrop: too late start time");

        require(params.endTime - params.startTime <= maxAirdropDuration, "DD::createAirdrop: large airdrop duration");

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
