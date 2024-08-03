import { 
  SuiClient, 
  SuiTransactionBlockResponse
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { getClient, getPackageId, Network } from './utils';

export interface Attestation {
  id: string;
  schema: string;
  ref_schema: string;
  attester: string;
  time: bigint;
  expiration_time: bigint;
  data: Uint8Array;
  name: string;
  description: string;
  url: string;
}

export class Sas {
  private client: SuiClient;
  private signer: Ed25519Keypair;
  private packageId: string;

  constructor(network: Network, signer: Ed25519Keypair) {
    this.client = getClient(network);
    this.signer = signer;
    this.packageId = getPackageId(network);
  }

  async attest(
    schemaRecordId: string,
    refSchemaId: string,
    recipient: string,
    expirationTime: bigint,
    data: Uint8Array,
    name: string,
    description: string,
    url: string
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::sas::attest`,
      arguments: [
        tx.object(schemaRecordId),
        tx.object(refSchemaId),
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
    refSchemaId: string,
    recipient: string,
    expirationTime: bigint,
    data: Uint8Array,
    name: string,
    description: string,
    url: string,
    request: string
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::sas::attest_with_resolver`,
      arguments: [
        tx.object(schemaRecordId),
        tx.object(refSchemaId),
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
  
  async getAttestation(id: string): Promise<Attestation> {
    const response = await this.client.getObject({
      id: id,
      options: { showContent: true, showType: true },
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
      ref_schema: fields.ref_schema,
      attester: fields.attester,
      time: BigInt(fields.time),
      expiration_time: BigInt(fields.expireation_time),
      data: data,
      name: fields.name,
      description: fields.description,
      url: fields.url
    };
  }
}
