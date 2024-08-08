import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Schema, SchemaRecord } from './schema';
import { Sas, Attestation } from './sas';
import { getClient, Network } from './utils';
import { SuiAddress } from './types';

interface EnhancedSchemaRecord extends SchemaRecord {
}

interface EnhancedAttestation extends Attestation {
}

export class AdvancedQueries {
  private schema: Schema;
  private sas: Sas;
  private client: SuiClient;

  constructor(network: Network) {
    const signer = Ed25519Keypair.generate();
    this.client = getClient(network);
    this.schema = new Schema(network, signer);
    this.sas = new Sas(network, signer);
  }

  async getEnhancedSchemaRecord(schemaId: string): Promise<EnhancedSchemaRecord> {
    const schemaRecord = await this.schema.getSchemaRecord(schemaId);

    const schemaRegistry = await this.schema.getSchemaRegistry();
    const creator = schemaRegistry.schema_records.get(schemaId) || null;

    const resolver = schemaRecord.resolver;
    if (resolver) {
      
    }
    
    return {
      ...schemaRecord,
    };
  }

  async getEnhancedAttestation(attestationId: string): Promise<EnhancedAttestation> {
    const attestationRecord = await this.sas.getAttestation(attestationId);
    
    return {
      ...attestationRecord,
    };
  }

}
