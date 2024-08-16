import { Sas } from '../src/sas';
import { Codec } from '../src/codec';
import { getKeypair } from '../src/utils';

async function main() {
  const keypair = getKeypair();
  const sas = new Sas('testnet', keypair);

  const schemaCodec = new Codec('name: string, age: u64');

  const item = {
    name: "Alice",
    age: 30n,
  };
  const encodedItem = schemaCodec.encodeToBytes(item);

  const result = await sas.attest(
    '0x200d78c1aeb493ff502322146c73de99774f576e2fa2c58cb89343e38c45a8af',
    '0x0',
    keypair.toSuiAddress(),
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

  // const attestation = await sas.getAttestation('0x004c2df97b728d8e434e458332320c91e595d73222c6d432e1f64c06213651f6');
  // console.log('attestation:', attestation);
}

main().catch(
  console.error
)






