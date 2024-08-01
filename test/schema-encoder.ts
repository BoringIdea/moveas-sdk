import { SchemaCodec } from "../src/schema-encoder";

const schemaCodec = new SchemaCodec("name: String, age: u64, scores: Vector<u16>, address: Address");

// 编码
const item = {
  name: "Alice",
  age: 30n,
  scores: [95n, 87n, 91n],
  address: "0x1234567890abcdef"
};

const encodedString = schemaCodec.encode(item);
console.log(encodedString);

// 解码
const decodedItem = schemaCodec.decode(encodedString);
console.log(decodedItem);

// 编码为 Uint8Array
const encodedBytes = schemaCodec.encodeToBytes(item);
console.log(encodedBytes);

// 从 Uint8Array 解码
const decodedItemFromBytes = schemaCodec.decodeFromBytes(encodedBytes);
console.log(decodedItemFromBytes);