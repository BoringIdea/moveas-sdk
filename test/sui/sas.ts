import { Sas, getAttestations, getAttestationRegistryTable } from '../../src/sui/sas';
import { Codec } from '../../src/codec';
import { getKeypair } from '../../src/sui/utils';
import { bcs } from '@mysten/bcs';

const network = 'testnet';
const chain = 'sui';

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

async function testAttest() {
  console.log('======= testAttest ======');
  const res = await sas.registerSchema(
    new Uint8Array(schemaItem),
    'Test' + Date.now(),
    'Description',
    'https://example.com',
    true
  );

  let schemaId = '';
  let adminCapId = '';
  for (const created of res.effects?.created || []) {
    if (typeof created.owner === 'object' && 'Shared' in created.owner) {
      schemaId = created.reference.objectId;
      console.log('Create Schema:', schemaId);
    }

    if (typeof created.owner === 'object' && 'AddressOwner' in created.owner) {
      adminCapId = created.reference.objectId;
      console.log('Created admin cap:', created.reference.objectId);
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

  let attestationId = '';
  for (const createdObject of result.effects?.created || []) {
    if (typeof createdObject.owner === 'object' && 'AddressOwner' in createdObject.owner) {
      attestationId = createdObject.reference.objectId;
      console.log('Created attestation:', createdObject.reference.objectId);
    }
  }

  // revoke attestation
  const revokeResult = await sas.revokeAttestation(
    adminCapId,
    schemaId,
    attestationId
  );
  console.log('Revoke attestation result:', revokeResult);
}

async function testAttestWithResolver() {
  console.log('======= testAttestWithResolver ======');
  const res = await sas.registerSchemaWithResolver(
    new Uint8Array(schemaItem),
    'Test' + Date.now(),
    'Description',
    'https://example.com',
    true,
    '0x82fb50a598c3b23dce575b1f34c2d7df060a443823194c7edc769949e472604c::blocklist'
  );

  let schemaId = '';
  let adminCapId = '';
  for (const created of res.effects?.created || []) {
    if (typeof created.owner === 'object' && 'Shared' in created.owner) {
      schemaId = created.reference.objectId;
      console.log('Create Schema:', schemaId);
    }

    if (typeof created.owner === 'object' && 'AddressOwner' in created.owner) {
      adminCapId = created.reference.objectId;
      console.log('Created admin cap:', created.reference.objectId);
    }
  }

  const result = await sas.attestWithResolver(
    schemaId,
    '0x0',
    keypair.toSuiAddress(),
    BigInt(Date.now() + 1000 * 60 * 60 * 24),
    encodedItem,
    'Test',
    'sui attest',
    'wwww.google.com',
    '0x82fb50a598c3b23dce575b1f34c2d7df060a443823194c7edc769949e472604c::blocklist'
  );

  let attestationId = '';
  for (const createdObject of result.effects?.created || []) {
    if (typeof createdObject.owner === 'object' && 'AddressOwner' in createdObject.owner) {
      attestationId = createdObject.reference.objectId;
      console.log('Created attestation:', createdObject.reference.objectId);
    }
  }
  
  // revoke attestation
  const revokeResult = await sas.revokeAttestation(
    adminCapId,
    schemaId,
    attestationId
  );
  console.log('Revoke attestation result:', revokeResult);
}

async function testGetAllAttestations() {
  console.log('======= testGetAllAttestations ======');
  const attestations = await getAttestations(chain, network);
  console.log('Attestations:', attestations);
}

async function main() {
  await testAttest();
  await testAttestWithResolver();
  await testGetAllAttestations();
}

main().catch(
  console.error
)






