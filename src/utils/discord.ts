export async function sendMessage(
  channelId: string,
  botToken: string,
  content: string
): Promise<boolean> {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${botToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) {
    console.error("Discord API error:", res.status, await res.text());
    return false;
  }
  return true;
}