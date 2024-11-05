import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Schema, SuiSchema } from './schema';
import { Sas, SuiAttestation } from './sas';
import { getClient, Network } from './utils';

interface EnhancedSchemaRecord extends SuiSchema {
}

interface EnhancedAttestation extends SuiAttestation {
}

export class AdvancedQueries {
  private schema: Schema;
  private sas: Sas;
  private client: SuiClient;

  constructor(chain: string, network: Network) {
    const signer = Ed25519Keypair.generate();
    this.client = getClient(chain, network);
    this.schema = new Schema(chain, network, signer);
    this.sas = new Sas(chain, network, signer);
  }

  async getEnhancedSchema(schemaId: string): Promise<EnhancedSchemaRecord> {
    const schema = await this.schema.getSchema(schemaId);

    const resolver = schema.resolver;
    if (resolver) {
      // TODO
    }
    
    return {
      ...schema,
    };
  }

  async getEnhancedAttestation(attestationId: string): Promise<EnhancedAttestation> {
    const attestationRecord = await this.sas.getAttestation(attestationId);
    
    return {
      ...attestationRecord,
    };
  }

}
