import { privateToAddress, toChecksumAddress } from "@ethereumjs/util";
import BN from "bn.js";
import { ec as EC } from "elliptic";

import { getBufferFromHexKey } from "./utils";

export function getFinalKey(oAuthKey: string, nonce: string): string {
  const ec = new EC("secp256k1");
  return new BN(oAuthKey, "hex").add(new BN(nonce, "hex")).umod(ec.curve.n).toString("hex", 64);
}

export function getPublicFromPrivateKey(privateKeyHex: string): { X: string; Y: string; address: string } {
  const ec = new EC("secp256k1");
  const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
  const publicKey = keyPair.getPublic();
  const X = publicKey.getX().toString(16);
  const Y = publicKey.getY().toString(16);
  const ethAddressLower = Buffer.from(privateToAddress(getBufferFromHexKey(privateKeyHex))).toString("hex");
  return { X, Y, address: toChecksumAddress(`0x${ethAddressLower}`) };
}
