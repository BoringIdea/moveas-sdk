import { 
  SuiClient, 
  SuiTransactionBlockResponse
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ObjectOwner } from '@mysten/sui/client';
import { getClient, getPackageId, getSchemaRegistryId, getAttestationRegistryId, Network } from './utils';
import { SuiAddress } from './types';
import bs58 from 'bs58';

export interface SchemaRecord {
  id: SuiAddress;
  incrementId: number;
  attestationCnt?: number | 0;
  schema: Uint8Array;
  revokable: boolean;
  resolver: any | null;
  owner: ObjectOwner | null;
  creator: SuiAddress;
  createdAt: number;
  txHash: string;
}

export interface SchemaRegistry {
  id: SuiAddress;
  schema_records: Map<SuiAddress, SuiAddress>;
}

export class Schema {
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

  public async new(schema: Uint8Array, revokable: boolean): Promise<SuiTransactionBlockResponse> {
    const schemaRegistryId = getSchemaRegistryId(this.network);
    const tx = new Transaction();
    
    const record = tx.moveCall({
      target: `${this.packageId}::schema::new`,
      arguments: [
        tx.object(schemaRegistryId),
        tx.pure.vector('u8', schema),
        tx.pure.bool(revokable)
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

  async newWithResolver(schema: Uint8Array): Promise<SuiTransactionBlockResponse> {
    const schemaRegistryId = getSchemaRegistryId(this.network);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema::new_with_resolver`,
      arguments: [
        tx.object(schemaRegistryId),
        tx.pure.vector('u8', schema),
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

  async newResolverBuilder(schemaAddress: string): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema::new_resolver_builder`,
      arguments: [
        bcs.string().serialize(schemaAddress),
      ],
    });

    return await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });
  }

  async addResolver(schemaRecord: string, resolverBuilder: string): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema::add_resolver`,
      arguments: [
        tx.object(schemaRecord),
        tx.object(resolverBuilder),
      ],
    });

    return await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });
  }

  async startAttest(schemaRecord: string): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema::start_attest`,
      arguments: [
        tx.object(schemaRecord),
      ],
    });

    return await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });
  }

  async finishAttest(schemaRecord: string, request: string): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema::finish_attest`,
      arguments: [
        tx.object(schemaRecord),
        tx.object(request),
      ],
    });

    return await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });
  }

  async getSchemaRegistry(): Promise<SchemaRegistry> {
    const schemaRegistryId = getSchemaRegistryId(this.network);
    const response = await this.client.getObject({
      id: schemaRegistryId,
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

    const schemaRecords = new Map<string, string>();
    if (fields && fields.schema_records && fields.schema_records.fields && fields.schema_records.fields.contents) {
      for (const item of fields.schema_records.fields.contents) {
        if (item.fields.key && item.fields.value) {
          schemaRecords.set(item.fields.key, item.fields.key);
        }
      }
    }

    return {
      id: object.objectId,
      schema_records: schemaRecords
    };
  }
  
  async getSchemaRecord(id: string): Promise<SchemaRecord> {
    const response = await this.client.getObject({
      id: id,
      options: { 
        showContent: true, 
        showType: true ,
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
  

    let schema: Uint8Array;
    if (typeof fields.schema === 'string') {
      schema = Uint8Array.from(atob(fields.schema), c => c.charCodeAt(0));
    } else if (Array.isArray(fields.schema)) {
      schema = new Uint8Array(fields.schema);
    } else {
      throw new Error('Invalid schema format');
    }
    
    let resolver: any | null = null;
    if (fields.resolver && fields.resolver.fields) {
      resolver = {
        rules: fields.resolver.fields.rules,
        config: fields.resolver.fields.config
      };
    }
  
    return {
      id: object.objectId,
      schema: schema,
      resolver: resolver,
      incrementId: fields.incrementing_id,
      creator: fields.creator,
      revokable: fields.revokable,
      createdAt: fields.created_at,
      txHash:  bs58.encode(fields.tx_hash),
      owner: response.data?.owner || null,
    };
  }
}

