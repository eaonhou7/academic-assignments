import { network } from "hardhat";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();
async function main() {
  const { ethers } = await network.connect();
  console.log("开始升级合约到 V2...");


  const logicDeployerPrivateKey = process.env.TARGET_DEPLOYER_PRIVATE_KEY || "";
  if (!logicDeployerPrivateKey) {
    throw new Error("请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY");
  }
  // 获取逻辑部署者账户
  const logicDeployer = new ethers.Wallet(logicDeployerPrivateKey, ethers.provider);
  console.log("逻辑合约部署者地址:", logicDeployer.address);

  const proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
  if (!proxyDeployerPrivateKey) {
    throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  }
  // 获取代理部署者账户
  const proxyDeployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);
  console.log("代理合约部署者地址:", proxyDeployer.address);

  const proxyContractAddress = process.env.PROXY_CONTRACT_ADDRESS || "";
  if (!proxyContractAddress) {
    throw new Error("请在 .env 文件中设置 PROXY_CONTRACT_ADDRESS");
  }
    // 获取代理合约
  const TransparentProxyContract = await ethers.getContractFactory("TransparentProxy", proxyDeployer); // TransparentProxy是实现合约
  // 用代理地址实例化（核心：通过实现合约ABI操作代理）
  const deploymentV1 = TransparentProxyContract.attach(proxyContractAddress);
  const proxyAddress = await deploymentV1.getAddress();

  const implementationAddress = await deploymentV1.retrieveImplementation();


  console.log("代理合约地址:", proxyAddress);
  console.log("当前代理合约目标地址:", implementationAddress);

  // 部署 BoxV2
  const BoxV2 = await ethers.getContractFactory("BoxV2", logicDeployer);
  console.log("正在升级到 BoxV2...");
  const boxV2 = await BoxV2.deploy();
  await boxV2.waitForDeployment();
  console.log("升级交易已发送...");
  // 关键：用 getAddress() 获取地址
  const boxV2Address = await boxV2.getAddress(); 

  await deploymentV1.upgrade(boxV2Address);
  console.log("新的实现地址:", boxV2Address);
  const box = BoxV2.attach(proxyAddress);

  // 验证升级后的功能
  console.log("\n验证升级后的功能...");
  
  // 检查之前的数据是否保留
  const value = await box.retrieve();
  const name = await box.getName();
  const version = await box.getVersion();
  
  console.log("升级后数值:", value.toString());
  console.log("升级后名称:", name);
  console.log("升级后版本:", version);

  // 测试 V2 新增功能
  console.log("\n测试 V2 新增功能...");

  const [deployer1] = await ethers.getSigners();
  const boxNew = await box.connect(deployer1);
  await boxNew.setUserValue(100);
  const userValue = await box.getUserValue(deployer1.address);
  console.log("用户数值:", userValue.toString());

  await box.increment();
  const newValue = await box.retrieve();
  console.log("递增后的数值:", newValue.toString());

  console.log("✅ 合约升级成功!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
