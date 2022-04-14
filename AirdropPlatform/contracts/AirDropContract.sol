pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./AirDrop.sol";

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";




contract NotCryptoAirDrop is Initializable, ContextUpgradeable, OwnableUpgradeable {

    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;

    enum AirDropType {
        LOTTERY,
        USER_LIMITED,
        TOKEN_LIMITED
    }

    enum AirDropRequirement {
        TOKEN_REQUIRED,
        NFT_REQUIRED,
        PASSWORD

    }
    
    uint public price;

    uint public airDropId = 0;

    uint public numberAfterStartDays;

    uint public timeDifference;

    address public notCryptoAddress;

    struct AirDropToken {
        address contractAddress;
        uint256 amount;
        AirDropType airDropType;
        uint startTime;
        uint endTime;
        uint id;
        uint maxNumber;
        address requirementAddress;
        uint256 minimumAmount;
        AirDropRequirement requirement;
    }

    modifier onlyNotCrypto {
        require(msg.sender == notCryptoAddress, "Unauthorized");
      
         _;
    }

    modifier onlyAdmin (uint _id) {
        require(airdropTokenAdmin[_id] == msg.sender, "Unauthorized");

         _;
    }

    //checks whether specific airdop has been administered to the user
    mapping (uint => address) public addressToAirDrop;

    //checks Token against Id
    mapping (uint => address) public airDropToken;

    // Lists admin of an AirDrop
    mapping (uint => address) public airdropTokenAdmin;

    mapping (uint => address) public cancelledAirDrop;

    mapping (uint => AirDropToken) public airDropObject;

    mapping(address => uint256) public pendingWithdrawals;

    event AirDropTokenCreated(AirDropToken token, address indexed creatorAddress, 
    address indexed contractAddress, uint tokenId);
    
    event TokenClaimed(address indexed claimer, address indexed contractAddress);
    
    event TokenCancelled(uint id, address tokenAddress, address canceller);

    function initialize(address _notCrypto) public initializer {

        __Context_init_unchained();
        __Ownable_init_unchained();
        _NotCryptoAirDrop_init_unchained(_notCrypto);
        
    } 
    
    function _NotCryptoAirDrop_init_unchained(address _notCrypto) private initializer {
        notCryptoAddress = _notCrypto;
        price = 0.1 ether;
    }
    //creates AirDropToken
   
    function airDropTokens(address[] calldata _recipient, address tokenAddress, uint _id, uint _totalParticipants) public
    onlyAdmin(_id)
    returns (bool) {
        
        require(cancelledAirDrop[_id] != tokenAddress, "AirDrop Has Been Cancelled");

        AirDropToken memory drop = airDropObject[_id];

        require(_recipient.length <= drop.maxNumber, "AirDrop is full");

        require(_totalParticipants.length <= drop.maxNumber, "AirDrop is full");
        
        require(drop.endTime <= block.timestamp, "AirDrop is Still Active");

            
      
            for (uint256 i = 0; i < _totalParticipants.length; i++) {

                if(drop.requirement == AirDropRequirement.TOKEN_REQUIRED) {
                    require(AirDrop(drop.requirementAddress).balanceOf(_recipient[i]) >= drop.minimumAmount , "Recepient does not Qualify For Drop");
                } 
                
                else if (drop.requirement == AirDropRequirement.NFT_REQUIRED) {
                    require(AirDrop(drop.requirementAddress).balanceOf(_recipient[i]) >= 1, "Recepient does not Qualify For Drop");
                }
                
                require(addressToAirDrop[_id] != _recipient[i], "User Has Already Gotten this Drop!");

                require(AirDrop(drop.requirementAddress).balanceOf(_recipient[i]) >= drop.minimumAmount , "Recepient does not Qualify For Drop");
                
                AirDrop(tokenAddress).transfer(_recipient[i], drop.amount / _recipient.length);

                emit TokenClaimed(_recipient[i], tokenAddress);
        
        } 
        

        return true;
    }



    function cancelAirDrop(uint id, address tokenAddress) public 
    onlyNotCrypto
    {
        require(airdropTokenAdmin[id] == msg.sender || airdropTokenAdmin[id] == msg.sender , "Unauthorized");

        AirDropToken memory drop = airDropObject[id];
        
        require(drop.endTime <= block.timestamp, "AirDrop already Ended");

        cancelledAirDrop[id] = tokenAddress;

        pendingWithdrawals[airdropTokenAdmin[id]] = drop.amount;

        emit TokenCancelled(id, tokenAddress, msg.sender);

    }

    function withdraw(address _tokenAddress) public payable {
       
        uint256 amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        AirDrop(_tokenAddress).transfer(msg.sender, amount);
    }

    function setPrice(uint256 _price) public onlyNotCrypto {

         price = _price;
    }
    function setNotCryptoAddress (address _notCryptoAddress) public onlyNotCrypto {
        notCryptoAddress = _notCryptoAddress;
    }

    function setDaysAfterStart (uint _number) public onlyNotCrypto {
        numberAfterStartDays = _number;
    }

    function setDaysDifference (uint _difference) public onlyNotCrypto {
        timeDifference = _difference;
    }


    function getAirDropDetails (uint256 _id) public view returns (AirDropToken memory) {
        return airDropObject[_id];
    }

    function createAirDropToken(uint256 maxNumber, uint256 amount, address contractAddress, AirDropType _type, uint startTime, uint endTime, address requirementAddress,
        uint256 minimumAmount, AirDropRequirement requirement) public payable 
    returns (bool) {
        
        uint dropId = airDropId++;  

        uint daysDiff = (endTime - startTime);

        require (daysDiff <= timeDifference, "Time Difference Exceeded");

        require (endTime >= block.timestamp && startTime >= block.timestamp, "Invalid Date");

        require (startTime <= block.timestamp + numberAfterStartDays, "Invalid Start Date");

        require(
            AirDrop(contractAddress).balanceOf(contractAddress) >= amount,
            "Insufficient Funds"
        );


        require(msg.value >= price, "Not enough Paid to List Token");
       
        AirDrop(contractAddress).transferFrom(msg.sender, address(this), amount);
                
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

        emit AirDropTokenCreated (airDrop, msg.sender, contractAddress, dropId);
        

        return true;
    }
    
}