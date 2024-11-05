import { Sas, getAttestations, getAttestationRegistryTable } from '../../src/sui/sas';
import { Codec } from '../../src/codec';
import { getKeypair } from '../../src/sui/utils';
import { bcs } from '@mysten/bcs';

const network = 'testnet';
const chain = 'sui';

async function main() {
  const attestationRegistryTableId = await getAttestationRegistryTable(chain, network);
  console.log('attestationRegistryTableId', attestationRegistryTableId);

  // const adminId = await getAdminId(chain, network);
  // console.log('adminId', adminId);

  const keypair = getKeypair();
  const sas = new Sas(chain, network, keypair);

  const schemaCodec = new Codec('name: string, age: u64');

  const template = 'name: string, age: u64';
  const schemaItem = bcs.string().serialize(template).toBytes();

  const item = {
    name: "Alice",
    age: 30n,
  };
  const encodedItem = schemaCodec.encodeToBytes(item);

  const res = await sas.registerSchema(
    new Uint8Array(schemaItem),
    'Test1',
    'Description',
    'https://example.com',
    true
  );

  let schemaId = '';

  for (const created of res.effects?.created || []) {
    if (typeof created.owner === 'object' && 'Shared' in created.owner) {
      schemaId = created.reference.objectId;
      console.log('Create Schema:', schemaId);
    }
  }

  const result = await sas.attest(
    schemaId,
    '0x0',
    keypair.toSuiAddress(),
    BigInt(Date.now() + 1000 * 60 * 60 * 24),
    encodedItem,
    'Test',
    'sui attest',
    'wwww.google.com'
  );
  console.log('New attestation result:', result);

  let attestationId = '';
  let adminCapId = '';
  for (const createdObject of result.effects?.created || []) {
    if (typeof createdObject.owner === 'object' && 'AddressOwner' in createdObject.owner) {
      attestationId = createdObject.reference.objectId;
      console.log('Created attestation:', createdObject.reference.objectId);
    }

    if (typeof createdObject.owner === keypair.toSuiAddress()) {
      adminCapId = createdObject.reference.objectId;
      console.log('Created admin cap:', createdObject.reference.objectId);
    }
  }

  // revoke attestation
  // const revokeResult = await sas.revokeAttestation(
  //   adminCapId,
  //   schemaId,
  //   attestationId
  // );
  // console.log('Revoke attestation result:', revokeResult);

  // const attestations = await getAttestations(chain, network);
  // console.log('Attestations:', attestations);
}

main().catch(
  console.error
)






