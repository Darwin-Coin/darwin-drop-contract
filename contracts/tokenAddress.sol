pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NotCommunityDrop is ERC20 {
    constructor() ERC20("NotCommunityDrop", "NCT") {
        _mint(msg.sender, 25 * 10 ** decimals());
    }
}