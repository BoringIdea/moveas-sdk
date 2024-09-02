# MAS SDK
Move Attestation Service SDK.


## Description

MAS SDK (Move Attestation Service SDK) is a TypeScript library designed to interact with the Move Attestation Service on the Sui blockchain. It provides a simple and efficient way to create, manage, and verify attestations using the MAS.

## Support Chain
| Chain | Status |
|----|----|
| Sui | Testnet |
| Movement | Testnet |
| Aptos | Comming soon |

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

### Create a Schema

```typescript
import { bcs } from '@mysten/bcs';
import { getKeypair, Schema } from '@lukema/mas-sdk';

async function main() {
  const keypair = getKeypair();
  const schema = new Schema('testnet', keypair);

  const template = 'name: string, age: u64';
  const schemaItem = bcs.string().serialize(template).toBytes();

  const res = await schema.new(
    new Uint8Array(schemaItem),
    "Test1",
    true
  );
  console.log('res:', res);
}

```

### Create an Attestation

```typescript
import { Sas, Codec, getKeypair } from '@lukema/mas-sdk';

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
    '0x2713cba8a4d550d3f4f69cc64e8d2193677b3ef3765224b865fa0f4b2850f175', // schema uid
    '0x0', // ref schema uid
    keypair.toSuiAddress(),
    BigInt(Date.now() + 1000 * 60 * 60 * 24),
    encodedItem,
    'test',
    'sui attest',
    'wwww.google.com'
  );
  console.log('result:', result);
}

```

