import { ArgsOf, Client, Discord, On } from 'discordx';
import { freemotes, inviteSpy } from '../main.js';

/* eslint-disable */
@Discord()
export abstract class AppDiscord {
  @On('guildCreate')
  async guildCreate([guild]: ArgsOf<'guildCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.updateEmojis(guild);
    await inviteSpy.updateInvites(guild);
  }

  /* eslint-disable */
  @On('emojiUpdate')
  async emojiUpdate(
    [oldEmoji, newEmoji]: ArgsOf<'emojiUpdate'>,
    client: Client,
  ) {
    /* eslint-enable */
    await freemotes.updateEmojis(oldEmoji.guild);
  }

  /* eslint-disable */
  @On('emojiCreate')
  async emojiCreate([emoji]: ArgsOf<'emojiCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.updateEmojis(emoji.guild);
  }

  /* eslint-disable */
  @On('emojiDelete')
  async emojiDelete([emoji]: ArgsOf<'emojiDelete'>, client: Client) {
    /* eslint-enable */
    await freemotes.updateEmojis(emoji.guild);
  }

  /* eslint-disable */
  @On('guildDelete')
  async guildDelete([guild]: ArgsOf<'guildDelete'>, client: Client) {
    /* eslint-disable */
    freemotes.deleteFromGuild(guild);
    inviteSpy.deleteFromGuild(guild);
  }

  /* eslint-disable */
  @On('messageCreate')
  async messageCreate([message]: ArgsOf<'messageCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.handleMessage(message);
  }

  /* eslint-disable */
  @On('guildMemberAdd')
  async guildMemberAdd([member]: ArgsOf<'guildMemberAdd'>, client: Client) {
    /* eslint-enable */
    inviteSpy.handleNewMember(member);
  }

  /* eslint-disable */
  @On('guildMemberRemove')
  async guildMemberRemove(
    [member]: ArgsOf<'guildMemberRemove'>,
    client: Client,
  ) {
    /* eslint-enable */
    await inviteSpy.handleMemberRemoved(member);
  }
}
