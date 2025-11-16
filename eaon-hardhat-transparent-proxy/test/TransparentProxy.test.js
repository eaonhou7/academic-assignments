const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");


describe("透明代理合约测试", function () {
  let box;
  let owner, user1;


  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();


    const BoxV1 = await ethers.getContractFactory("BoxV1");
    box = await upgrades.deployProxy(BoxV1, [], {
      initializer: false,
      kind: 'transparent'
    });
    await box.waitForDeployment();
  });


  it("应该正确部署 V1 合约", async function () {
    expect(await box.getVersion()).to.equal("V1");
  });


  it("应该能够存储和检索数值", async function () {
    await box.store(100);
    expect(await box.retrieve()).to.equal(100);
  });


  it("应该能够设置和获取名称", async function () {
    await box.setName("Test Box");
    expect(await box.getName()).to.equal("Test Box");
  });


  it("应该成功升级到 V2 并保留数据", async function () {
    // 在 V1 中设置一些数据
    await box.store(42);
    await box.setName("Upgrade Test");


    // 升级到 V2
    const BoxV2 = await ethers.getContractFactory("BoxV2");
    const boxV2 = await upgrades.upgradeProxy(await box.getAddress(), BoxV2);


    // 验证数据保留
    expect(await boxV2.retrieve()).to.equal(42);
    expect(await boxV2.getName()).to.equal("Upgrade Test");
    expect(await boxV2.getVersion()).to.equal("V2");
  });


  it("应该可以使用 V2 的新功能", async function () {
    const BoxV2 = await ethers.getContractFactory("BoxV2");
    const boxV2 = await upgrades.upgradeProxy(await box.getAddress(), BoxV2);


    // 测试新功能
    await boxV2.setUserValue(999);
    expect(await boxV2.getUserValue(owner.address)).to.equal(999);


    await boxV2.store(10);
    await boxV2.increment();
    expect(await boxV2.retrieve()).to.equal(11);


    await boxV2.multiply(3);
    expect(await boxV2.retrieve()).to.equal(33);
  });


  it("应该返回正确的实现地址", async function () {
    const proxyAddress = await box.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);


    expect(implementationAddress).to.not.equal(ethers.ZeroAddress);
    expect(adminAddress).to.not.equal(ethers.ZeroAddress);
    console.log("实现地址:", implementationAddress);
    console.log("管理员地址:", adminAddress);
  });
});
