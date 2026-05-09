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
          data: { content: "Hello from Agent Sharkie 🦈" },
        });
      }

      return new Response("Unhandled interaction", { status: 400 });
    }

    return new Response("OK");
  },

  async scheduled(event, env, ctx) {
      // 获取当前悉尼时间的小时数。如果不是早上8点，直接返回，不发送消息
    const sydneyHour = new Date().toLocaleString('en-US', {
      timeZone: 'Australia/Sydney',
      hour: 'numeric',
      hour12: false
    });

    if (parseInt(sydneyHour) !== 8) {
      return;
    }

    const dateStr = new Date().toLocaleDateString('zh-CN', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `🌞 早安！现在是${dateStr}。\n今天也要加油哦！`;

    const channelId = env.DISCORD_CHANNEL_ID;
    const botToken = env.DISCORD_BOT_TOKEN;

    if (!channelId || !botToken) {
      console.error("Missing DISCORD_CHANNEL_ID or DISCORD_BOT_TOKEN");
      return;
    }

    ctx.waitUntil(
      fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${botToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: message })
      }).then(res => {
        if (!res.ok) {
          console.error('发送失败', res.status);
        }
      })
    );
  }
};
