import { network } from "hardhat";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
    const { ethers } = await network.connect();
    console.log("开始部署代理合约...");

    const deployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
    if (!deployerPrivateKey) {
      throw new Error("请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY");
    }

    const deployer = new ethers.Wallet(deployerPrivateKey, ethers.provider);
    console.log("✅ 自定义部署者地址:", deployer.address);
    console.log("部署者余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // 部署 TransparentProxy 作为目标合约，并制定部署者
    const TransparentProxy = await ethers.getContractFactory("TransparentProxy", deployer);
    console.log("正在部署 TransparentProxy 逻辑合约...");

    const transparentProxy = await TransparentProxy.deploy();
    console.log("⏳ 等待交易确认...");
    await transparentProxy.waitForDeployment();
    console.log("✅ 逻辑合约地址:", transparentProxy.target);

    const transparentProxy2 = await TransparentProxy.deploy();
    console.log("⏳ 等待交易确认...");
    await transparentProxy2.waitForDeployment();
    console.log("✅ 逻辑合约2地址:", transparentProxy2.target);


    // 验证合约功能
    console.log("\n正在初始部署...");
    // 指定合约调用者
    transparentProxy.connect(deployer);
    await transparentProxy.initable('0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f');
    const imp = await transparentProxy.retrive();
    console.log(imp);

    await transparentProxy.upgrade('0x2546bcd3c84621e976d8185a91a922ae77ecec30');
    console.log("\n正在更新目标地址...");

    const imp2 = await transparentProxy.retrive2();
    console.log("\n获取新目标合约地址...", imp2);

    console.log("\nover");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
