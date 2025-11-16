import { network } from "hardhat";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
  const { ethers } = await network.connect();
  console.log("开始部署可升级合约...");

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
  const proxyContract = TransparentProxyContract.attach(proxyContractAddress);
  const proxyAddress = await proxyContract.getAddress(); 

  console.log("透明代理合约地址:", proxyAddress, proxyContractAddress);

  // 部署 BoxV1 作为逻辑合约
  const BoxV1 = await ethers.getContractFactory("BoxV1", logicDeployer);
  console.log("正在部署 BoxV1 逻辑合约...");
  const boxV1 = await BoxV1.deploy();
  await boxV1.waitForDeployment();
  // 关键：用 getAddress() 获取地址
  const boxV1Address = await boxV1.getAddress(); 

  console.log("透明代理合约地址:", proxyAddress);
  console.log("代理管理员地址:", proxyDeployer.address);
  console.log("逻辑合约地址:", boxV1Address);

  const initTx = await proxyContract.upgrade(boxV1Address);
  await initTx.wait(); 
  const currentImpl = await proxyContract.retrieveImplementation();
  console.log("代理关联的逻辑合约地址:", currentImpl);
  if (currentImpl !== boxV1Address) {
    throw new Error("implementation 初始化失败");
  }
  console.log(boxV1Address, currentImpl);
  // 验证 implementation 是否设置成功（调用代理合约自身的方法）
  // const currentImpl = await proxyContract.retrieve2(); 
  // console.log("代理当前关联的逻辑合约地址:", currentImpl);

  // 用逻辑合约的ABI关联代理地址（创建业务调用实例）
  const boxProxy = BoxV1.attach(proxyAddress); 

  // 验证合约功能
  console.log("\n正在验证初始部署..."); 
  const tx1 = await boxProxy.store(42);
  const tx1Receipt = await tx1.wait();
  console.log("tx1 交易收据:", tx1Receipt.status);
  const value = await boxProxy.retrieve();
  console.log("初始值:", value.toString());

  const tx2 = await boxProxy.setName("My Upgradeable Box");
  await tx2.wait();
  const name = await boxProxy.getName();
  console.log("初始名称:", name);

  const version = await boxProxy.getVersion();
  console.log("合约版本:", version);

  console.log("\n验证完毕");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
