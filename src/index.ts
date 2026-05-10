import { verifyKey } from "./utils/crypto.js";
import { handle as handleHello } from "./commands/hello.js";
import { run as runDailyGreeting } from "./scheduled/daily-greeting.js";

interface Env {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_CHANNEL_ID: string;
  DISCORD_BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method === "POST") {
      const signature = request.headers.get("x-signature-ed25519");
      const timestamp = request.headers.get("x-signature-timestamp");
      const body = await request.text();

      if (!signature || !timestamp) {
        return new Response("Missing signature headers", { status: 401 });
      }

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

  async scheduled(event: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    await runDailyGreeting(event, env, ctx);
  }
};