import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();


async function main() {
  const { ethers } = await network.connect();
  const proxyAddress = process.env.UUPS_PROXY_ADDRESS || process.env.PROXY_CONTRACT_ADDRESS || "";
  if (!proxyAddress) throw new Error("请在 .env 中提供 UUPS_PROXY_ADDRESS 或 PROXY_CONTRACT_ADDRESS");


  const [caller] = await ethers.getSigners();
  const UpV1 = await ethers.getContractFactory("UpV1", caller);
  const proxy = UpV1.attach(proxyAddress);


  const version = await proxy.getVersion();
  console.log("版本:", version);
  await (await proxy.store(9)).wait();
  console.log("数值:", (await proxy.retrieve()).toString());
  await (await proxy.setName("Verify Up1")).wait();
  console.log("名称:", await proxy.getName());
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
