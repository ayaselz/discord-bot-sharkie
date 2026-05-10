import { sendMessage } from "../utils/discord.js";
import { getDSTStatus, getSydneyDateStr, getSydneyHour } from "../utils/datetime.js";

interface Env {
  DISCORD_CHANNEL_ID: string;
  DISCORD_BOT_TOKEN: string;
}

export async function run(_event: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
  const sydneyHour = getSydneyHour();
  if (parseInt(sydneyHour) !== 8) return;

  const dateStr = getSydneyDateStr();
  const dstInfo = getDSTStatus(new Date());
  let dstMessage = "";
  if (dstInfo.reminderLevel === "today") {
    dstMessage = dstInfo.isDST
      ? "⚠️ 今天开始进入夏令时 (AEDT)，时钟已拨快一小时！"
      : "⚠️ 今天夏令时结束，进入冬令时 (AEST)，时钟已拨慢一小时！";
  } else if (dstInfo.reminderLevel === "week") {
    const dateLabel = dstInfo.transitionDate.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
    dstMessage = dstInfo.isDST
      ? `⚠️ 夏令时将于${dateLabel}(周日)结束，届时时钟将拨慢一小时。`
      : `⚠️ 夏令时将于${dateLabel}(周日)开始，届时时钟将拨快一小时。`;
  } else {
    dstMessage = dstInfo.isDST ? "当前夏令时中 (AEDT)" : "当前非夏令时 (AEST)";
  }

  const message = `🌞 早安！现在是${dateStr}。今天也要加油哦！\n\n📅 ${dstMessage}`;
  const channelId = env.DISCORD_CHANNEL_ID;
  const botToken = env.DISCORD_BOT_TOKEN;

  if (!channelId || !botToken) {
    console.error("Missing DISCORD_CHANNEL_ID or DISCORD_BOT_TOKEN");
    return;
  }

  ctx.waitUntil(sendMessage(channelId, botToken, message));
}