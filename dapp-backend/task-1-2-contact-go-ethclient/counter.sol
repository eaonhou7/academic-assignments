// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract counter{
    uint64 public count;

    function increment() external {
        count++;
    }

}