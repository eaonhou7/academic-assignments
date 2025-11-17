import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();


async function main() {
  const { ethers } = await network.connect();
  const proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
  if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  const proxyDeployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);
  const proxyAddress = process.env.UUPS_PROXY_ADDRESS || process.env.PROXY_CONTRACT_ADDRESS || "";
  if (!proxyAddress) throw new Error("请在 .env 中提供 UUPS_PROXY_ADDRESS 或 PROXY_CONTRACT_ADDRESS");


  console.log("开始升级到 UpV2...");
  const UpV2 = await ethers.getContractFactory("UpV2", proxyDeployer);
  const impl2 = await UpV2.deploy();
  await impl2.waitForDeployment();
  const impl2Address = await impl2.getAddress();
  console.log("新实现地址:", impl2Address);


  const UpV1 = await ethers.getContractFactory("UpV1", proxyDeployer);
  const up = UpV1.attach(proxyAddress);
  await (await up.upgradeTo(impl2Address)).wait();


  const upV2 = UpV2.attach(proxyAddress);
  console.log("版本:", await upV2.getVersion());
  await (await upV2.store(3)).wait();
  await (await upV2.increment()).wait();
  console.log("递增后:", (await upV2.retrieve()).toString());
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});