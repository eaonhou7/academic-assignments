import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { ethers } = await network.connect();
  const networkName = await ethers.provider.getNetwork().then((network) => network.name);
  console.log('networkName 网络名称:', networkName);
  let NFT_PROXY_ADDRESS;
  let AUCTION_PROXY_ADDRESS;
  let proxyDeployerPrivateKey;
  let deployer;
  if(networkName === 'localhost'){
    NFT_PROXY_ADDRESS = process.env.TEST_NFT_PROXY_ADDRESS || "";
    AUCTION_PROXY_ADDRESS = process.env.TEST_AUCTION_PROXY_ADDRESS || "";

    proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  }else{
    NFT_PROXY_ADDRESS = process.env.SEPOLIA_NFT_PROXY_ADDRESS || "";
    AUCTION_PROXY_ADDRESS = process.env.SEPOLIA_AUCTION_PROXY_ADDRESS || "";

    proxyDeployerPrivateKey = process.env.DEPLOY_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 DEPLOY_PRIVATE_KEY");
  }
  deployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider);

  const deployerAddress = await deployer.getAddress();
  console.log('deployerAddress 部署者地址:', deployerAddress);

  console.log("开始部署 Eaon NTF V2");
  const EaonNft = await ethers.getContractFactory("EaonNftV2", deployer);
  const eaonNft = await EaonNft.deploy("EAON NFT", "EAO");
  await eaonNft.waitForDeployment();
  const eaonNftAddress = await eaonNft.getAddress();
  console.log('eaonNftAddress 合约地址:', eaonNftAddress);

  console.log("开始升级 Eaon NTF Proxy");
  const nftProxyAdmin = new ethers.Contract(
    NFT_PROXY_ADDRESS,
    ["function upgrade(address newImplementation)"],
    deployer
  );
  const upgradeTxNft = await nftProxyAdmin.upgrade(eaonNftAddress);
  await upgradeTxNft.wait();
  const nFTProxyProxyAddress = NFT_PROXY_ADDRESS;
  console.log('nFTProxyProxyAddress 代理合约地址:', nFTProxyProxyAddress);
  const eaonNftV2 = await EaonNft.attach(nFTProxyProxyAddress);
  const version = await eaonNftV2.version();
  console.log("Eaon NTF Proxy version 版本:", version);

  console.log("开始部署 Eaon Auction V2");
  const EaonAuction = await ethers.getContractFactory("EaonAuctionV2", deployer);
  const eaonAuction = await EaonAuction.deploy();
  await eaonAuction.waitForDeployment();
  const eaonAuctionAddress = await eaonAuction.getAddress();
  console.log('eaonAuctionAddress 合约地址:', eaonAuctionAddress);

  console.log("开始部署 Eaon Auction Proxy");
  const AuctionProxy = await ethers.getContractFactory("AuctionProxy", deployer);
  const auctionProxy = await AuctionProxy.connect(deployer).attach(AUCTION_PROXY_ADDRESS);
  const upgradeTxAuction = await auctionProxy.upgrade(eaonAuctionAddress);
  await upgradeTxAuction.wait();
  const auctionProxyAddress = await auctionProxy.getAddress();
  console.log('auctionProxyAddress 代理合约地址:', auctionProxyAddress);
  const eaonAuctionV2 = await EaonAuction.attach(auctionProxyAddress);
  const versionAuction = await eaonAuctionV2.version();
  console.log("Eaon Auction version 版本:", versionAuction);

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
