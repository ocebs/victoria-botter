// Load configuration info from environment
import client from "./client";
import dotenv from "dotenv";
import invariant from "tiny-invariant";
import initCommands, { processCommand, processModal } from "./commands";
import { processButton } from "./buttons";
import sendFirstMessages from "./firstMessages";
import sendRankMessages from "./rankMessages";
import { channel } from "diagnostics_channel";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
} from "discord.js";
dotenv.config();

// Check for environment variables
invariant(typeof process.env.DISCORD_ID == "string", "Missing Discord ID");
invariant(
  typeof process.env.DISCORD_SERVER == "string",
  "Missing Discord Server"
);
invariant(typeof process.env.DRUNK_ROLE_ID == "string", "Missing Drunk role");
invariant(
  typeof process.env.DISCORD_TOKEN == "string",
  "Missing Discord token"
);

(async () => {
  // Discord setup
  {
    const logMessage = "Initialise Discord";
    console.time(logMessage);
    client.once("ready", () => {
      sendFirstMessages();
      sendRankMessages();

      console.timeEnd(logMessage);
    });
  }

  {
    if (true) {
      const logMessage = "Register Commands";
      console.time(logMessage);
      await initCommands();
      console.timeEnd(logMessage);
    }

    client.on("interactionCreate", (interaction) => {
      if (interaction.isChatInputCommand()) processCommand(interaction);
      if (interaction.isModalSubmit()) processModal(interaction);
      if (interaction.isButton()) processButton(interaction);
    });
  }

  client.login(process.env.DISCORD_TOKEN);
})();
