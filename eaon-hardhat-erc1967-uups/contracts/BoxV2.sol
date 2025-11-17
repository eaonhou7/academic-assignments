//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import {UUPSUpgradeable} from "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";

contract BoxV2 is UUPSUpgradeable {
    uint256 value;
    address private _owner;
    bool private _initialized;

    function initialize(address owner_, uint256 initialValue) external {
        require(!_initialized);
        _owner = owner_;
        value = initialValue;
        _initialized = true;
    }

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    function increment() public {
        value += 1;
    }

    function _authorizeUpgrade(address) internal virtual override {
        require(msg.sender == _owner);
    }
}