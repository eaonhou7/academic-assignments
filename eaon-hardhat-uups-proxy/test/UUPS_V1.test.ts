import { network } from "hardhat";
import { expect } from "chai";


describe("UUPS V1", function () {
  it("部署 UUPSProxy + UpV1 并初始化与调用", async function () {
    const { ethers } = await network.connect();
    const [admin, user] = await ethers.getSigners();


    const UUPSProxy = await ethers.getContractFactory("UUPSProxy", admin);
    const proxy = await UUPSProxy.deploy();
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();


    const UpV1 = await ethers.getContractFactory("UpV1", admin);
    const impl = await UpV1.deploy();
    await impl.waitForDeployment();
    const initData = impl.interface.encodeFunctionData("initialize", [admin.address]);
    await (await proxy.initable(await impl.getAddress(), initData)).wait();


    const upV1 = UpV1.attach(proxyAddress).connect(user);
    await (await upV1.store(100)).wait();
    expect(await upV1.retrieve()).to.equal(100);
    await (await upV1.setName("UUPS V1")).wait();
    expect(await upV1.getName()).to.equal("UUPS V1");
    expect(await upV1.getVersion()).to.equal("UpV1");
  });


  it("非所有者不能升级", async function () {
    const { ethers } = await network.connect();
    const [admin, user] = await ethers.getSigners();


    const UUPSProxy = await ethers.getContractFactory("UUPSProxy", admin);
    const proxy = await UUPSProxy.deploy();
    await proxy.waitForDeployment();


    const UpV1 = await ethers.getContractFactory("UpV1", admin);
    const impl = await UpV1.deploy();
    await impl.waitForDeployment();
    const initData = impl.interface.encodeFunctionData("initialize", [admin.address]);
    await (await proxy.initable(await impl.getAddress(), initData)).wait();


    const UpV2 = await ethers.getContractFactory("UpV2", admin);
    const impl2 = await UpV2.deploy();
    await impl2.waitForDeployment();


    const upV1User = UpV1.attach(await proxy.getAddress()).connect(user);
    await expect(upV1User.upgradeTo(await impl2.getAddress())).to.be.revertedWith("Only owner");
  });
});
