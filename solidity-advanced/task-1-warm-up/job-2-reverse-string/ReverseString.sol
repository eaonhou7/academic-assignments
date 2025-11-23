// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

contract ReverseString{

    function Reverse(string memory str) external pure returns(string memory){
        bytes memory strByte = bytes(str);
        uint strLen = strByte.length;
        bytes memory newByte = new bytes(strLen);
        for(uint i = 0; i<strLen;i++){
            newByte[i] = strByte[strLen - i - 1];
        }
        string memory strr = string(newByte);
        return strr;
    }
}