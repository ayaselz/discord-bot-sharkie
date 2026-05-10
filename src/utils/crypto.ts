export async function verifyKey(
  body: string,
  signature: string,
  timestamp: string,
  clientPublicKey: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp + body);
  const sig = hex2bin(signature);
  const pubKey = hex2bin(clientPublicKey);

  return crypto.subtle.verify(
    { name: "NODE-ED25519" },
    await crypto.subtle.importKey(
      "raw",
      pubKey,
      { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
      false,
      ["verify"]
    ),
    sig,
    data
  );
}

function hex2bin(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}