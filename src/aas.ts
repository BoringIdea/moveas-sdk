import { Account, Aptos, AptosConfig, Network, CommittedTransactionResponse, Hex } from "@aptos-labs/ts-sdk";
import { createSurfClient } from '@thalalabs/surf';
import { getPackageId } from './utils';

export interface AptosSchema {
  id: string;
  incrementId: number;
  name: string;
  description: string;
  uri: string;
  creator: string;
  createdAt: number;
  schema: Uint8Array;
  revokable: boolean;
  onlyAttestByCreator: boolean;
  attestationCnt: number;
  txHash?: string;
  resolver?: string;
}

export interface AptosAttestation {
  id: string;
  attester: string;
  recipient: string;
  schemaAddr: string;
  refId: string;
  time: number;
  expirationTime: number;
  revocationTime: number;
  revokable: boolean;
  data: any;
  txHash?: string;
}

export class Aas {
  private account: Account;
  private aptosClient: Aptos;
  private surfClient: any;
  private network: Network;
  private packageId: string;

  constructor(account: Account, network: Network) {
    this.network = network;
    this.aptosClient = new Aptos(new AptosConfig({ network }));
    this.account = account;
    this.surfClient = createSurfClient(this.aptosClient)
    this.packageId = getPackageId('aptos', this.network as any);
  }

  async createSchema(
    schema: Uint8Array,
    name: string,
    description: string,
    uri: string,
    revokable: boolean,
    onlyAttestByCreator: boolean
  ): Promise<CommittedTransactionResponse> {
    const transaction = await this.aptosClient.transaction.build.simple({
      sender: this.account.accountAddress,
      data: {
        function: `${this.packageId}::aas::create_schema`,
        functionArguments: [
          schema, 
          name, 
          description, 
          uri, 
          revokable, 
          onlyAttestByCreator
        ]
      }
    });

    const tx = await this.aptosClient.transaction.signAndSubmitTransaction({
      signer: this.account,
      transaction
    });

    return await this.aptosClient.waitForTransaction({ transactionHash: tx.hash });
  }

  async createAttestation(
    recipient: string,
    schemaAddr: string,
    refId: string,
    expirationTime: number,
    revokable: boolean,
    data: Uint8Array
  ): Promise<CommittedTransactionResponse> {
    const transaction = await this.aptosClient.transaction.build.simple({
      sender: this.account.accountAddress,
      data: {
        function: `${this.packageId}::aas::create_attestation`,
        functionArguments: [recipient, schemaAddr, refId, expirationTime, revokable, data]
      }
    });

    const tx = await this.aptosClient.transaction.signAndSubmitTransaction({
      signer: this.account,
      transaction
    });

    return await this.aptosClient.waitForTransaction({ transactionHash: tx.hash });
  }

  async revokeAttestation(
    schemaAddr: string,
    attestationId: Uint8Array
  ): Promise<CommittedTransactionResponse> {
    const transaction = await this.aptosClient.transaction.build.simple({
      sender: this.account.accountAddress,
      data: {
        function: `${this.packageId}::aas::revoke_attestation`,
        functionArguments: [schemaAddr, attestationId]
      }
    });

    const tx = await this.aptosClient.transaction.signAndSubmitTransaction({
      signer: this.account,
      transaction
    });

    return await this.aptosClient.waitForTransaction({ transactionHash: tx.hash });
  }

  async getSchema(schemaAddr: string): Promise<AptosSchema> {
    return getAptosSchema(this.network, schemaAddr);
  }

  async getAttestation(attestationId: Uint8Array): Promise<AptosAttestation> {
    return getAptosAttestation(this.network, attestationId);
  }
}

export async function getAptosAttestations(network: Network, start: number, limit: number): Promise<AptosAttestation[]> {
    const aptosClient = new Aptos(new AptosConfig({ network }));
    const packageId = getPackageId('aptos', network as any);
    const res = await aptosClient.view(
      {
        payload: {
          function: `${packageId}::aas::get_all_attestation_ids`,
          functionArguments: [start, limit]
        }
      }
    )

    const attestationIds = res[0] as Array<any>;

    let attestations: AptosAttestation[] = [];
    for (const attestationId of attestationIds) {
      attestations.push(await getAptosAttestation(network, attestationId));
    }
    return attestations;
}

export async function getAptosSchemas(network: Network, start: number, limit: number): Promise<AptosSchema[]> {
    const aptosClient = new Aptos(new AptosConfig({ network }));
    const packageId = getPackageId('aptos', network as any);
    const res = await aptosClient.view(
      {
        payload: {
          function: `${packageId}::aas::get_schema_addresses`,
          functionArguments: [start, limit]
        }
      }
    )

    const schemaAddresses = res[0] as Array<any>;

    let schemas: AptosSchema[] = [];
    for (const schemaAddr of schemaAddresses) {
      schemas.push(await getAptosSchema(network, schemaAddr?.toString() || ""));
    }
    return schemas;
}

export async function getAptosSchema(network: Network, schemaAddr: string): Promise<AptosSchema> {
    const aptosClient = new Aptos(new AptosConfig({ network }));
    const packageId = getPackageId('aptos', network as any);
    const schema = await aptosClient.view(
      {
        payload: {
          function: `${packageId}::aas::unpack_schema`,
          functionArguments: [schemaAddr]
        }
      }
    )

    if (!schema) {
      throw new Error("Schema not found");
    }

    return {
      id: schemaAddr,
      incrementId: schema[0] as number,
      name: schema[1]?.toString() || "",
      description: schema[2]?.toString() || "",
      uri: schema[3]?.toString() || "",
      creator: schema[4]?.toString() || "",
      createdAt: schema[5] as number,
      schema: Hex.fromHexString(schema[6] as any).toUint8Array(),
      revokable: schema[7] as boolean,
      onlyAttestByCreator: schema[8] as boolean,
      attestationCnt: schema[9] as number,
      txHash: schema[10]?.toString() || "",
    }
}

export async function getAptosAttestation(network: Network, attestationId: Uint8Array | string): Promise<AptosAttestation> {
    const aptosClient = new Aptos(new AptosConfig({ network }));
    const packageId = getPackageId('aptos', network as any);
    const id = typeof attestationId === 'string' ? Hex.fromHexString(attestationId).toUint8Array() : attestationId;
    const res = await aptosClient.view(
      {
        payload: {
          function: `${packageId}::aas::get_attestation_by_id`,
          functionArguments: [id]
        }
      }
    )

    if (!res) {
      throw new Error("Attestation not found");
    }

    const attestation = res[0] as any;

    return {
      id: attestation.id,
      attester: attestation.attester,
      recipient: attestation.recipient,
      schemaAddr: attestation.schema,
      refId: attestation.ref_id,
      time: attestation.time,
      expirationTime: attestation.expiration_time,
      revocationTime: attestation.revocation_time,
      revokable: attestation.revokable,
      data: Hex.fromHexString(attestation.data).toUint8Array(),
      txHash: attestation.txHash
    }
}