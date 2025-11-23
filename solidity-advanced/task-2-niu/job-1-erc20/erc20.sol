// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

contract ERC20{
    mapping (address => uint) public balanceOf;
    mapping (address => mapping(address => uint)) approves;
    address private owner;

    constructor(){
        owner = msg.sender;
    }

    event TransferLog(address indexed from, address indexed to, uint value);
    event ApproveLog(address indexed from, address indexed to, uint value);
    event TransferFromLog(address indexed approver, address indexed from, address indexed to, uint value);

    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }

    function mint(address user, uint value) external isOwner{
        balanceOf[user] = value;
    }

    function transfer(address from, address to, uint value) external {
        require(from == msg.sender, "not owner");
        require(value <= balanceOf[from], "from not have enough token");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit TransferLog(from, to, value);
    }

    function approve(address from, address user, uint value) external {
        require(value <= balanceOf[from], "from not have enough token");
        approves[from][user] = value;
        emit ApproveLog(from, user, value);
    }

    function transferFrom(address from, address to, uint value) external {
        require(value <= balanceOf[from], "from not have enough token");
        require(value <= approves[from][msg.sender], "approver not auth enough token");
        balanceOf[from] -= value;
        approves[from][msg.sender] -= value;
        balanceOf[to] += value;
        emit TransferFromLog(msg.sender, from, to, value);
    }

}