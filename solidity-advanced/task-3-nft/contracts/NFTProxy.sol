// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFTProxy is TransparentUpgradeableProxy, Ownable{
    bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    constructor(address _logic, address initialOwner, bytes memory _data)
        TransparentUpgradeableProxy(_logic, initialOwner, _data)
        Ownable(initialOwner){
    }

        // 升级函数，用于更换逻辑合约地址
    function upgrade(address newImplementation) public onlyOwner {
        _setImplementation(newImplementation);
    }

    /**
     * @dev Stores a new address in the ERC-1967 implementation slot.
     */
    function _setImplementation(address newImplementation) private {
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }
    }
}