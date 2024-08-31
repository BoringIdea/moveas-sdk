import { Sas, getAttestations, getAttestationRegistryTable } from '../src/sas';
import { Codec } from '../src/codec';
import { getKeypair } from '../src/utils';

const network = 'testnet';

async function main() {
  const attestationRegistryTableId = await getAttestationRegistryTable(network);
  console.log('attestationRegistryTableId', attestationRegistryTableId);

  const keypair = getKeypair();
  const sas = new Sas(network, keypair);

  const schemaCodec = new Codec('name: string, age: u64');

  const item = {
    name: "Alice",
    age: 30n,
  };
  const encodedItem = schemaCodec.encodeToBytes(item);

  const result = await sas.attest(
    '0x62b91dae16766bf065765aefd44ecb9074f7183db23fecd8b6c7f26a3f281ee5',
    '0x0',
    keypair.toSuiAddress(),
    BigInt(Date.now() + 1000 * 60 * 60 * 24),
    encodedItem,
    'test',
    'sui attest',
    'wwww.google.com'
  );
  console.log('New attestation result:', result);

  const attestations = await getAttestations(network);
  console.log('Attestations:', attestations);
}

main().catch(
  console.error
)






