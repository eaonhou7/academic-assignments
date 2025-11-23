import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
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
    localhost: {
      type: "http",
      chainType: "l1",
      url: process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545",
    },
  },
});
