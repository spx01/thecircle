import { readFileSync } from 'fs';
import { exit } from 'process';
import { Client } from 'discordx';
import { importx, dirname } from '@discordx/importer';
import { Intents, Interaction } from 'discord.js';
import Freemotes from './freemotes/freemotes.js';

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
  ],
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  botGuilds: cfg.debug_guild
    ? [cfg.debug_guild]
    : [(client) => client.guilds.cache.map((guild) => guild.id)],
});

const freemotes = new Freemotes();

export { freemotes, client };

client.once('ready', async () => {
  await client.guilds.fetch();
  await client.initApplicationCommands();
  await client.initApplicationPermissions();
  client.user?.setStatus('dnd');
  client.user?.setActivity('the world end', { type: 'WATCHING' });
  console.log(
    `Ready as ${client.user?.username}#${client.user?.discriminator}`,
  );

  client.guilds.cache.forEach((guild) => {
    freemotes.updateEmojis(guild);
  });
});

client.on('interactionCreate', (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  client.login(cfg.token);
}

run();
