import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { ethers } = await network.connect();
  const networkName = await ethers.provider.getNetwork().then((network) => network.name);
  console.log('networkName 网络名称:', networkName);
  let proxyDeployerPrivateKey;
  if(networkName === 'localhost'){
    proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  }else{
    proxyDeployerPrivateKey = process.env.DEPLOY_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 DEPLOY_PRIVATE_KEY");
  }
  const deployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);
  
  const deployerAddress = await deployer.getAddress();
  console.log('deployerAddress 部署者地址:', deployerAddress);

  console.log("开始部署 Eaon NTF");
  const EaonNft = await ethers.getContractFactory("EaonNftV1", deployer);
  const eaonNft = await EaonNft.deploy("EAON NFT", "EAO");
  await eaonNft.waitForDeployment();
  const eaonNftAddress = await eaonNft.getAddress();
  console.log('eaonNftAddress 合约地址:', eaonNftAddress);

  console.log("开始部署 Eaon NTF Proxy");
  const NFTProxy = await ethers.getContractFactory("NFTProxy", deployer);
  const nFTProxy = await NFTProxy.deploy(eaonNftAddress, deployerAddress, "0x");
  await nFTProxy.waitForDeployment();
  const nFTProxyProxyAddress = await nFTProxy.getAddress();
  console.log("nFTProxyProxyAddress 代理地址:", nFTProxyProxyAddress);
  const eaonNftV1 = EaonNft.attach(nFTProxyProxyAddress);
  const version = await eaonNftV1.version();
  console.log("Eaon NTF version 版本:", version);
  
  console.log("开始部署 Eaon Auction");
  const EaonAuction = await ethers.getContractFactory("EaonAuctionV1", deployer);
  const eaonAuction = await EaonAuction.deploy();
  await eaonAuction.waitForDeployment();
  const eaonAuctionAddress = await eaonAuction.getAddress();
  console.log('eaonAuctionAddress 合约地址:', eaonAuctionAddress);

  console.log("开始部署 Eaon Auction Proxy");
  const AuctionProxy = await ethers.getContractFactory("AuctionProxy", deployer);
  const auctionProxy = await AuctionProxy.deploy(eaonAuctionAddress, deployerAddress, "0x");
  await auctionProxy.waitForDeployment();
  const auctionProxyProxyAddress = await auctionProxy.getAddress();
  console.log("auctionProxyProxyAddress 代理地址:", auctionProxyProxyAddress);
  const eaonAuctionV1 = EaonAuction.attach(auctionProxyProxyAddress);
  const versionAuction = await eaonAuctionV1.version();
  console.log("Eaon Auction version 版本:", versionAuction);

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
