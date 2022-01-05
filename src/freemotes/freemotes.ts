import {
  DMChannel, Emoji, Message, TextChannel, BaseGuildTextChannel, GuildChannelResolvable,
} from 'discord.js';
import { Client } from 'discordx';
import findOrCreateWebhook from '../util.js';

type FreemoteChannel = TextChannel | DMChannel;

class SimpleEmoji {
  public static fromEmoji(emoji: Emoji): SimpleEmoji {
    return emoji as SimpleEmoji;
  }

  public readonly name!: string | undefined;
  public readonly id!: string | undefined;
  public readonly animated!: boolean | undefined;
}

class Freemotes {
  cachedEmojis: Map<string, SimpleEmoji[]>;

  constructor() {
    this.cachedEmojis = new Map();
  }

  public async handleMessage(m: Message, client: Client) {
    if ((m.channel as BaseGuildTextChannel).fetchWebhooks === undefined) {
      return;
    }
    if (m.author.bot) {
      return;
    }

    const perms = m.guild?.me?.permissionsIn(m.channel as GuildChannelResolvable);
    if (!perms?.has('MANAGE_MESSAGES') || !perms?.has('MANAGE_WEBHOOKS')) {
      return;
    }

    await m.delete();
    const webhook = await findOrCreateWebhook(client, m.channel as BaseGuildTextChannel);
    await webhook.send({
      username: 'testing',
      avatarURL: m.author.avatarURL() ?? undefined,
      content: 'hello',
    });
  }
}

export default Freemotes;
