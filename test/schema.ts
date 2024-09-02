import { bcs } from '@mysten/bcs';
import { getKeypair } from '../src/utils';
import { Schema, getSchemas } from '../src/schema';
import {getSchemaRegistryTable} from '../src/schema'

const network = 'testnet';

async function main() {
  const schemaRegistryTableId = await getSchemaRegistryTable(network);
  console.log('schemaRegistryTableId', schemaRegistryTableId);

  const keypair = getKeypair();
  const schema = new Schema(network, keypair);

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

  const schemas = await getSchemas(network);
  console.log('Schemas:', schemas);
}

main().catch(
  console.error
)