import {
  ArgsOf, Discord, On, Client,
} from 'discordx';
import Freemotes from '../freemotes/freemotes.js';

const freemotes = new Freemotes();

/* eslint-disable */
@Discord()
export abstract class AppDiscord {
  @On('messageCreate')
  async onMessage([message]: ArgsOf<'messageCreate'>, client: Client) {
    /* eslint-enable */
    await freemotes.handleMessage(message, client);
  }
}
