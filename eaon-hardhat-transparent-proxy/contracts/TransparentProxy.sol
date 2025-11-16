// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TransparentProxy {
    address public implementation; // 逻辑合约地址
    address public admin; // 管理员地址
    uint public once;

    // 用于测试 目标代理的值1
    function retrieveImplementation() public view returns(address){
        return implementation;
    }

    // 升级函数，用于更换逻辑合约地址
    function upgrade(address _newImplementation) public onlyAdmin {
        implementation = _newImplementation;
    }

    function initable(address _implementation) public onlyOnce{
        admin = msg.sender;
        implementation = _implementation;
    }

    // 修饰器，限制仅管理员可调用
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // 修饰器，限制只能调用一次
    modifier onlyOnce() {
        require(once == 0, "Only once");
        _;
        once++;
    }



    // 用于测试 admin 的值
    function retrieve() public view returns(address){
        return admin;
    }

    // Fallback 函数，将调用委托给逻辑合约
    fallback() external payable {
        address _impl = implementation;
        require(_impl != address(0));
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
    receive() external payable {}
}