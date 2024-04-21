export function getBufferFromHexKey(hexString: string): Buffer {
  return Buffer.from(hexString.padStart(64, "0"), "hex");
}
