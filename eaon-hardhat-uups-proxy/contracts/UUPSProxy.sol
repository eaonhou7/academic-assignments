// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract UUPSProxy {
    fallback() external payable {
        _delegate(_getImplementation());
    }

    function initable(address impl, bytes memory data) public onlyOnce {
        _setImplementation(impl);
        if (data.length > 0) {
            (bool ok, ) = impl.delegatecall(data);
            require(ok);
        }
    }

    modifier onlyOnce() {
        require(_getOnce() == 0, "Only once");
        _;
        _setOnce(1);
    }

    function _delegate(address implementation) internal virtual {
        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let result := delegatecall(gas(), implementation, 0x00, calldatasize(), 0x00, 0x00)
            returndatacopy(0x00, 0x00, returndatasize())
            switch result
            case 0 { revert(0x00, returndatasize()) }
            default { return(0x00, returndatasize()) }
        }
    }

    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        assembly { impl := sload(slot) }
    }

    function _setImplementation(address newImpl) internal {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        assembly { sstore(slot, newImpl) }
    }

    function _getOnce() internal view returns (uint256 v) {
        bytes32 slot = keccak256("uups.proxy.once");
        assembly { v := sload(slot) }
    }

    function _setOnce(uint256 v) internal {
        bytes32 slot = keccak256("uups.proxy.once");
        assembly { sstore(slot, v) }
    }
}
