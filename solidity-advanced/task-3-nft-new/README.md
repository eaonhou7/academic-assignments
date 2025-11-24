## 1. 项目结构

| 目录/文件 | 说明 |
|-----------|------|
| contracts/ | 智能合约源码目录 |
|  └── EaonAuction_V1.sol | NFT拍卖合约V1版本 |
|  └── EaonAuction_V2.sol | NFT拍卖合约V2版本（升级版） |
|  └── EaonNFT_V1.sol | NFT合约V1版本 |
|  └── EaonNFT_V2.sol | NFT合约V2版本（升级版） |
|  └── erc20.sol | ERC20代币合约 |
|  └── mocks/ | 模拟合约目录 |
|  └── MockV3Aggregator.sol | Chainlink预言机模拟合约 |
| test/ | 测试文件目录 |
|  └── eaonAuctionV1.test.cjs | 合并后的完整测试套件 |
| scripts/ | 部署和升级脚本目录 |
|  └── deployV1.js | V1版本部署脚本 |
|  └── deployV2.js | V2版本部署脚本 |
|  └── sepoliaDeployV1.js | Sepolia测试网V1部署脚本 |
|  └── sepoliaDeployV2.js | Sepolia测试网V2部署脚本 |
|  └── hardhatUpgradeDeploy.js | Hardhat升级部署脚本 |
|  └── ignitionModules.js | Ignition模块配置 |
| hardhat.config.cjs | Hardhat配置文件 |
| package.json | 项目依赖和脚本管理 |
| .env.example | 环境变量示例文件 |
| .gitignore | Git忽略文件配置 |
| README.md | 项目说明文档 |
| coverage/ | 覆盖率测试报告目录 |
| artifacts/ | 编译后的合约ABI目录 |
| cache/ | Hardhat缓存目录 |

##2.功能说明
这是一个可以通过ERC20或者Eth的竞拍合约，包含了以下功能：
###2.1 创建竞拍
###2.2 竞拍
###2.3 结束竞拍
###2.4 查看竞拍结果
###2.5 未竞拍到申请退款

##3.部署步骤
1. 安装依赖
```
npm install
```
2. 编译合约
```
npx hardhat compile
```
3. 测试部署和升级合约
```
// 启动本地节点
npx hardhat node
// 部署合约
npx hardhat run scripts/deployV1.js --network localhost
// 升级合约
npx hardhat run scripts/deployV2.js --network localhost
```
4. 执行功能测试脚本
```
// 合约测试脚本
npx hardhat test test/eaonAuctionV1.test.cjs
// 覆盖率测试脚本
npx hardhat coverage --testfiles "test/eaonAuctionV1.test.cjs"
```
5. 在sepolia部署和升级合约
```
npx hardhat run scripts/sepoliaDeployV1.js --network sepolia
npx hardhat run scripts/sepoliaDeployV2.js --network sepolia
```

##4.部署地址
```
竞拍合约代理地址

https://sepolia.etherscan.io/address/0xf95eE913a429f9d29D858C9cf0A717Fd5842F720#code

竞拍合约地址

https://sepolia.etherscan.io/address/0xbBD2057d1a32Ae63A463e1B6752aB8365Cb0C6Ba#code

```

##5.覆盖率测试图片
![coverage](./img/image.png)