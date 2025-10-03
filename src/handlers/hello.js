import { jsonResponse } from "../utils/response.js";

export function handleHello(interaction) {
  return jsonResponse({
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: { content: "Hello world from Sharkie 🦈" }
  });
}
