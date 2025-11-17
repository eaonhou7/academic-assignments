import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const deploySecretKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';
  const deployer = new ethers.Wallet(deploySecretKey, ethers.provider);
  console.log("✅ 自定义部署者地址:", deployer.address);

  // 部署 TransparentProxy 作为目标合约，并制定部署者
  const BoxV1 = await ethers.getContractFactory("BoxV1", deployer);
  console.log("正在部署 BoxV1 逻辑合约...");
  const boxV1 = await BoxV1.deploy();
  console.log("⏳ 等待交易确认...");
  await boxV1.waitForDeployment();
  const boxV1Address = await boxV1.getAddress();
  console.log("✅ 目标合约地址:", boxV1Address);

  // 部署 TransparentProxy 作为目标合约，并制定部署者
  const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy", deployer);
  console.log("正在部署 TransparentUpgradeableProxy 代理合约...");
  const transparentUpgradeableProxy = await TransparentUpgradeableProxy.deploy(boxV1Address, await deployer.getAddress(), "0x");
  console.log("⏳ 等待交易确认...");
  await transparentUpgradeableProxy.waitForDeployment();
  console.log("✅ 代理合约地址:", transparentUpgradeableProxy.target);
  const implementation = await transparentUpgradeableProxy.getFunction("implementation").staticCall();
  console.log("✅ 实现合约地址:", implementation);

  const [user] = await ethers.getSigners();
  console.log("✅ 用户地址:", await user.getAddress());

  const box = await BoxV1.attach(transparentUpgradeableProxy.target).connect(user);
  await box.setValue(100);
  console.log("✅ 调用 setValue(100) 成功");
  const value = await box.getValue();
  console.log("✅ 调用 getValue() 成功，返回值:", value);
  console.log("✅ 部署 TransparentUpgradeableProxy BoxV1 逻辑合约...");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});