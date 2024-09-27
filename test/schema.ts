import { bcs } from '@mysten/bcs';
import { getKeypair } from '../src/utils';
import { Schema, getSchemas } from '../src/schema';
import {getSchemaRegistryTable} from '../src/schema'

const network = 'testnet';
const chain = 'sui';

async function main() {
  const schemaRegistryTableId = await getSchemaRegistryTable(chain, network);
  console.log('schemaRegistryTableId', schemaRegistryTableId);

  const keypair = getKeypair();
  const schema = new Schema(chain, network, keypair);

  const template = 'name: string, age: u64';
  const schemaItem = bcs.string().serialize(template).toBytes();

  const res = await schema.new(
    new Uint8Array(schemaItem),
    'Test1',
    true
  );
  console.log('New schema result:', res);

  for (const created of res.effects?.created || []) {
    if (typeof created.owner === 'object' && 'Shared' in created.owner) {
      console.log('Create Schema:', created.reference.objectId);
    }
  }

  const schemas = await getSchemas(chain, network);
  console.log('Schemas:', schemas);
}

main().catch(
  console.error
)