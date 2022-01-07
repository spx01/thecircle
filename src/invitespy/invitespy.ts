import { GuildMember } from 'discord.js';
import { client } from '../main.js';

class InviteSpy {
  invites: Map<string, Map<string, number>>;

  constructor() {
    this.invites = new Map();
  }

  public setup() {
    client.guilds.cache.forEach(async (guild) => {
      const invites = await guild.invites.fetch();
      this.invites.set(
        guild.id,
        new Map(invites.map((invite) => [invite.code, invite.uses ?? 0])),
      );
    });
  }

  public async handleNewMember(member: GuildMember) {
    const channel = member.guild.systemChannel;
    if (!channel) {
      return;
    }
    await channel.send(`${member.displayName} joined`);
  }
}

export default InviteSpy;
