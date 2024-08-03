import { Sas } from '../src/sas';
import { Codec } from '../src/codec';
import { getKeypair } from '../src/utils';
 
const keypair = getKeypair();
const sas = new Sas('testnet', keypair);

const schemaCodec = new Codec('name: string, age: u64');

const item = {
  name: "Alice",
  age: 30n,
};
const encodedItem = schemaCodec.encodeToBytes(item);

const result = await sas.attest(
  '0xa2a2005500f95e3decd11159aa7fd86cdf0785beec37b89ffdd40154153b52de',
  '0xa2a2005500f95e3decd11159aa7fd86cdf0785beec37b89ffdd40154153b52de',
  keypair.toSuiAddress(),
  BigInt(Date.now() + 1000 * 60 * 60 * 24),
  encodedItem,
  'test',
  'sui attest',
  'wwww.google.com'
);
console.log('result:', result);

const attestation = await sas.getAttestation('0x7e27b3eb26eef67263901e3f18c13e60bfa4f0a7d0c570de2f5fa0b57d6e82a4');
console.log('attestation:', attestation);

const decodedItem = schemaCodec.decodeFromBytes(attestation.data);
console.log('decodedItem:', decodedItem);





