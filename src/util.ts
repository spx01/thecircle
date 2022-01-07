import { BaseGuildTextChannel, Webhook, MessageAttachment } from 'discord.js';
import { Client } from 'discordx';
import fetch from 'node-fetch';

const webhookName = 'thecircle-channel-hook';

async function findOrCreateWebhook(
  client: Client,
  channel: BaseGuildTextChannel,
): Promise<Webhook> {
  const webhooks = await channel.fetchWebhooks();
  const webhook = webhooks.find((o) => o.owner === client.user);
  return webhook ?? channel.createWebhook(webhookName);
}

async function readAttachmentFile(
  attachment: MessageAttachment,
): Promise<ArrayBuffer> {
  return fetch(attachment.url).then((r) => r.arrayBuffer());
}

export { findOrCreateWebhook, readAttachmentFile };
