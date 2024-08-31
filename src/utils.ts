import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX, bcs } from '@mysten/bcs';
import { PACKAGES } from "./constants";

import dotenv from 'dotenv';
dotenv.config();

export const Address = bcs.bytes(32).transform({
	// To change the input type, you need to provide a type definition for the input
	input: (val: string) => fromHEX(val),
	output: (val) => toHEX(val),
});

export const ZeroAddress = Address.parse(new Uint8Array(32));

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

export function getSchemaRegistryTableId(network: Network): string {
  switch (network) {
    case 'mainnet':
      return PACKAGES.mainnet.SchemaRegistryTableID;
    case 'testnet':
      return PACKAGES.testnet.SchemaRegistryTableID;
    case 'devnet':
      return PACKAGES.devnet.SchemaRegistryTableID;
    case 'movement':
      return PACKAGES.movement.SchemaRegistryTableID;
    default:
      throw new Error('Invalid network');
  }
}

export function getAttestationRegistryTableId(network: Network): string {
  switch (network) {
    case 'mainnet':
      return PACKAGES.mainnet.AttestationRegistryTableID;
    case 'testnet':
      return PACKAGES.testnet.AttestationRegistryTableID;
    case 'devnet':
      return PACKAGES.devnet.AttestationRegistryTableID;
    case 'movement':
      return PACKAGES.movement.AttestationRegistryTableID;
    default:
      throw new Error('Invalid network');
  }
}