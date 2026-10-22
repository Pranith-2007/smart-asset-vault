
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SmartAssetVaultModule = buildModule(
  "SmartAssetVaultModule",
  (m) => {
    const vault = m.contract("SmartAssetVault");

    return { vault };
  }
);

export default SmartAssetVaultModule;
