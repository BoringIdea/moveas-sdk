import { bcs } from '@mysten/bcs';
import { getKeypair } from '../src/utils';
import { Schema } from '../src/schema';

const keypair = getKeypair();
const schemaRecord = new Schema('testnet', keypair);

const template = 'name: string, age: u64';
const schema = bcs.string().serialize(template).toBytes();


const res = await schemaRecord.new(
  new Uint8Array(schema)
);
console.log('res:', res);


const record = await schemaRecord.getSchemaRecord('0xa2a2005500f95e3decd11159aa7fd86cdf0785beec37b89ffdd40154153b52de')
console.log('record:', record);
