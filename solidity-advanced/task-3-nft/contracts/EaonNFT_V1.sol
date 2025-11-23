// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EaonNftV1 is ERC721{

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){}

    function mintNFT(address to, uint256 tokenId)external{
        _mint(to, tokenId);
    }

    function transferNFTFrom(address from, address to, uint256 tokenId)external {
        transferFrom(from, to, tokenId);
    }

    function version()external pure returns(string memory){
        return 'V1';
    }

}