import { Sas, getAttestations, getAttestationRegistryTable } from '../src/sas';
import { Codec } from '../src/codec';
import { getKeypair } from '../src/utils';

const network = 'testnet';
const chain = 'sui';

async function main() {
  const attestationRegistryTableId = await getAttestationRegistryTable(chain, network);
  console.log('attestationRegistryTableId', attestationRegistryTableId);

  const keypair = getKeypair();
  const sas = new Sas(chain, network, keypair);

  const schemaCodec = new Codec('name: string, age: u64');

  const item = {
    name: "Alice",
    age: 30n,
  };
  const encodedItem = schemaCodec.encodeToBytes(item);

  const result = await sas.attest(
    '0x3509efc36152754d02e0e047df64f037d7b203bf84e4934fdeb70b2aa27bc84f',  // schema id
    '0x0',
    keypair.toSuiAddress(),
    BigInt(Date.now() + 1000 * 60 * 60 * 24),
    encodedItem,
    'Test1',
    'sui attest',
    'wwww.google.com'
  );
  console.log('New attestation result:', result);

  let attestationId = '';
  for (const createdObject of result.effects?.created || []) {
    if (typeof createdObject.owner === 'object' && 'AddressOwner' in createdObject.owner) {
      attestationId = createdObject.reference.objectId;
      console.log('Created attestation:', createdObject.reference.objectId);
    }
  }

  // revoke attestation
  const revokeResult = await sas.revoke(
    '0xad9f569fe536c20448684a8344abe4b087e86b9a04d7ef9a49ccf74d4f1bada6', // admin id
    '0x3509efc36152754d02e0e047df64f037d7b203bf84e4934fdeb70b2aa27bc84f', // schema id
    attestationId
  );
  console.log('Revoke attestation result:', revokeResult);

  const attestations = await getAttestations(chain, network);
  console.log('Attestations:', attestations);
}

main().catch(
  console.error
)






