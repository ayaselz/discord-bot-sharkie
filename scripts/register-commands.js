import fetch from "node-fetch";
import "dotenv/config"; // 读取本地 .env 文件

const { DISCORD_BOT_TOKEN, DISCORD_APP_ID, DISCORD_GUILD_ID } = process.env;

const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${DISCORD_GUILD_ID}/commands`;

const commands = [
  {
    name: "hello",
    description: "Say hello",
    type: 1
  }
];

for (const command of commands) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  const data = await res.json();
  console.log(data);
}
