// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; // 统一版本语法（~和^功能一致，^更规范）

contract OptimizedERC20 {
    // ====== 1. 核心状态变量（符合 ERC20 标准，命名规范，减少冗余）======
    string public constant name = "OptimizedEaonToken"; // 代币名称（钱包自动识别）
    string public constant symbol = "EOT"; // 代币符号（钱包自动识别）
    uint8 public constant decimals = 18; // 代币小数位（ERC20 标准默认18，钱包识别必需）
    uint256 public totalSupply; // 总供给（ERC20 标准必备，原合约缺失）

    mapping(address => uint256) public balanceOf; // 账户余额（保留核心功能）
    // 授权映射：owner -> spender -> 授权额度（命名改为 allowance，符合 ERC20 标准）
    mapping(address => mapping(address => uint256)) public allowance;

    address private immutable owner; // 改为 immutable（部署后不可变，更省 Gas）

    // ====== 2. 事件优化（符合 ERC20 标准，减少不必要索引）======
    // ERC20 标准事件：仅索引 from/to，value 不索引（索引越多 Gas 越高）
    event Transfer(address indexed from, address indexed to, uint256 value);
    // ERC20 标准事件：仅索引 owner/spender，value 不索引
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ====== 3. 修饰符优化（revert 更省 Gas，错误信息简洁）======
    modifier onlyOwner() {
        if (msg.sender != owner) revert("Not Owner"); // 0.8.4+ 支持 revert 字符串，比 require 省 Gas
        _;
    }

    // ====== 4. 构造函数优化（简洁高效）======
    constructor() {
        owner = msg.sender; // immutable 变量赋值仅一次，部署时 Gas 更低
    }

    // ====== 5. 核心函数优化（修复逻辑错误+符合 ERC20 标准+省 Gas）======
    /**
     * 铸币：仅 owner 可调用，同步更新 totalSupply（原合约缺失）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        totalSupply += amount; // 同步总供给（符合 ERC20 标准）
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount); // 铸币对应「从0地址转账」，符合标准
    }

    /**
     * 转账：从 msg.sender 转出（原合约多了冗余的 from 参数，逻辑错误）
     * 遵循 ERC20 标准：function transfer(address to, uint256 value) external returns (bool)
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        address from = msg.sender;
        require(balanceOf[from] >= amount, "Insufficient Balance");

        // 优化：直接操作映射，减少局部变量赋值（省 Gas）
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true; // ERC20 标准必需返回值（钱包/工具交互依赖）
    }

    /**
     * 授权：msg.sender 授权 spender 动用额度（原合约多了冗余的 from 参数，逻辑错误）
     * 遵循 ERC20 标准：function approve(address spender, uint256 value) external returns (bool)
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        address owner = msg.sender;
        allowance[owner][spender] = amount;

        emit Approval(owner, spender, amount);
        return true; // 标准返回值
    }

    /**
     * 代转账：spender 动用 owner 授权的额度（修复原合约事件逻辑）
     * 遵循 ERC20 标准：function transferFrom(address from, address to, uint256 value) external returns (bool)
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        address spender = msg.sender;
        require(balanceOf[from] >= amount, "Insufficient Balance");
        require(allowance[from][spender] >= amount, "Insufficient Allowance");

        // 优化：合并授权额度扣减和余额转移（省 Gas）
        allowance[from][spender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount); // 代转账同样触发 Transfer 事件（符合标准，删除冗余的 TransferFromLog）
        return true; // 标准返回值
    }
}