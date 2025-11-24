const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("EaonNftV1", function () {
  let owner, user1, user2;
  let nft;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // 部署 EaonNftV1 合约
    const NftV1 = await ethers.getContractFactory("EaonNftV1");
    nft = await upgrades.deployProxy(NftV1, ["EAON NFT", "EAO", "https://api.example.com/metadata/"], { 
      initializer: "initialize", 
      kind: "transparent" 
    });
    await nft.waitForDeployment();
  });

  it("初始化和基本功能测试", async () => {
    expect(await nft.name()).to.equal("EAON NFT");
    expect(await nft.symbol()).to.equal("EAO");
    expect(await nft.version()).to.equal("V1");
  });

  it("mintNFT 功能测试", async () => {
    await expect(nft.connect(user1).mintNFT(user1.address, 1))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, user1.address, 1);
    
    expect(await nft.ownerOf(1)).to.equal(user1.address);
    expect(await nft.balanceOf(user1.address)).to.equal(1);
  });

  it("transferNFTFrom 功能测试", async () => {
    await nft.connect(user1).mintNFT(user1.address, 1);
    await nft.connect(user1).approve(user2.address, 1);
    
    await expect(nft.connect(user2).transferNFTFrom(user1.address, user2.address, 1))
      .to.emit(nft, "Transfer")
      .withArgs(user1.address, user2.address, 1);
    
    expect(await nft.ownerOf(1)).to.equal(user2.address);
    expect(await nft.balanceOf(user1.address)).to.equal(0);
    expect(await nft.balanceOf(user2.address)).to.equal(1);
  });

  it("supportsInterface 函数测试", async () => {
    // ERC165 interface ID
    const ERC165_INTERFACE_ID = "0x01ffc9a7";
    expect(await nft.supportsInterface(ERC165_INTERFACE_ID)).to.be.true;
    
    // ERC721 interface ID
    const ERC721_INTERFACE_ID = "0x80ac58cd";
    expect(await nft.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    
    // ERC721Metadata interface ID
    const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
    expect(await nft.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.be.true;
    
    // 不支持的接口
    const UNSUPPORTED_INTERFACE_ID = "0xffffffff";
    expect(await nft.supportsInterface(UNSUPPORTED_INTERFACE_ID)).to.be.false;
  });

  it("tokenURI 函数测试", async () => {
    await nft.connect(user1).mintNFT(user1.address, 1);
    
    // 测试默认的tokenURI - 由于没有设置具体URI，会返回空字符串或revert
    const defaultURI = await nft.tokenURI(1);
    // 如果没有设置URI，ERC721URIStorage会返回空字符串
    expect(defaultURI).to.be.a('string');
  });

  it("tokenURI 不存在的tokenId测试", async () => {
    await expect(nft.tokenURI(999))
      .to.be.reverted;
  });

  it("版本函数测试", async () => {
    expect(await nft.version()).to.equal("V1");
  });

  it("权限测试", async () => {
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("批量mint和转移测试", async () => {
    // 批量mint
    await nft.connect(user1).mintNFT(user1.address, 1);
    await nft.connect(user1).mintNFT(user1.address, 2);
    await nft.connect(user2).mintNFT(user2.address, 3);
    
    expect(await nft.balanceOf(user1.address)).to.equal(2);
    expect(await nft.balanceOf(user2.address)).to.equal(1);
    
    // 测试每个token的所有权
    expect(await nft.ownerOf(1)).to.equal(user1.address);
    expect(await nft.ownerOf(2)).to.equal(user1.address);
    expect(await nft.ownerOf(3)).to.equal(user2.address);
  });

  it("approve和setApprovalForAll测试", async () => {
    await nft.connect(user1).mintNFT(user1.address, 1);
    
    // 单个token授权
    await nft.connect(user1).approve(user2.address, 1);
    expect(await nft.getApproved(1)).to.equal(user2.address);
    
    // 全部授权
    await nft.connect(user1).setApprovalForAll(user2.address, true);
    expect(await nft.isApprovedForAll(user1.address, user2.address)).to.be.true;
    
    // 取消全部授权
    await nft.connect(user1).setApprovalForAll(user2.address, false);
    expect(await nft.isApprovedForAll(user1.address, user2.address)).to.be.false;
  });
});

describe("EaonAuctionV1", function () {
  let owner, seller, bidder1, bidder2;
  let nft, auction, aggregator, erc20;

  beforeEach(async () => {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // 部署 MockV3Aggregator 预言机合约
    const Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    aggregator = await Aggregator.deploy(8, ethers.parseUnits("2000", 8));
    await aggregator.waitForDeployment();
    // 部署 ERC20 代币
    const ERC20 = await ethers.getContractFactory("OptimizedERC20");
    erc20 = await ERC20.deploy();
    await erc20.waitForDeployment();

    // 部署 EaonNftV1 合约 并指定 透明代理
    const NftV1 = await ethers.getContractFactory("EaonNftV1");
    nft = await upgrades.deployProxy(NftV1, ["EAON NFT", "EAO", "base"], { initializer: "initialize", kind: "transparent" });
    await nft.waitForDeployment();

    // 部署 EaonAuctionV1 合约
    const AuctionV1 = await ethers.getContractFactory("EaonAuctionV1");
    auction = await upgrades.deployProxy(AuctionV1, [1], { initializer: "initialize", kind: "transparent" });
    await auction.waitForDeployment();

    // 设置拍卖合约的预言机地址
    await auction.connect(owner).setFeeInfos(await aggregator.getAddress(), ethers.ZeroAddress, 18);
    await auction.connect(owner).setFeeInfos(await aggregator.getAddress(), await erc20.getAddress(), 18);

    // 铸造 NFT 并授权拍卖合约
    await nft.connect(seller).mintNFT(seller.address, 1);
    await nft.connect(seller).approve(await auction.getAddress(), 1);
  });

  it("创建拍卖并验证emit", async () => {
    await expect(auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60))
      .to.emit(auction, "AuctionStarted")
      .withArgs(1, await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60, seller.address);
  });

  it("提交出价并验证边界", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60);

    const bidAmount1 = ethers.parseEther("0.05"); // 100 USD threshold at 2000 USD/ETH implies 0.05 ETH
    await expect(auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, bidAmount1, { value: bidAmount1 }))
      .to.emit(auction, "BidPlaced");

    const lowerBid = ethers.parseEther("0.049");
    await expect(auction.connect(bidder2).placedBid(1, ethers.ZeroAddress, lowerBid, { value: lowerBid }))
      .to.be.revertedWith("below start price");

    const bidAmount2 = ethers.parseEther("0.06");
    await expect(auction.connect(bidder2).placedBid(1, ethers.ZeroAddress, bidAmount2, { value: bidAmount2 }))
      .to.emit(auction, "BidPlaced");

    const lowerThanMax = ethers.parseEther("0.055");
    await expect(auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, lowerThanMax, { value: lowerThanMax }))
      .to.be.revertedWith("bid price lower than max price");
  });

  it("预言机权限校验", async () => {
    const Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const agg2 = await Aggregator.deploy(8, ethers.parseUnits("2000", 8));
    await agg2.waitForDeployment();
    await expect(auction.connect(bidder1).setFeeInfos(await agg2.getAddress(), ethers.ZeroAddress, 18))
      .to.be.revertedWithCustomError(auction, "OwnableUnauthorizedAccount");
  });

  it("结束竞拍，NFT转移，校验出价人接收ETH", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 10);
    const bidAmount1 = ethers.parseEther("0.05");
    await auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, bidAmount1, { value: bidAmount1 });

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await expect(auction.connect(bidder1).endAuction(1)).to.be.revertedWith("not seller");
    await expect(auction.connect(seller).endAuction(1))
      .to.emit(auction, "AuctionEnded");

    expect(await nft.ownerOf(1)).to.equal(bidder1.address);
  });

  it("退款并校验退款是否到账", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 10);
    const b1 = ethers.parseEther("0.051");
    await auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, b1, { value: b1 });
    const b2 = ethers.parseEther("0.06");
    await auction.connect(bidder2).placedBid(1, ethers.ZeroAddress, b2, { value: b2 });

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);
    await auction.connect(seller).endAuction(1);

    await expect(auction.connect(bidder1).actionWithdraw(1, ethers.ZeroAddress))
      .to.emit(auction, "Withdrawn")
      .withArgs(1, bidder1.address, ethers.ZeroAddress, b1);
  });

  it("ERC20 出价、授权校验与结算/退款", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 10);
    // 设定 ERC20 价格为 100 USD
    const agg = await aggregator.getAddress();
    const MockAgg = await ethers.getContractAt("MockV3Aggregator", agg);
    await MockAgg.setAnswer(ethers.parseUnits("100", 8));

    const erc20Addr = await erc20.getAddress();
    // 铸币给竞价者
    await erc20.connect(owner).mint(bidder1.address, ethers.parseUnits("1000", 18));
    await erc20.connect(owner).mint(bidder2.address, ethers.parseUnits("1000", 18));

    const amt1 = ethers.parseUnits("1.01", 18); // 101 USD
    await expect(auction.connect(bidder1).placedBid(1, erc20Addr, amt1))
      .to.be.revertedWith("not enough token");
    await erc20.connect(bidder1).approve(await auction.getAddress(), amt1);
    await expect(auction.connect(bidder1).placedBid(1, erc20Addr, amt1))
      .to.emit(auction, "BidPlaced");

    const amt2 = ethers.parseUnits("1.20", 18); // 120 USD
    await erc20.connect(bidder2).approve(await auction.getAddress(), amt2);
    await expect(auction.connect(bidder2).placedBid(1, erc20Addr, amt2))
      .to.emit(auction, "BidPlaced");

    // 向前推进 11 秒，确保拍卖结束
    await ethers.provider.send("evm_increaseTime", [11]);
    // 确认区块高度增加
    await ethers.provider.send("evm_mine", []);

    const sellerBalBefore = await erc20.balanceOf(seller.address);
    await auction.connect(seller).endAuction(1);
    const sellerBalAfter = await erc20.balanceOf(seller.address);
    expect(sellerBalAfter - sellerBalBefore).to.equal(amt2);
    expect(await nft.ownerOf(1)).to.equal(bidder2.address);

    await expect(auction.connect(bidder1).actionWithdraw(1, erc20Addr))
      .to.emit(auction, "Withdrawn")
      .withArgs(1, bidder1.address, erc20Addr, amt1);
  });

  it("getTokenPrice price too later 测试", async () => {
    // 创建一个新的预言机
    const OldAggregator = await ethers.getContractFactory("MockV3Aggregator");
    const oldAgg = await OldAggregator.deploy(8, ethers.parseUnits("2000", 8));
    await oldAgg.waitForDeployment();
    
    // 设置预言机信息
    await auction.connect(owner).setFeeInfos(await oldAgg.getAddress(), ethers.ZeroAddress, 18);
    
    // 推进时间超过1小时（3600秒）
    await ethers.provider.send("evm_increaseTime", [3700]);
    await ethers.provider.send("evm_mine", []);
    
    // 启动拍卖
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60);
    
    // 尝试出价，会触发getTokenPrice的过期检查
    await expect(auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, ethers.parseEther("0.06"), { value: ethers.parseEther("0.06") }))
      .to.be.revertedWith("Price too later");
  });

  it("getFeeInfoPrice feed not set 测试", async () => {
    const unknownToken = "0x1234567890123456789012345678901234567890";
    await expect(auction.getFeeInfoPrice(unknownToken))
      .to.be.revertedWith("feed not set");
  });

  it("startAuction 边界条件测试", async () => {
    // 测试无效的nft地址
    await expect(auction.connect(seller).startAuction(ethers.ZeroAddress, 1, ethers.parseUnits("100", 8), 60))
      .to.be.revertedWith("invalid nft address");
    
    // 测试无效的duration
    await expect(auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 0))
      .to.be.revertedWith("invalid duration");
    
    // 测试无效的start price
    await expect(auction.connect(seller).startAuction(await nft.getAddress(), 1, 0, 60))
      .to.be.revertedWith("invalid start price");
    
    // 测试非nft所有者
    await expect(auction.connect(bidder1).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60))
      .to.be.revertedWith("not nft owner");
  });

  it("placedBid amount not equan value 测试", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 60);
    
    // 测试ETH出价时amount与msg.value不匹配
    const bidAmount = ethers.parseEther("0.06");
    await expect(auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, bidAmount, { value: ethers.parseEther("0.05") }))
      .to.be.revertedWith("amount not equan value");
  });

  it("endAuction no bids 测试", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 10);
    
    // 向前推进时间结束拍卖，但没有人出价
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);
    
    await expect(auction.connect(seller).endAuction(1))
      .to.be.revertedWith("no bids");
  });

  it("version 函数测试", async () => {
    expect(await auction.version()).to.equal("V1");
  });

  it("actionWithdraw transfer failed 测试", async () => {
    await auction.connect(seller).startAuction(await nft.getAddress(), 1, ethers.parseUnits("100", 8), 10);
    
    const bidAmount = ethers.parseEther("0.05");
    await auction.connect(bidder1).placedBid(1, ethers.ZeroAddress, bidAmount, { value: bidAmount });
    
    const higherBid = ethers.parseEther("0.06");
    await auction.connect(bidder2).placedBid(1, ethers.ZeroAddress, higherBid, { value: higherBid });
    
    // 等待拍卖结束
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);
    
    await auction.connect(seller).endAuction(1);
    
    // 测试正常的退款流程
    await expect(auction.connect(bidder1).actionWithdraw(1, ethers.ZeroAddress))
      .to.emit(auction, "Withdrawn")
      .withArgs(1, bidder1.address, ethers.ZeroAddress, bidAmount);
  });
});