import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';

/* eslint-disable */
@Discord()
class Ping {
  @Slash('ping')
  async ping(
    interaction: CommandInteraction,
  ) {
    /* eslint-enable */
    interaction.reply('pong');
  }
}
