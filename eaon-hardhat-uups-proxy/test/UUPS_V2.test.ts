import { network } from "hardhat";
import { expect } from "chai";


describe("UUPS V2 升级", function () {
  it("升级到 UpV2 并保留数据与新功能", async function () {
    const { ethers } = await network.connect();
    const [admin, user] = await ethers.getSigners();


    const UUPSProxy = await ethers.getContractFactory("UUPSProxy", admin);
    const proxy = await UUPSProxy.deploy();
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();


    const UpV1 = await ethers.getContractFactory("UpV1", admin);
    const impl1 = await UpV1.deploy();
    await impl1.waitForDeployment();
    const initData = impl1.interface.encodeFunctionData("initialize", [admin.address]);
    await (await proxy.initable(await impl1.getAddress(), initData)).wait();


    const upV1 = UpV1.attach(proxyAddress).connect(user);
    await (await upV1.store(12)).wait();
    await (await upV1.setName("Keep Data")).wait();


    const UpV2 = await ethers.getContractFactory("UpV2", admin);
    const impl2 = await UpV2.deploy();
    await impl2.waitForDeployment();


    const upV1Admin = UpV1.attach(proxyAddress).connect(admin);
    await (await upV1Admin.upgradeTo(await impl2.getAddress())).wait();


    const upV2 = UpV2.attach(proxyAddress).connect(user);
    expect(await upV2.retrieve()).to.equal(12);
    expect(await upV2.getName()).to.equal("Keep Data");
    expect(await upV2.getVersion()).to.equal("UpV2");


    await (await upV2.setUserValue(888)).wait();
    expect(await upV2.getUserValue(user.address)).to.equal(888);
    await (await upV2.increment()).wait();
    expect(await upV2.retrieve()).to.equal(13);
    await (await upV2.multiply(2)).wait();
    expect(await upV2.retrieve()).to.equal(26);
  });
});
