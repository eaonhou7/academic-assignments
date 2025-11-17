import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const deploySecretKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';
  const deployer = new ethers.Wallet(deploySecretKey, ethers.provider);
  console.log("✅ 自定义部署者地址:", deployer.address);

  const proxyContractAddress = '0xA7c8B0D74b68EF10511F27e97c379FB1651e1eD2';
      // 获取代理合约
  const ERC1967Proxy = await ethers.getContractFactory("ERC1967Proxy", deployer);
  const proxy = ERC1967Proxy.attach(proxyContractAddress);
  const proxyAddress = await proxy.getAddress();
  console.log("✅ 代理合约地址:", proxyAddress);

  // 部署 TransparentProxy 作为目标合约，并制定部署者
  const BoxV2 = await ethers.getContractFactory("BoxV2", deployer);
  console.log("正在部署 BoxV2 逻辑合约...");
  const boxV2 = await BoxV2.deploy();
  console.log("⏳ 等待交易确认...");
  await boxV2.waitForDeployment();
  const boxV2Address = await boxV2.getAddress();
  console.log("✅ 目标合约地址:", boxV2Address);

  const BoxV1 = await ethers.getContractFactory("BoxV1", deployer);
  const uups = BoxV1.attach(proxyAddress).connect(deployer);
  await uups.upgradeToAndCall(boxV2Address, "0x");
  console.log("✅ 代理合约已升级到 BoxV2 逻辑合约地址:", boxV2Address);
  
  const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  const implStorage = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
  const implementation = ethers.getAddress(ethers.dataSlice(implStorage, 12));
  console.log("✅ 实现合约地址:", implementation);

  const [user] = await ethers.getSigners();
  console.log("✅ 用户地址:", await user.getAddress());

  const box = await BoxV2.attach(proxyAddress).connect(user);
  await box.setValue(100);
  console.log("✅ 调用 setValue(100) 成功");
  await box.increment();
  console.log("✅ 调用 increment() 成功");
  const value = await box.getValue();
  console.log("✅ 调用 getValue() 成功，返回值:", value);
  console.log("✅ 升级 TransparentUpgradeableProxy BoxV2 逻辑合约...");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});