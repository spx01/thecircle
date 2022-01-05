import { readFileSync } from 'fs';
import { exit } from 'process';
import { Client } from 'discordx';
import { importx, dirname } from '@discordx/importer';
import { Intents, Interaction } from 'discord.js';

const cfg = (() => {
  try {
    return JSON.parse(readFileSync('bot_cfg.json').toString());
  } catch (err) {
    console.error(`couldn't open bot config file: ${err}`);
    exit(1);
  }
  return undefined;
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
  // silent: false,
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  botGuilds: ['914055768217624607'],
});

client.once('ready', async () => {
  await client.guilds.fetch();
  await client.initApplicationCommands();
  await client.initApplicationPermissions();
  client.user?.setStatus('dnd');
  client.user?.setActivity('the world end', { type: 'WATCHING' });
  console.log(`Ready as ${client.user?.username}#${client.user?.discriminator}`);
});

client.on('interactionCreate', (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  client.login(cfg.token);
}

run();
