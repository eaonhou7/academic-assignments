import pkg from "hardhat";
const { ethers, upgrades, deployments } = pkg;

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config();

async function main() {

  const networkName = await ethers.provider.getNetwork().then((network) => network.name);
  console.log('networkName 网络名称:', networkName);
  const proxyDeployerPrivateKey = process.env.DEPLOY_PRIVATE_KEY || "";
  if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 DEPLOY_PRIVATE_KEY");
  const deployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);  
  const deployerAddress = await deployer.getAddress();
  console.log('deployerAddress 部署者地址:', deployerAddress);

  console.log("开始部署 Eaon NTF");
  const EaonNft = await ethers.getContractFactory("EaonNftV1", deployer);
  const eaonNftProxy = await upgrades.deployProxy(
    EaonNft,                  // 逻辑合约工厂
    ["EAON NFT", "EAO", "0x"], // initialize 函数参数
    {
      initializer: "initialize", // 指定初始化函数名
      kind: "transparent"        // 明确使用「透明代理」（必传）
    }
  );

  await eaonNftProxy.waitForDeployment();
  const eaonNftProxyAddress = await eaonNftProxy.getAddress();
  console.log("eaonNftProxyAddress 代理地址:", eaonNftProxyAddress);
  console.log("原生透明代理地址：", eaonNftProxyAddress);

  // 获取插件自动部署的 ProxyAdmin 地址（关键：升级时需要）
  const eaonNft = await upgrades.erc1967.getAdminAddress(eaonNftProxyAddress);
  console.log("自动部署的 EaonNftV1 地址：", eaonNft);
  const version2 = await eaonNftProxy.version();
  console.log("Eaon NTF version 版本:", version2);

  // 保存合约地址到文件
  const proxyNftV1Path = path.resolve(__dirname, "./.cache/sepoliaProxyNftV1.json");
  fs.writeFileSync(
      proxyNftV1Path,
      JSON.stringify({
          eaonNftProxyAddress,
          eaonNft,
          abi: EaonNft.interface.format("json"),
      })
  );
  console.log("Eaon NTF 部署完成，信息保存成功");
  
  console.log("开始部署 Eaon Auction");
  const EaonAuction = await ethers.getContractFactory("EaonAuctionV1", deployer);
  const auctionProxy = await upgrades.deployProxy(
    EaonAuction,                  // 逻辑合约工厂
    [1], // initialize 函数参数
    {
      initializer: "initialize", // 指定初始化函数名
      kind: "transparent"        // 明确使用「透明代理」（必传）
    }
  );

  await auctionProxy.waitForDeployment();
  const auctionProxyProxyAddress = await auctionProxy.getAddress();
  console.log("auctionProxyProxyAddress 代理地址:", auctionProxyProxyAddress);
  console.log("原生透明代理地址：", auctionProxyProxyAddress);

  // 获取插件自动部署的 ProxyAdmin 地址（关键：升级时需要）
  const auctionddress = await upgrades.erc1967.getAdminAddress(auctionProxyProxyAddress);
  console.log("自动部署的 EaonAuctionV1 地址：", auctionddress);
  const version = await auctionProxy.version();
  console.log("Eaon Auction version 版本:", version);

  const auctionProxyV1Path = path.resolve(__dirname, "./.cache/sepoliaAuctionProxyV1.json");
  fs.writeFileSync(
      auctionProxyV1Path,
      JSON.stringify({
          auctionProxyProxyAddress,
          auctionddress,
          abi: EaonAuction.interface.format("json"),
      })
  );
  console.log("Eaon NTF 部署完成，信息保存成功");

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
