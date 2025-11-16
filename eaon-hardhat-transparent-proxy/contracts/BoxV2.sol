// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract BoxV2 {
    uint256 private value;
    string private name;
    mapping(address => uint256) public userValues;
    
    event ValueChanged(uint256 newValue);
    event NameChanged(string newName);
    event UserValueSet(address indexed user, uint256 value);


    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }


    function retrieve() public view returns (uint256) {
        return value;
    }


    function setName(string memory newName) public {
        name = newName;
        emit NameChanged(newName);
    }


    function getName() public view returns (string memory) {
        return name;
    }


    // 新增功能 - V2 版本
    function setUserValue(uint256 userValue) public {
        userValues[msg.sender] = userValue;
        emit UserValueSet(msg.sender, userValue);
    }


    function getUserValue(address user) public view returns (uint256) {
        return userValues[user];
    }


    function getVersion() public pure returns (string memory) {
        return "V2";
    }


    // 新增功能 - 数值计算
    function increment() public {
        value += 1;
        emit ValueChanged(value);
    }


    function multiply(uint256 factor) public {
        value = value * factor;
        emit ValueChanged(value);
    }
}
