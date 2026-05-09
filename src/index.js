import { verifyKey } from "./utils/crypto.js";
import { handle as handleHello } from "./commands/hello.js";
import { run as runDailyGreeting } from "./scheduled/daily-greeting.js";

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

      if (data.type === 1) {
        return Response.json({ type: 1 });
      }

      if (data.type === 2 && data.data.name === "hello") {
        return Response.json(handleHello());
      }

      return new Response("Unhandled interaction", { status: 400 });
    }

    return new Response("OK");
  },

  async scheduled(event, env, ctx) {
    await runDailyGreeting(event, env, ctx);
  }
};