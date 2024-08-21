import { IntentsBitField } from "discord.js";
import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";

const client = new Client({
  intents: GatewayIntentBits.Guilds,
});

export default client;
