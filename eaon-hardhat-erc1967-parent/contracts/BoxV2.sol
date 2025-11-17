//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BoxV2{
    uint256 value;

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns(uint256){
        return value;
    }

    function increment() public {
        value += 1;
    }
}