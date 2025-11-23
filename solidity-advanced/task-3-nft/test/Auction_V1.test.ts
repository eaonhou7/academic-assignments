import { network } from "hardhat";
import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const { ethers } = await network.connect();
describe("AUCTION V1", function () {
  it("部署 Eaon NTF 并初始化与调用", async function () {
    const [deployer] = await ethers.getSigners();
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
  });

  it("部署 Eaon Auction 并初始化与调用", async function () {
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log('deployerAddress 部署者地址:', deployerAddress);
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
  });

  it("功能测试调用", async function () {
    this.timeout(500000);
    let deployer;
    let user1;
    let user2;
    let user3;
    let deployerAddress;

    const networkName = await ethers.provider.getNetwork().then((network) => network.name);
    console.log('networkName 网络名称:', networkName);
    if (networkName === 'localhost') {
      [deployer, user1, user2, user3] = await ethers.getSigners();
      deployerAddress = await deployer.getAddress();
    } else {
      const  deployerPrivateKey1 = process.env.USER1_PRIVATE_KEY || '';
      const  deployerPrivateKey2 = process.env.USER2_PRIVATE_KEY || '';
      deployer = new ethers.Wallet(deployerPrivateKey1, ethers.provider);
      user1 = deployer;
      user2 = new ethers.Wallet(deployerPrivateKey2, ethers.provider);
      user3 = user2
      deployerAddress = await deployer.getAddress();
    }
    console.log('deployerAddress 部署者地址:', deployerAddress);

    console.log("开始部署 Eaon NTF");
    const EaonNft = await ethers.getContractFactory("EaonNftV1", deployer);
    const eaonNft1 = await EaonNft.deploy("EAON NFT", "EAO");
    await eaonNft1.waitForDeployment();
    const eaonNftAddress = await eaonNft1.getAddress();
    console.log('eaonNftAddress 合约地址:', eaonNftAddress);

    console.log("开始部署 Eaon NTF Proxy");
    const NFTProxy = await ethers.getContractFactory("NFTProxy", deployer);
    const nFTProxy = await NFTProxy.deploy(eaonNftAddress, deployerAddress, "0x");
    await nFTProxy.waitForDeployment();
    const nFTProxyProxyAddress = await nFTProxy.getAddress();
    console.log("nFTProxyProxyAddress 代理地址:", nFTProxyProxyAddress);

    console.log("\n\n\n\n开始部署 Eaon Auction");
    const EaonAuction = await ethers.getContractFactory("EaonAuctionV1", deployer);
    const eaonAuction1 = await EaonAuction.deploy();
    await eaonAuction1.waitForDeployment();
    const eaonAuctionAddress = await eaonAuction1.getAddress();
    console.log('eaonAuctionAddress 合约地址:', eaonAuctionAddress);

    console.log("开始部署 Eaon Auction Proxy");
    const AuctionProxy = await ethers.getContractFactory("AuctionProxy", deployer);
    const auctionProxy = await AuctionProxy.deploy(eaonAuctionAddress, deployerAddress, "0x");
    await auctionProxy.waitForDeployment();
    const auctionProxyAddress = await auctionProxy.getAddress();
    console.log("auctionProxy 代理地址:", auctionProxyAddress);

    const eaonNft = await eaonNft1.attach(nFTProxyProxyAddress).connect(deployer);
    console.log('\n\n\n\neaon NTF 版本功能测试');
    const version = await eaonNft.version();
    console.log('version 版本:', version);
    expect(version).to.equal("V1");
    console.log('eaon NFT mint 操作');
    const tx = await eaonNft.mintNFT(user1.address, 1);
    await tx.wait();
    const balance = await eaonNft.balanceOf(user1.address);
    console.log('balance 余额:', balance);
    expect(balance).to.equal(1n);
    console.log('eaon NFT transfer 操作');
    const eaonNFTUser1 = eaonNft.connect(user1);
    const tx2 = await eaonNFTUser1.transferNFTFrom(user1.address, user2.address, 1);
    await tx2.wait();
    const balance2 = await eaonNft.balanceOf(user2.address);
    console.log('balance2 余额:', balance2);
    expect(balance2).to.equal(1n);

    console.log('\n\n\n\neaon Auction 版本功能测试');
    console.log('部署ERC20 并铸币');
    const OptimizedERC20 = await ethers.getContractFactory("OptimizedERC20", deployer);
    const optimizedERC20 = await OptimizedERC20.deploy();
    await optimizedERC20.waitForDeployment();
    const optimizedERC20Address = await optimizedERC20.getAddress();
    console.log('ERC20Address 合约地址:', optimizedERC20Address);
    const daiAmount = 50000n * 10n ** 18n;
    const tx3 = await optimizedERC20.mint(user3.address, daiAmount);
    await tx3.wait();
    const balance3 = await optimizedERC20.balanceOf(user3.address);
    console.log('balance3 余额:', balance3);
    expect(balance3).to.equal(daiAmount);

    console.log('初始化预言机');
    const eaonAuction = await eaonAuction1.attach(auctionProxyAddress).connect(deployer);
    if (networkName === 'localhost') {
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator", deployer);
      const ethFeed = await MockV3Aggregator.deploy(8, 2000n * 10n ** 8n);
      await ethFeed.waitForDeployment();
      await eaonAuction.setFeeInfos(await ethFeed.getAddress(), ethers.ZeroAddress, 18);
      const daiFeed = await MockV3Aggregator.deploy(8, 1n * 10n ** 8n);
      await daiFeed.waitForDeployment();
      await eaonAuction.setFeeInfos(await daiFeed.getAddress(), optimizedERC20Address, 18);
    } else {
      console.log('设置 Eth2UsdValue 预言机');
      const tx4 = await eaonAuction.setFeeInfos('0x694AA1769357215DE4FAC081bf1f309aDC325306', ethers.ZeroAddress, 18);
      await tx4.wait();
      console.log('设置 BTC2UsdValue 预言机');
      const tx5 = await eaonAuction.setFeeInfos('0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43', optimizedERC20Address, 8);
      await tx5.wait();

    }
    const Eth2UsdValue = await eaonAuction.getFeeInfoPrice(ethers.ZeroAddress);
    console.log("Eth2UsdValue 值是:", Eth2UsdValue.toString());
    const BTC2UsdValue = await eaonAuction.getFeeInfoPrice(optimizedERC20Address);
    console.log("BTC2UsdValue 值是:", BTC2UsdValue.toString());


    console.log('创建拍卖');
    // 将 NFT 托管到拍卖合约
    const tx6 = await eaonNft.mintNFT(deployerAddress, 2n);
    await tx6.wait();
    const tx7 = await eaonNft.transferNFTFrom(deployerAddress, auctionProxyAddress, 2n);
    await tx7.wait();
    // 通过staticcall 拿返回值
    const predictedAuctionId = await eaonAuction.startAuction.staticCall(nFTProxyProxyAddress, 2n, 10n, 1000n);
    console.log("auctionInfo auctionId:", predictedAuctionId);
    // 调用合约函数
    const startTx = await eaonAuction.startAuction(nFTProxyProxyAddress, 2n, 10n, 1000n);
    await startTx.wait();
    const auctionInfo = await eaonAuction.auctions(predictedAuctionId);
    console.log("auctionInfo 拍卖信息:", auctionInfo);

    // 如果要使用ERC20 作为支付货币，需要先 approve 合约地址
    const optimizedERC20User3 = optimizedERC20.connect(user3);
    const tx11 = await optimizedERC20User3.approve(auctionProxyAddress, daiAmount);
    await tx11.wait();
    const allowance = await optimizedERC20.allowance(user3.address, auctionProxyAddress);
    console.log('allowance 授权金额:', allowance);
    expect(allowance).to.equal(daiAmount);

        // 执行拍卖
    const user1Auction = await eaonAuction1.attach(auctionProxyAddress).connect(user1);
    const user2Auction = await eaonAuction1.attach(auctionProxyAddress).connect(user2);
    const user3Auction = await eaonAuction1.attach(auctionProxyAddress).connect(user3);
    
    const tx8 = await user1Auction.placedBid(predictedAuctionId, ethers.ZeroAddress, 10000000, {value : 10000000});
    await tx8.wait();
    const auctionInfoAfterUser1 = await eaonAuction.auctions(predictedAuctionId);
    console.log("user1 竞拍后 auctionInfo 拍卖信息:", 
      auctionInfoAfterUser1.buyer, auctionInfoAfterUser1.maxBidAmount, auctionInfoAfterUser1.maxBidAddress);
    const tx9 = await user2Auction.placedBid(predictedAuctionId, ethers.ZeroAddress, 20000001, {value : 20000001});
    await tx9.wait();
    const auctionInfoAfterUser2 = await eaonAuction.auctions(predictedAuctionId);
    console.log("user2 竞拍后 auctionInfo 拍卖信息:", 
      auctionInfoAfterUser2.buyer, auctionInfoAfterUser2.maxBidAmount, auctionInfoAfterUser2.maxBidAddress);
    
    
    const tx10 = await user3Auction.placedBid(predictedAuctionId, optimizedERC20Address, daiAmount);
    await tx10.wait();
    const auctionInfoAfterUser3 = await eaonAuction.auctions(predictedAuctionId);
    console.log("user3 竞拍后 auctionInfo 拍卖信息:", 
      auctionInfoAfterUser3.buyer, auctionInfoAfterUser3.maxBidAmount, auctionInfoAfterUser3.maxBidAddress);

    await sleep(10);

    
    const user1Address = await user1.getAddress();
    const balance34 = await ethers.provider.getBalance(user1Address);
    console.log('user1 余额 before actionWithdraw:', balance34);
    await user1Auction.actionWithdraw(predictedAuctionId, ethers.ZeroAddress);
    const balance35 = await ethers.provider.getBalance(user1Address);
    console.log('user1 余额 after actionWithdraw:', balance35);

    const user2Address = await user2.getAddress();
    const balance36 = await ethers.provider.getBalance(user2Address);
    console.log('user2 余额 before actionWithdraw:', balance36);
    await user2Auction.actionWithdraw(predictedAuctionId, ethers.ZeroAddress);
    const balance37 = await ethers.provider.getBalance(user2Address);
    console.log('user2 余额 after actionWithdraw:', balance37);

    console.log('auctionInfo 拍卖信息:', auctionInfoAfterUser3);
    await user3Auction.endAuction(predictedAuctionId);
    const balance33 = await optimizedERC20.balanceOf(user3.address);
    console.log('user3 余额 before actionWithdraw:', balance33);
    await expect(
      user1Auction.actionWithdraw(predictedAuctionId, optimizedERC20Address)
    ).to.be.rejected;
  });
});

// 封装睡眠函数：参数为秒数，返回 Promise
const sleep = (seconds: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, seconds * 1000); // 1 秒 = 1000 毫秒
  });
};

