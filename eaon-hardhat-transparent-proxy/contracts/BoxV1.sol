// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract BoxV1 {
    uint256 private value;
    string private name;
    
    event ValueChanged(uint256 newValue);
    event NameChanged(string newName);


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


    function getVersion() public pure returns (string memory) {
        return "V1";
    }
}
