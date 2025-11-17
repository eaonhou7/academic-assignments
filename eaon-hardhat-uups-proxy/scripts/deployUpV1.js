import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { ethers } = await network.connect();
  const proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
  if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  const proxyDeployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);

  console.log("开始部署 UUPSProxy + Up1...");
  const UUPSProxy = await ethers.getContractFactory("UUPSProxy", proxyDeployer);
  const proxy = await UUPSProxy.deploy();
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("代理地址:", proxyAddress);

  const UpV1 = await ethers.getContractFactory("UpV1", proxyDeployer);
  const impl = await UpV1.deploy();
  await impl.waitForDeployment();
  const implAddress = await impl.getAddress();
  console.log("实现地址:", implAddress);

  const initData = impl.interface.encodeFunctionData("initialize", [proxyDeployer.address]);
  await (await proxy.initable(implAddress, initData)).wait();

  const box = UpV1.attach(proxyAddress).connect(proxyDeployer);
  await (await box.store(11)).wait();
  const v = await box.retrieve();
  console.log("初始值:", v.toString());
  console.log("版本:", await box.getVersion());
  process.env.UUPS_PROXY_ADDRESS = proxyAddress;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
