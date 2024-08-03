import { 
  SuiClient, 
  SuiTransactionBlockResponse
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getClient, getPackageId, Network } from './utils';

interface SchemaRecord {
  id: string;
  schema: Uint8Array;
  resolver: any | null;
}

export class Schema {
  private client: SuiClient;
  private signer: Ed25519Keypair;
  private packageId: string;

  constructor(network: Network, signer: Ed25519Keypair) {
    this.client = getClient(network);
    this.signer = signer;
    this.packageId = getPackageId(network);
  }

  public async new(schema: Uint8Array): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();
    
    const record = tx.moveCall({
      target: `${this.packageId}::schema_record::new`,
      arguments: [
        tx.pure(schema),
      ],
    });

    tx.transferObjects([record], this.signer.toSuiAddress());

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
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::schema_record::new_with_resolver`,
      arguments: [
        tx.pure(schema),
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
      target: `${this.packageId}::schema_record::new_resolver_builder`,
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
      target: `${this.packageId}::schema_record::add_resolver`,
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
      target: `${this.packageId}::schema_record::start_attest`,
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
      target: `${this.packageId}::schema_record::finish_attest`,
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
  
  async getSchemaRecord(id: string): Promise<SchemaRecord> {
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
      resolver: resolver
    };
  }
}


