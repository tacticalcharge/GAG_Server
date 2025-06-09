// client.js
import { Client, GatewayIntentBits, IntentsBitField, Partials, ActivityType, ButtonStyle } from 'discord.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageTyping
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});
