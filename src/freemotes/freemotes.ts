import {
  Emoji,
  Message,
  BaseGuildTextChannel,
  GuildChannelResolvable,
  Guild,
} from 'discord.js';
import { client } from '../main.js';
import { findOrCreateWebhook, readAttachmentFile } from '../util.js';

class SimpleEmoji {
  public static fromEmoji(emoji: Emoji): SimpleEmoji {
    return emoji as SimpleEmoji;
  }

  public readonly name!: string | undefined;
  public readonly id!: string | undefined;
  public readonly animated!: boolean | undefined;

  public toString(): string {
    return `<${this.animated ? 'a' : ''}:${this.id}>`;
  }
}

class Freemotes {
  cachedEmojis: Map<String, SimpleEmoji[]>;

  constructor() {
    this.cachedEmojis = new Map();
  }

  public async updateEmojis(guild: Guild) {
    this.cachedEmojis.set(guild.id, []);
    const emojis = await guild.emojis.fetch();
    emojis.forEach((emoji) => {
      this.cachedEmojis.get(guild.id)?.push(SimpleEmoji.fromEmoji(emoji));
    });
  }

  public async deleteFromGuild(guild: Guild) {
    this.cachedEmojis.delete(guild.id);
  }

  public getSimpleEmoji(name: string, findIdx = 0): SimpleEmoji | undefined {
    let idx = 0;
    for (const emojis of this.cachedEmojis.values()) {
      for (const emoji of emojis.values()) {
        if (emoji.name === name) {
          if (idx === findIdx) {
            return emoji;
          }
          idx += 1;
        }
      }
    }
    return undefined;
  }

  public getEmoteList(): string {
    let result = '';
    for (const entry of this.cachedEmojis.entries()) {
      const guild = client.guilds.cache.get(entry[0].toString());
      if (!guild) {
        continue;
      }
      result = `${result}\n${guild.name}: `;
      for (const emoji of entry[1]) {
        result = `${result}${emoji.toString()}`;
      }
    }
    return result;
  }

  public async trySubstitute(m: Message): Promise<string | undefined> {
    if (m.content.includes('`')) {
      return undefined;
    }
    let changed = false;
    const replaced = m.content.replaceAll(
      /\{([\w]+)(?:\[(\d+)\])?\}/g,
      (match, p1, p2) => {
        const idx = parseInt(p2, 10);
        const emoji = this.getSimpleEmoji(
          p1,
          Number.isNaN(idx) ? undefined : idx,
        );
        if (!emoji) {
          return match;
        }
        changed = true;
        return emoji?.toString();
      },
    );
    return changed ? replaced : undefined;
  }

  public async handleMessage(m: Message) {
    if ((m.channel as BaseGuildTextChannel).fetchWebhooks === undefined) {
      return;
    }
    if (m.author.bot) {
      return;
    }

    const perms = m.guild?.me?.permissionsIn(
      m.channel as GuildChannelResolvable,
    );
    if (!perms?.has('MANAGE_MESSAGES') || !perms?.has('MANAGE_WEBHOOKS')) {
      return;
    }

    const webhook = await findOrCreateWebhook(
      client,
      m.channel as BaseGuildTextChannel,
    );
    const replaced = (await this.trySubstitute(m)) ?? '';
    if (replaced === '') {
      return;
    }

    await webhook
      .send({
        username: m.member?.displayName,
        avatarURL: m.author.avatarURL() ?? undefined,
        content: replaced,
        files: await Promise.all(
          m.attachments.map(async (attachment) => ({
            attachment: attachment.url,
            name: attachment.name ?? 'unknown',
            file: (await readAttachmentFile(attachment)) as Buffer,
          })),
        ),
      })
      .then(async () => {
        await m.delete();
      });
  }
}

export default Freemotes;
