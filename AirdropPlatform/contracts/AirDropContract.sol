pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./AirDrop.sol";

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";



import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";




contract NotCryptoAirDrop is Initializable, ContextUpgradeable, OwnableUpgradeable {

    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;
    
    uint public price;

    address public notCryptoAddress;

    struct AirDropToken {
        string coinName;
        address contractAddress;
        uint256 amount;
    }

       //checks whether specific airdop has been administered to the user
    mapping (address => address) public addressToAirDrop;

    //checks Token against Contract Address
    mapping (address => AirDropToken) public airDropToken;

    // Lists admin of a token
    mapping (address => address) public airdropTokenAdmin;

    

    event AirDropTokenCreated(AirDropToken token, address indexed creatorAddress, address indexed contractAddress);

    
    event TokenClaimed(address indexed claimer, address indexed contractAddress);
    
    function initialize(address _notCrypto) public initializer {
        notCryptoAddress = _notCrypto;
        price = 0.1 ether;
    }  
    //creates AirDropToken
    function createAirDropToken(uint256 amount, address contractAddress, string memory coinName) public payable 
    returns (bool) {
        
        
        require(
            AirDrop(contractAddress).balanceOf(contractAddress) >= amount,
            "You Do Not Have Enough Tokens In Your Contract To Create AirDrop. Please Add More"
        );


        require(msg.value >= price, "Not enough Paid to List Token");
        
        
        airdropTokenAdmin[contractAddress] = msg.sender;
        
        AirDropToken memory airDrop = AirDropToken(
                coinName,
                contractAddress,
                amount

        );

        airDropToken[contractAddress] = airDrop;

        emit AirDropTokenCreated (airDropToken[contractAddress], msg.sender, contractAddress);
        

        return true;
    }

    function airDropTokens(address[] memory _recipient, address tokenAdress, uint256 amount) public returns (bool) {
        for (uint256 i = 0; i < _recipient.length; i++) {
            require(airdropTokenAdmin[tokenAdress] == msg.sender, "Only token Owner can allocate the tokens");
            require(addressToAirDrop[tokenAdress] != _recipient[i], "User Has Already Gotten this Drop!");

            AirDrop(tokenAdress).transfer(_recipient[i], amount);

            emit TokenClaimed(_recipient[i], tokenAdress);
        }

        return true;
    }

    function setPrice(uint256 _price) public {

        require(msg.sender == notCryptoAddress, "Only NotContract Authorized can set the Price");
        price = _price;
    }


    function setNotCryptoAddress (address _notCryptoAddress) public {
        require(msg.sender == notCryptoAddress, "Only NotContract Authorized can change the Address");
      
        notCryptoAddress = _notCryptoAddress;
    }
    
}