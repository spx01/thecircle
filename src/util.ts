import { BaseGuildTextChannel, Webhook } from 'discord.js';
import { Client } from 'discordx';

const webhookName = 'thecircle-channel-hook';

async function findOrCreateWebhook(client: Client, channel: BaseGuildTextChannel):
  Promise<Webhook> {
  const webhooks = await channel.fetchWebhooks();
  const webhook = webhooks.find((o) => o.owner === client.user);
  return webhook ?? channel.createWebhook(webhookName);
}

export default findOrCreateWebhook;
