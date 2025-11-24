require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-deploy");
const dotenv = require("dotenv"); // 改为 require

// 加载 .env 文件
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL || '',
      gasPrice: 10000000000, // 手动设置 Gas 价格（10 Gwei，测试网当前合理区间：5-20 Gwei）
      gas: 3000000, // 手动设置 Gas 限制（300 万，足够部署代理+合约初始化）
      accounts: {
        mnemonic: process.env.SEPOLIA_PRIVATE_KEY || '', // 或者直接使用私钥数组
      },
    },
  }
};
