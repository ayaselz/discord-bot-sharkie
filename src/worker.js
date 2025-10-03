// 纯 Cloudflare Worker 可运行版本

// ======= 内置 verifyKey 实现（去掉外部依赖）=======
async function verifyKey(body, signature, timestamp, clientPublicKey) {
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

function hex2bin(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
// ===================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      const signature = request.headers.get("x-signature-ed25519");
      const timestamp = request.headers.get("x-signature-timestamp");
      const body = await request.text();

      const isValid = await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
      if (!isValid) {
        return new Response("Bad request signature", { status: 401 });
      }

      const data = JSON.parse(body);

      // Discord PING（验证用）
      if (data.type === 1) {
        return Response.json({ type: 1 });
      }

      // /hello 命令
      if (data.type === 2 && data.data.name === "hello") {
        return Response.json({
          type: 4,
          data: { content: "hello world" },
        });
      }

      return new Response("Unhandled interaction", { status: 400 });
    }

    return new Response("OK");
  },
};
