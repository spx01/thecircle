import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { freemotes } from '../main.js';

/* eslint-disable */
@Discord()
class FreemoteCommands {
  @Slash('list')
  async list(
      interaction: CommandInteraction
  ) {
    /* eslint-enable */
    await interaction.deferReply();
    await interaction.editReply(freemotes.getEmoteList());
  }
}
