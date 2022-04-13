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
    
    uint public price;

    uint public airDropId = 0;

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
    }

    modifier onlyNotCrypto {
        require(msg.sender == notCryptoAddress, "Only NotContract Authorized can change the Address");
      
         _;
    }

    modifier onlyAdmin (uint _id) {
        require(airdropTokenAdmin[_id] == msg.sender);

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

    event AirDropTokenCreated(AirDropToken token, address indexed creatorAddress, 
    address indexed contractAddress, uint tokenId);
    
    event TokenClaimed(address indexed claimer, address indexed contractAddress);
    
    event TokenCancelled(uint id, address tokenAddress);

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
   
    function airDropTokens(address[] memory _recipient, address tokenAddress, uint _id) public
    onlyNotCrypto
    onlyAdmin(_id)
    returns (bool) {
        
        require(cancelledAirDrop[_id] != tokenAddress, "AirDrop Has Been Cancelled");

        AirDropToken memory drop = airDropObject[_id];

        require(_recipient.length <= drop.maxNumber, "maximum number of participants reached for Drop ");

        require(drop.endTime >= block.timestamp, "AirDrop is Still Active");

        require (block.timestamp >= drop.startTime, "Drop has not yet started");

      
            for (uint256 i = 0; i < _recipient.length; i++) {
                
                require(addressToAirDrop[_id] != _recipient[i], "User Has Already Gotten this Drop!");

                require(AirDrop(drop.requirementAddress).balanceOf(_recipient[i]) >= drop.minimumAmount , "Recepient does not Qualify For Drop");
                
                AirDrop(tokenAddress).transfer(_recipient[i], drop.amount / _recipient.length);

                emit TokenClaimed(_recipient[i], tokenAddress);
        
        } 
        
        
     

        return true;
    }



    function cancelAirDrop(uint id, address tokenAddress) public onlyAdmin(id)
    onlyNotCrypto
    onlyAdmin(id)
    {
        

        cancelledAirDrop[id] = tokenAddress;

        emit TokenCancelled(id, tokenAddress);

    }

    function setPrice(uint256 _price) public onlyNotCrypto {

         price = _price;
    }
    function setNotCryptoAddress (address _notCryptoAddress) public onlyNotCrypto {
        notCryptoAddress = _notCryptoAddress;
    }


    function getAirDropDetails (uint256 _id) public view returns (AirDropToken memory) {
        return airDropObject[_id];
    }

    function createAirDropToken(uint256 maxNumber, uint256 amount, address contractAddress, AirDropType _type, uint startTime, uint endTime, address requirementAddress,
        uint256 minimumAmount) public payable 
    returns (bool) {
        
        uint dropId = airDropId++;

        require(
            AirDrop(contractAddress).balanceOf(contractAddress) >= amount,
            "You Do Not Have Enough Tokens In Your Contract To Create AirDrop. Please Add More"
        );


        require(msg.value >= price, "Not enough Paid to List Token");
       
        payable(contractAddress).transfer(amount);
                
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
        minimumAmount
        );

        airDropToken[dropId] = contractAddress;


        airDropObject[dropId] = airDrop;

        emit AirDropTokenCreated (airDrop, msg.sender, contractAddress, dropId);
        

        return true;
    }
    
}