import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();


async function main() {
  const { ethers } = await network.connect();
  const proxyAddress = process.env.UUPS_PROXY_ADDRESS || process.env.PROXY_CONTRACT_ADDRESS || "";
  if (!proxyAddress) throw new Error("请在 .env 中提供 UUPS_PROXY_ADDRESS 或 PROXY_CONTRACT_ADDRESS");


  const [caller] = await ethers.getSigners();
  const UpV2 = await ethers.getContractFactory("UpV2", caller);
  const proxy = UpV2.attach(proxyAddress);


  console.log("版本:", await proxy.getVersion());
  await (await proxy.setUserValue(777)).wait();
  console.log("用户数值:", (await proxy.getUserValue(caller.address)).toString());
  await (await proxy.store(10)).wait();
  await (await proxy.increment()).wait();
  await (await proxy.multiply(2)).wait();
  console.log("最终数值:", (await proxy.retrieve()).toString());
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
