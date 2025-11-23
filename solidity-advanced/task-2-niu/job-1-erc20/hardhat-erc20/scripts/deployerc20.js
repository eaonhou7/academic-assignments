import { network } from "hardhat";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { ethers } = await network.connect();

  const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

  const deployer = new ethers.Wallet(deployerPrivateKey, ethers.provider);
  const [approve] = await ethers.getSigners();

  console.log("开始部署 OptimizedERC20...");
  const ERC20 = await ethers.getContractFactory("OptimizedERC20", deployer);
  const eRC20 = await ERC20.deploy();
  await eRC20.waitForDeployment();
  const contractAddress = await eRC20.getAddress();
  
  console.log("OptimizedERC20合约地址:", contractAddress);
  console.log("OptimizedERC20合约部署者地址:", await deployer.getAddress());

  console.log("开始OptimizedERC20功能测试");

  console.log("铸币测试 mint");
  // 测试铸造功能
  await eRC20.mint(deployer.address, 1000000);
  const totalSupply = await eRC20.balanceOf(deployer.address);
  console.log("铸币成功:", totalSupply.toString());

  console.log("转账测试 transfer");
  await eRC20.transfer(approve.address, 1000);
  const approveBalance = await eRC20.balanceOf(approve.address);
  console.log("approve地址余额:", approveBalance.toString());

  console.log("授权测试 approve");
  await eRC20.approve(approve.address, 1000);
  const allowance = await eRC20.allowance(deployer.address, approve.address);
  console.log("approve地址授权金额:", allowance.toString());

  console.log("授权转账测试 transferFrom");
  const newErc20 = await eRC20.connect(approve);
  // 测试转账功能
  await newErc20.transferFrom(deployer.address, approve.address, 1000);
  const balance = await eRC20.allowance(deployer.address, approve.address);
  console.log("approve地址授权金额:", balance.toString());

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
