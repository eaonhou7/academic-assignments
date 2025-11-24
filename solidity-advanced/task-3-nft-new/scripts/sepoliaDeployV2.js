import pkg from "hardhat";
const { ethers, upgrades, deployments } = pkg;

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const networkName = await ethers.provider.getNetwork().then((network) => network.name);
  console.log('networkName 网络名称:', networkName);
  // const  storePath = path.resolve(__dirname, "./.cache/sepoliaProxyNftV1.json");
  const proxyDeployerPrivateKey = process.env.DEPLOY_PRIVATE_KEY || "";
  if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 DEPLOY_PRIVATE_KEY");
  const storeData = fs.readFileSync(storePath, "utf-8");
  const { eaonNftProxyAddress, eaonNft, abi } = JSON.parse(storeData);
  console.log("原代理合约地址：", eaonNftProxyAddress);
  console.log("原实现合约地址：", eaonNft);

  const deployer = new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider) ;
  const EaonNftV2 = await ethers.getContractFactory("EaonNftV2", deployer);
  const eaonNftV2Proxy = await upgrades.upgradeProxy(
    eaonNftProxyAddress,
    EaonNftV2,
    { initializer: "initializeV2", kind: 'transparent' }
  );
  await eaonNftV2Proxy.waitForDeployment();
  const eaonNftV2ProxyAddressV2 = await eaonNftV2Proxy.getAddress();
  console.log("升级后的代理合约地址：", eaonNftV2ProxyAddressV2);  // 代理合约地址是不会变的
  const implAddressV2 = await upgrades.erc1967.getImplementationAddress(eaonNftV2ProxyAddressV2)
  console.log("升级后实现合约地址：", implAddressV2);     // 只有实现合约地址会变

  // 保存合约地址到文件
  const storePathV2 = path.resolve(__dirname, "./.cache/sepoliaProxyNftV2.json");
  fs.writeFileSync(
      storePathV2,
      JSON.stringify({
          eaonNftV2ProxyAddressV2,
          implAddressV2,
          abi: EaonNftV2.interface.format("json"),
      })
  );

  const storeSepoliaProxyPathV1 = path.resolve(__dirname, "./.cache/sepoliaAuctionProxyV1.json");
  const storeData2 = fs.readFileSync(storeSepoliaProxyPathV1, "utf-8");
  const { auctionProxyProxyAddress, auctionAddress } = JSON.parse(storeData2);
  console.log("auction 原代理合约地址：", auctionProxyProxyAddress);
  console.log("auction 原实现合约地址：", auctionAddress);

  const EaonAuctionV2 = await ethers.getContractFactory("EaonAuctionV2", deployer);
  const eaonAuctionV2Proxy = await upgrades.upgradeProxy(
    auctionProxyProxyAddress,
    EaonAuctionV2,
    { kind: 'transparent' }
  );
  await eaonAuctionV2Proxy.waitForDeployment();
  const eaonAuctionV2ProxyAddressV2 = await eaonAuctionV2Proxy.getAddress();
  console.log("升级后的代理合约地址：", eaonAuctionV2ProxyAddressV2);  // 代理合约地址是不会变的
  const implAuctionAddressV2 = await upgrades.erc1967.getImplementationAddress(eaonAuctionV2ProxyAddressV2)
  console.log("升级后实现合约地址：", implAuctionAddressV2);     // 只有实现合约地址会变

  // 保存合约地址到文件
  const storeSepoliaProxyPathPathV2 = path.resolve(__dirname, "./.cache/sepoliaAuctionProxyV2.json");
  fs.writeFileSync(
      storeSepoliaProxyPathPathV2,
      JSON.stringify({
          eaonAuctionV2ProxyAddressV2,
          implAuctionAddressV2,
          abi: EaonAuctionV2.interface.format("json"),
      })
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
