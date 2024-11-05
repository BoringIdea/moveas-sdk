# MAS SDK
Move Attestation Service SDK.


## Description

MAS SDK (Move Attestation Service SDK) is a TypeScript library designed to interact with the Move Attestation Service on the Sui blockchain. It provides a simple and efficient way to create, manage, and verify attestations using the MAS.

## Support Chain
| Chain | Status |
|----|----|
| Sui | Testnet |
| Movement | Testnet |
| Aptos | Testnet |

## Installation

Install MAS SDK using npm:

```
npm install @lukema/mas-sdk
```

using yarn:
```
yarn add @lukema/mas-sdk
```

## Examples

### Sui Chain

```ts
import { bcs } from '@mysten/bcs';
import { getKeypair, getAttestationRegistryTable, Codec } from '@lukema/mas-sdk'
const network = 'testnet';
const chain = 'sui';

const keypair = getKeypair();
const attestationRegistryTableId = await getAttestationRegistryTable(chain, network);
const sas = new Sas(chain, network, keypair);

const template = 'name: string, age: u64';
const schemaCodec = new Codec(template);
const schemaItem = bcs.string().serialize(template).toBytes();

const item = {
  name: "Alice",
  age: 30n,
};
const encodedItem = schemaCodec.encodeToBytes(item);

// Register Schema
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

// Attest
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

```

### Aptos Chain
```ts
import { bcs } from '@mysten/bcs';
import { Account, Network, Ed25519PrivateKey, Hex} from "@aptos-labs/ts-sdk";
import { Aas, Codec } from '@lukema/mas-sdk'

const privateKeyBytes = Hex.fromHexString(process.env.PRIVATE_KEY?.toString() || "").toUint8Array();
const privateKey = new Ed25519PrivateKey(privateKeyBytes)

const account = Account.fromPrivateKey({privateKey});
const network = Network.TESTNET;

const aas = new Aas(account, network as any);

const schemaTemplate = "name: string, age: u64"
const codec = new Codec(schemaTemplate);
const schema = bcs.string().serialize(schemaTemplate).toBytes();

// Create Schema
let res = await aas.createSchema(
  schema,
  "Name",
  "Description",
  "Url",
  false,
  '0x0'
)

const events = (res as any).events;
let schemaAddress = "";
for (const event of events) {
  if (event.type.includes("SchemaCreated")) {
    schemaAddress = event.data.schema_address;
  }
}
console.log('Schema Address:', schemaAddress);

// Attest
const item = {
  name: "Alice",
    age: 30n,
};
const attestationRaw = codec.encodeToBytes(item);

// Create Attestation
const res2 = await aas.createAttestation(
  account.accountAddress.toString(),
  schemaAddress,
  '0x0',
  0,
  false,
  attestationRaw
)

const events2 = (res2 as any).events;
let attestation_address;
for (const event of events2) {
  if (event.type.includes("AttestationCreated")) {
    attestation_address = event.data.attestation_address;
  }
}
console.log('Attestation Address:', attestation_address);

```
