// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface IERC1822Proxiable {
    function proxiableUUID() external view returns (bytes32);
}


contract UpV1 {
    uint256 private value;
    string private name;
    address private owner;


    event ValueChanged(uint256 newValue);
    event NameChanged(string newName);


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }


    function initialize(address _owner) public {
        require(owner == address(0), "Initialized");
        owner = _owner;
    }


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
        return "UpV1";
    }


    function upgradeTo(address newImpl) public onlyOwner {
        require(IERC1822Proxiable(newImpl).proxiableUUID() == _uuid(), "Invalid impl");
        _setImplementation(newImpl);
    }


    function proxiableUUID() external pure returns (bytes32) {
        return _uuid();
    }


    function _uuid() internal pure returns (bytes32) {
        return bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
    }


    function _setImplementation(address newImpl) internal {
        bytes32 slot = _uuid();
        assembly { sstore(slot, newImpl) }
    }
}


