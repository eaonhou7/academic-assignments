// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface IERC1822Proxiable2 {
    function proxiableUUID() external view returns (bytes32);
}


contract UpV2 {
    uint256 private value;
    string private name;
    address private owner;
    mapping(address => uint256) public userValues;


    event ValueChanged(uint256 newValue);
    event NameChanged(string newName);
    event UserValueSet(address indexed user, uint256 value);


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


    function setUserValue(uint256 userValue) public {
        userValues[msg.sender] = userValue;
        emit UserValueSet(msg.sender, userValue);
    }


    function getUserValue(address user) public view returns (uint256) {
        return userValues[user];
    }


    function increment() public {
        value += 1;
        emit ValueChanged(value);
    }


    function multiply(uint256 factor) public {
        value = value * factor;
        emit ValueChanged(value);
    }


    function getVersion() public pure returns (string memory) {
        return "UpV2";
    }


    function upgradeTo(address newImpl) public onlyOwner {
        require(IERC1822Proxiable2(newImpl).proxiableUUID() == _uuid(), "Invalid impl");
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


