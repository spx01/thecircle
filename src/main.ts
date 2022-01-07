import { readFileSync } from 'fs';
import { exit } from 'process';
import { Client } from 'discordx';
import { importx, dirname } from '@discordx/importer';
import { Intents, Interaction, Options } from 'discord.js';
import Freemotes from './freemotes/freemotes.js';
import InviteSpy from './invitespy/invitespy.js';

const cfg = (() => {
  try {
    return JSON.parse(readFileSync('bot_cfg.json').toString());
  } catch (err) {
    console.error(`couldn't open bot config file: ${err}`);
    exit(1);
  }
})();

if (!cfg.token) {
  console.error('no token provided in configuration file');
  exit(1);
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  botGuilds: cfg.debug_guild
    ? [cfg.debug_guild]
    : [(client) => client.guilds.cache.map((guild) => guild.id)],
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildInviteManager: 0,
    GuildMemberManager: 200,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: 0,
    VoiceStateManager: 0,
  }),
});

const freemotes = new Freemotes();
const inviteSpy = new InviteSpy();

export { client, freemotes, inviteSpy };

client.once('ready', async () => {
  await client.guilds.fetch();
  await client.initApplicationCommands();
  await client.initApplicationPermissions();
  client.user?.setStatus('dnd');
  client.user?.setActivity('the world end', { type: 'WATCHING' });
  console.log(
    `Ready as ${client.user?.username}#${client.user?.discriminator}`,
  );

  await freemotes.setup();
  await inviteSpy.setup();
});

client.on('interactionCreate', (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  client.login(cfg.token);
}

run();
