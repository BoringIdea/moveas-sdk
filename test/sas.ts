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
    '0xca3363e113489c1ff4d24bac8a21921716b3b05bd68db17e00344014e4f42917',
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
}

main().catch(
  console.error
)






