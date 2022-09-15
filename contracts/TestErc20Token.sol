pragma solidity ^0.8.4;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestErc20Token is ERC20 {
    constructor() ERC20("Darwin Drop Test Token", "DDTT") {
        _mint(msg.sender, 2500000000 * 10**decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }
}
