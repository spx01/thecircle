import { CommandInteraction, GuildChannel } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { freemotes } from '../main.js';

/* eslint-disable */
@Discord()
class FreemoteCommands {
  @Slash('freemotes', { description: 'list available emojis' })
  async list(interaction: CommandInteraction) {
    /* eslint-enable */
    const { guild } = interaction;
    const everyone = guild?.roles.everyone;
    if (!everyone) {
      return;
    }
    const channel = interaction.channel as GuildChannel;
    const perms = channel.permissionsFor(guild?.roles.everyone);
    if (!perms?.has('USE_EXTERNAL_EMOJIS')) {
      interaction.reply({
        ephemeral: true,
        content: 'Error: Cannot use external emojis in this channel.',
      });
      return;
    }

    await interaction.deferReply();
    await interaction.editReply(freemotes.getEmoteList());
  }
}
