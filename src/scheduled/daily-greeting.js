import { sendMessage } from "../utils/discord.js";

export async function run(event, env, ctx) {
  const sydneyHour = new Date().toLocaleString("en-US", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    hour12: false
  });

  if (parseInt(sydneyHour) !== 8) {
    return;
  }

  const dateStr = new Date().toLocaleDateString("zh-CN", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const message = `🌞 早安！现在是${dateStr}。\n今天也要加油哦！`;

  const channelId = env.DISCORD_CHANNEL_ID;
  const botToken = env.DISCORD_BOT_TOKEN;

  if (!channelId || !botToken) {
    console.error("Missing DISCORD_CHANNEL_ID or DISCORD_BOT_TOKEN");
    return;
  }

  ctx.waitUntil(sendMessage(channelId, botToken, message));
}