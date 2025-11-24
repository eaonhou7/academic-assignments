##1.项目结构
----contracts 合约文件
----test 测试文件
----scripts 部署和升级脚本文件
----hardhat.config.js 配置文件
----package.json 包管理文件
----hardhat.config.js 配置文件
----package.json 包管理文件
----.env.example 环境变量文件
----.gitignore 忽略文件
----README.md 说明文件

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