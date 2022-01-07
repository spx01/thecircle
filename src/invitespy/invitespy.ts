import { Guild, GuildMember } from 'discord.js';
import { client } from '../main.js';

class InviteSpy {
  cachedInvites: Map<string, Map<string, number>>;

  constructor() {
    this.cachedInvites = new Map();
  }

  public async setup() {
    client.guilds.cache.forEach(async (guild) => {
      await this.updateInvites(guild);
    });
  }

  public async updateInvites(guild: Guild) {
    const invites = await guild.invites.fetch();
    this.cachedInvites.set(
      guild.id,
      new Map(invites.map((invite) => [invite.code, invite.uses ?? 0])),
    );
  }

  public deleteFromGuild(guild: Guild) {
    this.cachedInvites.delete(guild.id);
  }

  public async handleNewMember(member: GuildMember) {
    const channel = member.guild.systemChannel;
    if (!channel) {
      return;
    }
    let msg = `${member} joined,`;
    const oldInvites = this.cachedInvites.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();
    const inviteUsed = newInvites.find(
      (invite) => invite.uses !== oldInvites?.get(invite.code),
    );
    const inviter = inviteUsed?.inviter;
    if (!inviteUsed || !inviter) {
      msg = `${msg} don't know who invited them.`;
    } else {
      msg = `${msg} invited by ${inviter?.username}#${inviter?.discriminator}.`;
    }
    await channel.send(msg);
  }
}

export default InviteSpy;
