const { ethers, upgrades } = require("hardhat");


async function main() {
  console.log("开始升级合约到 V2...");


  // 读取之前的部署信息
  const fs = require('fs');
  if (!fs.existsSync('deployment-v1.json')) {
    throw new Error("找不到 V1 部署信息，请先运行 deployV1.js");
  }


  const deploymentV1 = JSON.parse(fs.readFileSync('deployment-v1.json', 'utf8'));
  const proxyAddress = deploymentV1.proxyAddress;


  console.log("代理合约地址:", proxyAddress);
  console.log("当前实现地址:", deploymentV1.implementationAddress);


  // 部署 BoxV2
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  console.log("正在升级到 BoxV2...");


  const box = await upgrades.upgradeProxy(proxyAddress, BoxV2);
  console.log("升级交易已发送...");


  // 等待升级完成
  await box.waitForDeployment();
  
  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("新的实现地址:", newImplementationAddress);


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
  
  const [deployer] = await ethers.getSigners();
  await box.setUserValue(100);
  const userValue = await box.getUserValue(deployer.address);
  console.log("用户数值:", userValue.toString());


  await box.increment();
  const newValue = await box.retrieve();
  console.log("递增后的数值:", newValue.toString());


  // 保存升级信息
  const deploymentInfo = {
    proxyAddress: proxyAddress,
    implementationAddress: newImplementationAddress,
    adminAddress: await upgrades.erc1967.getAdminAddress(proxyAddress),
    previousImplementation: deploymentV1.implementationAddress,
    network: 'localhost',
    timestamp: new Date().toISOString(),
    version: 'V2'
  };


  fs.writeFileSync('deployment-v2.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n升级信息已保存到 deployment-v2.json");
  console.log("✅ 合约升级成功!");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
