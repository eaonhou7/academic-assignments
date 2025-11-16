// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TransparentProxy {
    uint public once;

    // 用于测试 目标代理的值
    function retrieveImplementation() public view returns(address){
        return _getImplementation();
    }

    // 升级函数，用于更换逻辑合约地址
    function upgrade(address _newImplementation) public onlyAdmin {
        _setImplementation(_newImplementation);
    }

    function initable(address _implementation) public onlyOnce{
        _setAdmin(msg.sender);
        _setImplementation(_implementation);
    }

    // 修饰器，限制仅管理员可调用
    modifier onlyAdmin() {
        require(msg.sender == _getAdmin(), "Only admin");
        _;
    }

    // 修饰器，限制只能调用一次
    modifier onlyOnce() {
        require(once == 0, "Only once");
        _;
        once++;
    }

    // Fallback 函数，将调用委托给逻辑合约
    fallback() external payable {
        _delegate(_getImplementation());
    }

    function _delegate(address implementation) internal virtual {
        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let result := delegatecall(gas(), implementation, 0x00, calldatasize(), 0x00, 0x00)
            returndatacopy(0x00, 0x00, returndatasize())
            switch result
            case 0 {
                revert(0x00, returndatasize())
            }
            default {
                return(0x00, returndatasize())
            }
        }
    }

    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        assembly {
            impl := sload(slot)
        }
    }

    function _setImplementation(address newImpl) internal {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        assembly {
            sstore(slot, newImpl)
        }
    }

    function _getAdmin() internal view returns (address adm) {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        assembly {
            adm := sload(slot)
        }
    }

    function _setAdmin(address newAdmin) internal {
        bytes32 slot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        assembly {
            sstore(slot, newAdmin)
        }
    }
}