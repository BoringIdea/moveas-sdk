export type SuiAddress = string;

export interface SuiAttestation {
  attestationAddr: SuiAddress;
  schemaAddr: SuiAddress;
  ref_attestation: SuiAddress;
  time: bigint;
  expiration_time: bigint;
  revocation_time: bigint;
  revokable: boolean;
  attestor: SuiAddress;
  recipient: SuiAddress;
  data: Uint8Array;
  name: string;
  description: string;
  url: string;
  // owner: ObjectOwner | null;
  txHash?: string;
}

export interface Status {
  is_revoked: boolean;
  timestamp: string;
}

export interface AttestationRegistry {
  id: string;
  version: Version;
}

export interface SuiSchema {
  schemaAddr: SuiAddress;
  name: string;
  description: string;
  url: string;
  creator: SuiAddress;
  createdAt: number;
  schema: Uint8Array;
  revokable: boolean;
  resolver: any | null;
  txHash?: string;
}

export interface SchemaRegistry {
  id: SuiAddress;
  version: Version;
}



export type Version = {
  id: SuiAddress;
  version: number;
};