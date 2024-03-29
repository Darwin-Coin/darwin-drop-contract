pragma solidity 0.8.14;

// SPDX-License-Identifier: MIT

interface IDarwinDrop {

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
        uint256 startTime;
        uint256 endTime;
        uint256 airdropMaxParticipants;
        address requirementTokenAddress;
        uint256 requirementTokenAmount;
        bool isPromoted;
        AirDropType airDropType;
        AirDropRequirementType requirementType;
    }

    event AirDropCreated(AirDrop airdrop, AirdropMeta meta, address indexed creatorAddress, uint256 dropId, uint256 dropDetailsId);
    event AirdropCancelled(uint256 id, address canceller);
    event AirdropDistributed(uint256 id, uint256 totalAmount, uint256 totalRecepients, address[] recepients);
    event AirdropEnded(uint256 id);

    error AirdropNotActive();
    error AirdropFull();
    error AirdropStillInProgress();
    error NotAirdropOwner();
    error NotDarwinCommunity();
    error PairNotSet();
    error InvalidValueSent();
    error InvalidEndDate();
    error MaxStartTimeExceeded();
    error MaxDurationExceeded();
    error EthTransferFailed();
    error TokenTransferFailed();
    error UnauthorizedToCancel();
    error AirdropOver();
    error AirdropAlreadyCanceled();
    error AirdropActive();
    error InvalidStartTime();
    error AirdropHasEndTime();
}