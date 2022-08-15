pragma solidity ^0.8.4;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract DarwinDrop is Initializable, ContextUpgradeable, OwnableUpgradeable {
    using AddressUpgradeable for address;

    enum AirDropType {
        LOTTERY,
        USER_LIMITED,
        TOKEN_LIMITED
    }

    enum AirDropRequirement {
        TOKEN_REQUIRED,
        NFT_REQUIRED,
        PASSWORD,
        NONE
    }

    struct AirDropToken {
        address contractAddress;
        uint256 amount;
        AirDropType airDropType;
        uint256 startTime;
        uint256 endTime;
        uint256 id;
        uint256 maxNumber;
        address requirementAddress;
        uint256 minimumAmount;
        AirDropRequirement requirement;
    }

    modifier onlyNotCommunity() {
        require(msg.sender == NotCommunityAddress, "DD::onlyNotCommunity: Unauthorized");

        _;
    }

    modifier onlyAirdropOwner(uint256 _airdropId) {
        require(airdropTokenAdmin[_airdropId] == msg.sender, "DD::onlyAirdropOwner: Unauthorized");

        _;
    }

    uint256 public airdropCreationPriceEth;
    uint256 public lastAirdropId;
    uint256 public maxDelayForAirdropStart;
    uint256 public maxAirdropDuration;

    address public NotCommunityAddress;

    //checks whether specific airdop has been administered to the user
    mapping(uint256 => address) public addressToAirDrop;

    //checks Token against Id
    mapping(uint256 => address) public airDropToken;

    // Lists admin of an AirDrop
    mapping(uint256 => address) public airdropTokenAdmin;

    mapping(uint256 => address) public cancelledAirDrop;

    mapping(uint256 => AirDropToken) public airDropObject;

    mapping(address => uint256) public pendingWithdrawals;

    event AirDropTokenCreated(AirDropToken token, address indexed creatorAddress, address indexed contractAddress, uint256 dropId, uint256 dropDetailsId);

    event TokenClaimed(address indexed claimer, address indexed contractAddress);

    event TokenCancelled(uint256 id, address tokenAddress, address canceller);

    function initialize(address _NotCommunity) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __NotDrop_init_unchained(_NotCommunity);
    }

    function __NotDrop_init_unchained(address _NotCommunity) private onlyInitializing {
        NotCommunityAddress = _NotCommunity;

        airdropCreationPriceEth = 0.1 ether;

        lastAirdropId = 0;
        maxDelayForAirdropStart = 15 days;
        maxAirdropDuration = 10 days;
    }

    //creates AirDropToken
    function airDropTokens(
        address[] calldata _recipient,
        address tokenAddress,
        uint256 _id,
        uint256 _totalParticipants
    ) public onlyAirdropOwner(_id) returns (bool) {
        require(cancelledAirDrop[_id] != tokenAddress, "AirDrop Has Been Cancelled");

        AirDropToken memory drop = airDropObject[_id];

        require(_recipient.length <= drop.maxNumber, "AirDrop is full");

        require(_totalParticipants <= drop.maxNumber, "AirDrop is full");

        require(drop.endTime <= block.timestamp, "AirDrop is Still Active");

        for (uint256 i = 0; i < _totalParticipants; i++) {
            if (drop.requirement == AirDropRequirement.TOKEN_REQUIRED) {
                require(IERC20(drop.requirementAddress).balanceOf(_recipient[i]) >= drop.minimumAmount, "Recepient does not Qualify For Drop");
            } else if (drop.requirement == AirDropRequirement.NFT_REQUIRED) {
                require(IERC20(drop.requirementAddress).balanceOf(_recipient[i]) >= 1, "Recepient does not Qualify For Drop");
            }

            require(addressToAirDrop[_id] != _recipient[i], "User Has Already Gotten this Drop!");

            IERC20(tokenAddress).transfer(_recipient[i], drop.amount / _totalParticipants);

            emit TokenClaimed(_recipient[i], tokenAddress);
        }

        return true;
    }

    function cancelAirDrop(uint256 id, address tokenAddress) public {
        require(airdropTokenAdmin[id] == msg.sender || NotCommunityAddress == msg.sender, "Unauthorized");

        AirDropToken memory drop = airDropObject[id];

        require(drop.endTime >= block.timestamp, "AirDrop already Ended");

        cancelledAirDrop[id] = tokenAddress;

        pendingWithdrawals[airdropTokenAdmin[id]] = drop.amount;

        emit TokenCancelled(id, tokenAddress, msg.sender);
    }

    function withdraw(address _tokenAddress) public payable {
        uint256 amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        IERC20(_tokenAddress).transfer(msg.sender, amount);
    }

    function setPrice(uint256 _price) public onlyNotCommunity {
        airdropCreationPriceEth = _price;
    }

    function setNotCommunityAddress(address _NotCommunityAddress) public onlyNotCommunity {
        NotCommunityAddress = _NotCommunityAddress;
    }

    function setMaxDelayForAirdropStart(uint256 _number) public onlyNotCommunity {
        maxDelayForAirdropStart = _number;
    }

    function setDaysDifference(uint256 _difference) public onlyNotCommunity {
        maxAirdropDuration = _difference;
    }

    function getAirDropDetails(uint256 _id) public view returns (AirDropToken memory) {
        return airDropObject[_id];
    }

    function createAirDropToken(
        uint256 maxNumber,
        uint256 amount,
        address contractAddress,
        AirDropType _type,
        uint256 startTime,
        uint256 endTime,
        address requirementAddress,
        uint256 minimumAmount,
        AirDropRequirement requirement,
        uint256 dropDetailsId
    ) public payable returns (uint256) {
        uint256 dropId = lastAirdropId++;

        require(endTime >= block.timestamp, "Invalid End Date");

        require((block.timestamp + maxDelayForAirdropStart * 1 days) > startTime, "Invalid Start Date");

        uint256 daysDiff = (endTime - startTime) / 60 / 60 / 24;

        require(daysDiff <= maxAirdropDuration, "Time Difference Exceeded");

        require(IERC20(contractAddress).balanceOf(msg.sender) >= amount, "Insufficient Funds");

        require(msg.value >= airdropCreationPriceEth, "Not enough Paid to List Token");

        IERC20(contractAddress).transferFrom(msg.sender, address(this), amount);

        airdropTokenAdmin[dropId] = msg.sender;

        AirDropToken memory airDrop = AirDropToken(
            contractAddress,
            amount,
            _type,
            startTime,
            endTime,
            dropId,
            maxNumber,
            requirementAddress,
            minimumAmount,
            requirement
        );

        airDropToken[dropId] = contractAddress;

        airDropObject[dropId] = airDrop;

        emit AirDropTokenCreated(airDrop, msg.sender, contractAddress, dropId, dropDetailsId);

        return dropId;
    }
}
