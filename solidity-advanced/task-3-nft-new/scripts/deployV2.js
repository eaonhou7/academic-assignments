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
  let storePath;
  if(networkName === 'localhost'){
    storePath = path.resolve(__dirname, "./.cache/proxyNftV1.json");
  }else{
    proxyDeployerPrivateKey = process.env.DEPLOY_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 DEPLOY_PRIVATE_KEY");
  }
  let proxyDeployerPrivateKey;
  if(networkName === 'localhost'){
    proxyDeployerPrivateKey = process.env.PROXY_DEPLOYER_PRIVATE_KEY || "";
    if (!proxyDeployerPrivateKey) throw new Error("请在 .env 文件中设置 PROXY_DEPLOYER_PRIVATE_KEY");
  }
  const storeData = fs.readFileSync(storePath, "utf-8");
  const { eaonNftProxyAddress, eaonNft, abi } = JSON.parse(storeData);
  console.log("原代理合约地址：", eaonNftProxyAddress);
  console.log("原实现合约地址：", eaonNft);

  const deployer = proxyDeployerPrivateKey ? new ethers.Wallet(proxyDeployerPrivateKey, ethers.provider) : undefined;
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
  const storePathV2 = path.resolve(__dirname, "./.cache/proxyNftV2.json");
  fs.writeFileSync(
      storePathV2,
      JSON.stringify({
          eaonNftV2ProxyAddressV2,
          implAddressV2,
          abi: EaonNftV2.interface.format("json"),
      })
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
