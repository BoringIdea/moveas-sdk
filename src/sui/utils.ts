import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX, bcs } from '@mysten/bcs';
import { PACKAGES } from "../constants";

import dotenv from 'dotenv';
dotenv.config();

export const Address = bcs.bytes(32).transform({
	// To change the input type, you need to provide a type definition for the input
	input: (val: string) => fromHEX(val),
	output: (val) => toHEX(val),
});

export const ZeroAddress = Address.parse(new Uint8Array(32));

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet'

export function getClient(chain: string, network: Network): SuiClient {
  let rpcUrl;
  if (chain != 'movement') {
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

export function getPackageId(chain: string, network: Network): string {
  if (chain === 'sui') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.sui.network.mainnet.PackageID;
      case 'testnet':
        return PACKAGES.sui.network.testnet.PackageID;
      case 'devnet':
        return PACKAGES.sui.network.devnet.PackageID;
      default:
        throw new Error('Invalid network');
    }
  } else if (chain === 'movement') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.movement.network.mainnet.PackageID;
      case 'testnet':
        return PACKAGES.movement.network.testnet.PackageID;
      case 'devnet':
        return PACKAGES.movement.network.devnet.PackageID;
      default:
        throw new Error('Invalid network');
    }
  } else {
    throw new Error('Invalid chain');
  }
}

export function getSchemaRegistryId(chain: string, network: Network): string {
  if (chain === 'sui') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.sui.network.mainnet.SchemaRegistryID;
      case 'testnet':
        return PACKAGES.sui.network.testnet.SchemaRegistryID;
      case 'devnet':
        return PACKAGES.sui.network.devnet.SchemaRegistryID;
      default:
        throw new Error('Invalid network');
    }
  } else if (chain === 'movement') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.movement.network.mainnet.SchemaRegistryID;
      case 'testnet':
        return PACKAGES.movement.network.testnet.SchemaRegistryID;
      case 'devnet':
        return PACKAGES.movement.network.devnet.SchemaRegistryID;
      default:
        throw new Error('Invalid network');
    }
  } else {
    throw new Error('Invalid chain');
  }
}

export function getAttestationRegistryId(chain: string, network: Network): string {
  if (chain === 'sui') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.sui.network.mainnet.AttestationRegistryID;
      case 'testnet':
        return PACKAGES.sui.network.testnet.AttestationRegistryID;
      case 'devnet':
        return PACKAGES.sui.network.devnet.AttestationRegistryID;
      default:
        throw new Error('Invalid network');
    }
  } else if (chain === 'movement') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.movement.network.mainnet.AttestationRegistryID;
      case 'testnet':
        return PACKAGES.movement.network.testnet.AttestationRegistryID;
      case 'devnet':
        return PACKAGES.movement.network.devnet.AttestationRegistryID;
      default:
        throw new Error('Invalid network');
    }
  } else {
    throw new Error('Invalid chain');
  }
}

export function getSchemaRegistryTableId(chain: string, network: Network): string {
  if (chain === 'sui') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.sui.network.mainnet.SchemaRegistryTableID;
      case 'testnet':
        return PACKAGES.sui.network.testnet.SchemaRegistryTableID;
      case 'devnet':
        return PACKAGES.sui.network.devnet.SchemaRegistryTableID;
      default:
        throw new Error('Invalid network');
    }
  } else if (chain === 'movement') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.movement.network.mainnet.SchemaRegistryTableID;
      case 'testnet':
        return PACKAGES.movement.network.testnet.SchemaRegistryTableID;
      case 'devnet':
        return PACKAGES.movement.network.devnet.SchemaRegistryTableID;
      default:
        throw new Error('Invalid network');
    }
  } else {
    throw new Error('Invalid chain');
  }
}

export function getAttestationRegistryTableId(chain: string, network: Network): string {
  if (chain === 'sui') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.sui.network.mainnet.AttestationRegistryTableID;
      case 'testnet':
        return PACKAGES.sui.network.testnet.AttestationRegistryTableID;
      case 'devnet':
        return PACKAGES.sui.network.devnet.AttestationRegistryTableID;
      default:
        throw new Error('Invalid network');
      }
  } else if (chain === 'movement') {
    switch (network) {
      case 'mainnet':
        return PACKAGES.movement.network.mainnet.AttestationRegistryTableID;
      case 'testnet':
        return PACKAGES.movement.network.testnet.AttestationRegistryTableID;
      case 'devnet':
        return PACKAGES.movement.network.devnet.AttestationRegistryTableID;
      default:
        throw new Error('Invalid network');
    }
  } else {
    throw new Error('Invalid chain');
  }
}