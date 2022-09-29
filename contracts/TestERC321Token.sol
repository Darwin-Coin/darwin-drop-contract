pragma solidity ^0.8.4;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestErc321Token is ERC721 {
    constructor() ERC721("Darwin Drop Test NFT", "DDTNFT") {
        for (uint256 i = 0; i < 100; i++) {
            _mint(msg.sender, i);
        }
    }
}
