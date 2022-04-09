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
        PASSWORD_PROTECTED,
        STANDARD
    }
    
    uint public price;

    uint public airDropId = 0;

    address public notCryptoAddress;

    struct AirDropToken {
        address contractAddress;
        uint256 amount;
        AirDropType airDroptype;
        uint id;
    }

    modifier onlyNotCrypto {
        require(msg.sender == notCryptoAddress, "Only NotContract Authorized can change the Address");
      
    }

    modifier onlyAdmin (address _sender) {

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
        _NotCryptoAirDrop_init_unchained();
        
    } 
    
    function _NotCryptoAirDrop_init_unchained(address _notCrypto) private initializer {
        notCryptoAddress = _notCrypto;
        price = 0.1 ether;
    }
    //creates AirDropToken
   
    function airDropTokens(address[] memory _recipient, address tokenAdress, uint256 amount, uint _id) public returns (bool) {
        
        require(airdropTokenAdmin[airDropId++] == msg.sender, "Only token Owner can allocate the tokens");
         
        require (cancelledAirDrop[_id] != tokenAddress, "AirDrop Has Been Cancelled");

        AirDropToken memory drop = airDropObject[_id];

        if (drop.airDroptype = AirDropType.STANDARD) {
            for (uint256 i = 0; i < _recipient.length; i++) {
                require(addressToAirDrop[tokenAdress] != _recipient[i], "User Has Already Gotten this Drop!");

                AirDrop(tokenAdress).transfer(_recipient[i], amount);

                emit TokenClaimed(_recipient[i], tokenAdress);
            } 
        }
        else if (drop.airDropType == AirDropType.PASSWORD_PROTECTED) {

            }
        

        

        return true;
    }

    function cancelAirDrop(uint id, address tokenAddress) public {
        
        require(msg.sender == airdropTokenAdmin[tokenAdress]);


        cancelledAirDrop[_id] = tokenAddress;

        emit TokenCancelled(id, tokenAddress);

    }

    function setPrice(uint256 _price) public onlyNotCrypto {

         price = _price;
    }
    function setNotCryptoAddress (address _notCryptoAddress) public onlyNotCrypto {
        notCryptoAddress = _notCryptoAddress;
    }


    function getAirDropDetails (uint256 _id) public view returns (AirDropToken) {
        return airDropObject[_id];
    }
    function createAirDropToken(uint256 amount, address contractAddress, AirDropType _type) public payable 
    returns (bool) {
        
        
        require(
            AirDrop(contractAddress).balanceOf(contractAddress) >= amount,
            "You Do Not Have Enough Tokens In Your Contract To Create AirDrop. Please Add More"
        );


        require(msg.value >= price, "Not enough Paid to List Token");
       
        payable(contractAddress).transfer(amount);
                
        airdropTokenAdmin[airDropId++] = msg.sender;
        
        AirDropToken memory airDrop = AirDropToken(
                contractAddress,
                amount,
                airDropId++,
                _type
        );

        airDropToken[airDropId++] = contactAddress;


        airDropObject[airDropId++] = airDrop;

        emit AirDropTokenCreated (airDrop, msg.sender, contractAddress);
        

        return true;
    }
    
}