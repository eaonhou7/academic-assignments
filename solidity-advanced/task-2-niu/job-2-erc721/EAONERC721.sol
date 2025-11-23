// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EAONERC721 is ERC721{
    constructor(string memory name_, string memory symbol_)ERC721(name_, symbol_) {}

    function baseURI() internal pure virtual returns (string memory) {
        return "ipfs://QmZ682XBRb9wtcJwLpE39vaZUfXQKN5njSpZvuVvds5jW8/";
    }

    function mintNFT(address _to, uint256 _token) external {
        _mint(_to, _token);
    }

    function tokenURI(uint256 _tokenId) public pure override returns (string memory) {
        return string(abi.encodePacked(baseURI(), Strings.toString(_tokenId), ".json"));
    }
}