nft 拍卖合约醒目
1.npm install
2.配置 .env 文件
3.编译 sol
```shell
npx hardhat compile
```
4. 覆盖率报告
覆盖率报告是指测试合约时，统计测试用例覆盖了合约的多少代码。
```shell
npx hardhat test test/Auction_V1.test.ts --network localhost --coverage
```
5.部署合约
部署到测试环境
```shell
npx hardhat run scripts/deployV1.js --network localhost
```
部署到sepolia
```shell
npx hardhat run scripts/deployV1.js --network sepolia
```
部署到主网
```shell
npx hardhat run scripts/deployV1.js --network mainnet
```
6.测试合约
测试环境是测试合约的环境，用于测试合约的功能是否正常。
```shell
npx hardhat test test/Auction_V1.test.ts --network localhost
```
测试sepolia网络
```shell
npx hardhat test test/Auction_V1.test.ts --network sepolia
```
测试主网
```shell
npx hardhat test test/Auction_V1.test.ts --network mainnet
```
7. 合约升级
合约升级是指在不改变合约地址的情况下，更新合约的代码。
```shell
npx hardhat run scripts/deployV2.js --network localhost
```


