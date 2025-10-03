import { verifyKey } from "discord-interactions";
import { jsonResponse } from "./utils/response.js";
import { handleHello } from "./handlers/hello.js";

export default {
  async fetch(request, env) {
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    const body = await request.text();

    try {
      verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    } catch (err) {
      return new Response("Invalid request", { status: 401 });
    }

    const message = JSON.parse(body);

    if (message.type === 1) {
      // PING
      return jsonResponse({ type: 1 });
    }

    if (message.type === 2) {
      // Slash Commands
      switch (message.data.name) {
        case "hello":
          return handleHello(message);
        default:
          return jsonResponse({
            type: 4,
            data: { content: "Unknown command" }
          });
      }
    }

    return new Response("OK");
  }
};
