import { bcs } from '@mysten/bcs';
import { getKeypair } from '../src/utils';
import { Schema } from '../src/schema';

const keypair = getKeypair();
const schema = new Schema('testnet', keypair);

const template = 'name: string, age: u64';
const schemaItem = bcs.string().serialize(template).toBytes();

const res = await schema.new(
  new Uint8Array(schemaItem)
);
console.log('res:', res);

const registry = await schema.getSchemaRegistry();
console.log('registry:', registry);

for (const [key, _] of registry.schema_records) {
  const schemaRecord = await schema.getSchemaRecord(key);
  console.log('schemaRecord:', schemaRecord);

  const decodedSchema = bcs.string().parse(schemaRecord.schema);
  console.log('decodedSchema:', decodedSchema);
}
