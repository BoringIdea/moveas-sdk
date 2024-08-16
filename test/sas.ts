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
    '0x2713cba8a4d550d3f4f69cc64e8d2193677b3ef3765224b865fa0f4b2850f175',
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






