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
  '0x08b04a8a5d2d45e622d6f38fa0a2c700ca890a0b85b8b76cb614b1795321c0e7',
  '0x0',
  keypair.toSuiAddress(),
  false,
  BigInt(Date.now() + 1000 * 60 * 60 * 24),
  encodedItem,
  'test',
  'sui attest',
  'wwww.google.com'
);
console.log('result:', result);

const attestationRegistry = await sas.getAttestationRegistry();
console.log('attestationRegistry:', attestationRegistry);

for (const [key, _] of attestationRegistry.attestations) {
  const attestation = await sas.getAttestation(key);
  console.log('attestation:', attestation);

  const decodedItem = schemaCodec.decodeFromBytes(attestation.data);
  console.log('decode attestation data:', decodedItem);
}






