// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BeggingContract{
    mapping (address => uint) private beggingLog;

    function donate() external payable {
        beggingLog[msg.sender] += msg.value;
    }

    function withdraw() external payable {
        uint value = beggingLog[msg.sender];
        require(beggingLog[msg.sender]>0, "not donated token");
        beggingLog[msg.sender] = 0;
        (bool success,) = msg.sender.call{value:value}("");
        require(success, "not success");
    }

    function getDonation(address _address) external view returns(uint){
        return beggingLog[_address];
    }
}