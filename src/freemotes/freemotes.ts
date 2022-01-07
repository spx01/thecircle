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

  public async setup() {
    client.guilds.cache.forEach(async (guild) => {
      await this.updateEmojis(guild);
    });
  }

  public async updateEmojis(guild: Guild) {
    this.cachedEmojis.set(guild.id, []);
    const emojis = await guild.emojis.fetch();
    emojis.forEach(async (emoji) => {
      this.cachedEmojis.get(guild.id)?.push(SimpleEmoji.fromEmoji(emoji));
    });
  }

  public deleteFromGuild(guild: Guild) {
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

  public async trySubstitute(msg: Message): Promise<string | undefined> {
    if (msg.content.includes('`')) {
      return undefined;
    }
    let changed = false;
    const replaced = msg.content.replaceAll(
      /\{([\w]+)(?:~(\d+))?\}/g,
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

  public async handleMessage(msg: Message) {
    if ((msg.channel as BaseGuildTextChannel).fetchWebhooks === undefined) {
      return;
    }
    if (msg.author.bot) {
      return;
    }

    const perms = msg.guild?.me?.permissionsIn(
      msg.channel as GuildChannelResolvable,
    );
    if (!perms?.has('MANAGE_MESSAGES') || !perms?.has('MANAGE_WEBHOOKS')) {
      return;
    }

    const webhook = await findOrCreateWebhook(
      client,
      msg.channel as BaseGuildTextChannel,
    );
    const replaced = (await this.trySubstitute(msg)) ?? '';
    if (replaced === '') {
      return;
    }

    await webhook
      .send({
        username: msg.member?.displayName,
        avatarURL: msg.author.avatarURL() ?? undefined,
        content: replaced,
        files: await Promise.all(
          msg.attachments.map(async (attachment) => ({
            attachment: attachment.url,
            name: attachment.name ?? 'unknown',
            file: (await readAttachmentFile(attachment)) as Buffer,
          })),
        ),
      })
      .then(async () => {
        await msg.delete();
      });
  }
}

export default Freemotes;
