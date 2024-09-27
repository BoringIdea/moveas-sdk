import { bcs } from '@mysten/bcs';
import { Aas, getAptosAttestations, getAptosSchemas } from "../src/aas";
import { Codec } from "../src/codec";
import { Account, Network, Ed25519PrivateKey, Hex} from "@aptos-labs/ts-sdk";
import dotenv from 'dotenv';

dotenv.config();

const privateKeyBytes = Hex.fromHexString(process.env.PRIVATE_KEY?.toString() || "").toUint8Array();
const privateKey = new Ed25519PrivateKey(privateKeyBytes)

const account = Account.fromPrivateKey({privateKey});

const network = Network.TESTNET;
const aas = new Aas(account, network as any);

const schemaTemplate = "name: string, age: u64"
const codec = new Codec(schemaTemplate);

const schema = bcs.string().serialize(schemaTemplate).toBytes();
console.log('schemaRaw', schema);

// const encoder = new TextEncoder();
// const schema = encoder.encode(schemaTemplate);

async function main() {

  let res = await aas.createSchema(
    schema,
    "Name",
    "Description",
    "Uri",
    false,
    false
  )
  console.log('creat schema res', res);
  const events = (res as any).events;
  let schemaAddress = "";
  for (const event of events) {
    if (event.type.includes("SchemaCreated")) {
      schemaAddress = event.data.schema_addr;
    }
  }
  console.log('schemaAddress', schemaAddress);

  const createdSchema = await aas.getSchema(schemaAddress);
  console.log('createdSchema', createdSchema);

  // const attestationRaw = encoder.encode("name: alice, age: 20")
  const item = {
    name: "Alice",
    age: 30n,
  };
  const attestationRaw = codec.encodeToBytes(item);
  console.log('attestationRaw', attestationRaw);

  const res2 = await aas.createAttestation(
    account.accountAddress.toString(),
    schemaAddress,
    '0x00',
    0,
    false,
    attestationRaw
  )
  console.log('create attestation res', res2);

  const events2 = (res2 as any).events;
  let attestationId;
  for (const event of events2) {
    if (event.type.includes("AttestationCreated")) {
      attestationId = event.data.id;
    }
  }
  console.log('attestationId', attestationId);

  const attestation = await aas.getAttestation(Hex.fromHexString(attestationId).toUint8Array());
  console.log('attestation', attestation);

  const decodedItem = codec.decodeFromBytes(attestation.data);
  console.log('decodedItem', decodedItem);

  const attestations = await getAptosAttestations(network as any, 0, 20);
  console.log('attestations', attestations);

  const schemas = await getAptosSchemas(network as any, 0, 20);
  console.log('schemas', schemas);

  // const res3 = await aas.revokeAttestation(
  //   schemaAddress,
  //   Hex.fromHexString(attestationId).toUint8Array()
  // );
  // console.log('revoke attestation res', res3);
}

main();