import {
  SuiClient,
  SuiTransactionBlockResponse
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { ObjectOwner } from '@mysten/sui/client'
import { getAttestationRegistryId, getClient, getPackageId, Network, getAttestationRegistryTableId } from './utils';
import { SuiAddress, Version } from './types';
import bs58 from 'bs58';

export interface Attestation {
  id: string;
  schema: SuiAddress;
  ref_attestation: SuiAddress;
  attester: SuiAddress;
  txHash: string;
  time: bigint;
  revokable: boolean;
  expiration_time: bigint;
  data: Uint8Array;
  name: string;
  description: string;
  url: string;
  owner: ObjectOwner | null;
}

export interface Status {
  is_revoked: boolean;
  timestamp: string;
}

export interface AttestationRegistry {
  id: string;
  version: Version;
}

export class Sas {
  private client: SuiClient;
  private signer: Ed25519Keypair;
  private packageId: string;
  private network: Network;

  constructor(network: Network, signer: Ed25519Keypair) {
    this.client = getClient(network);
    this.signer = signer;
    this.packageId = getPackageId(network);
    this.network = network;
  }

  async attest(
    schemaRecordId: string,
    refAttestationId: string,
    recipient: string,
    expirationTime: bigint,
    data: Uint8Array,
    name: string,
    description: string,
    url: string
  ): Promise<SuiTransactionBlockResponse> {
    const registryId = getAttestationRegistryId(this.network);
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::sas::attest`,
      arguments: [
        tx.object(schemaRecordId),
        tx.object(registryId),
        tx.pure.address(refAttestationId),
        tx.pure.address(recipient),
        tx.pure.u64(expirationTime),
        tx.pure.vector('u8', data),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(url),
        tx.object(SUI_CLOCK_OBJECT_ID)
      ],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });

    return await this.client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
  }

  async attestWithResolver(
    schemaRecordId: string,
    refAttestationId: string,
    recipient: string,
    expirationTime: bigint,
    data: Uint8Array,
    name: string,
    description: string,
    url: string,
    request: string
  ): Promise<SuiTransactionBlockResponse> {
    const registryId = getAttestationRegistryId(this.network);
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::sas::attest_with_resolver`,
      arguments: [
        tx.object(schemaRecordId),
        tx.object(registryId),
        tx.pure.address(refAttestationId),
        tx.pure.address(recipient),
        tx.pure.u64(expirationTime),
        tx.pure.vector('u8', data),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(url),
        tx.object(SUI_CLOCK_OBJECT_ID),
        tx.object(request)
      ],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });

    return await this.client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
  }

  async revoke(adminId: string, schemaId: string, attestationId: string): Promise<SuiTransactionBlockResponse> {
    const attestationRegistryId = getAttestationRegistryId(this.network);
    
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::attestation_registry::revoke`,
      arguments: [
        tx.object(adminId),
        tx.object(attestationRegistryId),
        tx.object(schemaId),
        tx.object(attestationId),
      ],
    });

    return await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });
  }

  async getAttestationRegistry(): Promise<AttestationRegistry> {
    return getAttestationRegistry(this.network);
  }

  async getAttestation(id: string): Promise<Attestation> {
    return getAttestation(id, this.network);
  }
}

export async function getAttestationRegistry(network: Network): Promise<AttestationRegistry> {
  const client = getClient(network);
  const registryId = getAttestationRegistryId(network);
  const response = await client.getObject({
    id: registryId,
    options: { showContent: true, showType: true },
  });

  if (response.error) {
    throw new Error(`Failed to fetch object: ${response.error}`);
  }

  const object = response.data as any;
  const fields = object.content.fields as any;

  return {
    id: object.objectId,
    version: {
      id: fields.inner.fields.id.id,
      version: fields.inner.fields.version,
    },
  };
}

export async function getAttestation(id: string, network: Network): Promise<Attestation> {
  const client = getClient(network);
  const response = await client.getObject({
    id: id,
    options: {
      showContent: true,
      showType: true,
      showOwner: true,
      showPreviousTransaction: true
    },
  });

  if (response.error) {
    throw new Error(`Failed to fetch object: ${response.error}`);
  }

  const object = response.data;
  if (!object || !object.content || object.content.dataType !== 'moveObject') {
    throw new Error('Invalid object data');
  }

  const fields = object.content.fields as any;

  let data: Uint8Array;
  if (typeof fields.data === 'string') {
    data = Uint8Array.from(atob(fields.data), c => c.charCodeAt(0));
  } else if (Array.isArray(fields.data)) {
    data = new Uint8Array(fields.data);
  } else {
    throw new Error('Invalid data format');
  }

  return {
    id: object.objectId,
    schema: fields.schema,
    ref_attestation: fields.ref_id,
    attester: fields.attester,
    txHash: bs58.encode(fields.tx_hash),
    time: BigInt(fields.time),
    expiration_time: BigInt(fields.expireation_time),
    revokable: fields.revokable,
    data: data,
    name: fields.name,
    description: fields.description,
    url: fields.url,
    owner: response.data?.owner || null,
  };
}

export async function getAttestations(network: Network): Promise<Attestation[]> {
  const client = getClient(network);

  // Get the table id
  const tableId = await getAttestationRegistryTableId(network);

  // Get the table data
  const tableData = await client.getDynamicFields({
    parentId: tableId,
  });

  const attestationPromises = tableData.data.map(async (dataItem) => {
    // Get the table item
    const tableItem = await client.getObject({
      id: dataItem.objectId,
      options: { showContent: true, showType: true },
    });

    // key is the attestation id
    const attestationId = (tableItem.data?.content as any).fields.name;

    return getAttestation(attestationId, network);
  });

  const attestations = await Promise.all(attestationPromises);

  return attestations;
}

export async function getAttestationRegistryTable(network: Network): Promise<string> {
  const client = getClient(network);
  const schemaRegistry = await getAttestationRegistry(network);
  const res = await client.getDynamicFieldObject({
    parentId: schemaRegistry.version.id,
    name: {
      type: 'u64',
      value: schemaRegistry.version.version,
    },
  });
  return (res.data?.content as any).fields.value.fields.attestations_status.fields.id.id;
}