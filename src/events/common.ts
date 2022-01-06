import {
  ArgsOf, Client, Discord, On,
} from 'discordx';
import { freemotes } from '../main.js';

/* eslint-disable */
@Discord()
export abstract class AppDiscord {
  @On('guildCreate')
  async guildCreate([guild]: ArgsOf<'guildCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.updateEmojis(guild);
  }

  /* eslint-disable */
  @On('emojiUpdate')
  async emojiUpdate([oldEmoji, newEmoji]: ArgsOf<'emojiUpdate'>, client: Client) {
    /* eslint-enable */
    await freemotes.updateEmojis(oldEmoji.guild);
  }

  /* eslint-disable */
  @On('messageCreate')
  async messageCreate([message]: ArgsOf<'messageCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.handleMessage(message);
  }
}
