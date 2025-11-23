// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RomanToInt{

    function getStrValue(bytes1 _byte) internal pure returns(uint){
        if(_byte == bytes1("I")) return 1;
        if(_byte == bytes1("V")) return 5;
        if(_byte == bytes1("X")) return 10;
        if(_byte == bytes1("L")) return 50;
        if(_byte == bytes1("C")) return 100;
        if(_byte == bytes1("D")) return 500;
        if(_byte == bytes1("M")) return 1000;
        return 0;
    }
    
    function romanToInt(string memory str) external pure returns(uint){
        bytes memory byteStr = bytes(str);
        return romanToIntBytes(byteStr);
    }

    function romanToIntBytes(bytes memory _byte) public pure returns(uint){
        uint byteLen = _byte.length;
        uint result = 0;
        uint prev = 0;
        uint currentValue = 0;
        for (uint i = byteLen; i > 0; i--) {
            currentValue = getStrValue(_byte[i-1]);// 无效字符返回0，不触发revert
            if (currentValue >= prev) {
                result += currentValue;
            } else {
                result -= currentValue;
            }
            prev = currentValue;
        }
        return result;
    }
}