import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, bcs } from '@mysten/bcs';
import { PACKAGES } from "./constants";

import dotenv from 'dotenv';
dotenv.config();

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet' | 'movement'

export function getClient(network: Network): SuiClient {
  let rpcUrl;
  if (network != 'movement') {
    rpcUrl = getFullnodeUrl(network);
  } else {
    rpcUrl = 'https://devnet.baku.movementlabs.xyz:443'
  }
  return new SuiClient({ url: rpcUrl });
}

export function getKeypair(): Ed25519Keypair {
  const SECRET_KEY = process.env.SECRET_KEY;
  if (!SECRET_KEY) {
    return Ed25519Keypair.generate();
  }
  return Ed25519Keypair.fromSecretKey(fromHEX(SECRET_KEY));
}

export function getPackageId(network: Network): string {
  switch (network) {
    case 'mainnet':
      return PACKAGES.mainnet.PackageID;
    case 'testnet':
      return PACKAGES.testnet.PackageID;
    case 'devnet':
      return PACKAGES.devnet.PackageID;
    case 'movement':
      return PACKAGES.movement.PackageID;
    default:
      throw new Error('Invalid network');
  }
}

export function getSchemaRegistryId(network: Network): string {
  switch (network) {
    case 'mainnet':
      return PACKAGES.mainnet.SchemaRegistryID;
    case 'testnet':
      return PACKAGES.testnet.SchemaRegistryID;
    case 'devnet':
      return PACKAGES.devnet.SchemaRegistryID;
      case 'movement':
      return PACKAGES.movement.SchemaRegistryID;
    default:
      throw new Error('Invalid network');
  }
}

export function getAttestationRegistryId(network: Network): string {
  switch (network) {
    case 'mainnet':
      return PACKAGES.mainnet.AttestationRegistryID;
    case 'testnet':
      return PACKAGES.testnet.AttestationRegistryID;
    case 'devnet':
      return PACKAGES.devnet.AttestationRegistryID;
    case 'movement':
      return PACKAGES.movement.AttestationRegistryID;
    default:
      throw new Error('Invalid network');
  }
}