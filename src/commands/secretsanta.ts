import { ChatInputCommandInteraction } from "discord.js";
import sql from "../db";
import loginCommand from "./secretsanta/login";
import profileCommand, { countryCommand } from "./secretsanta/profile";

export default function secretSantaSwitch(
  interaction: ChatInputCommandInteraction
) {
  const command = interaction.options.getSubcommand();

  console.log(command);
  switch (command) {
    case "login":
      return loginCommand(interaction);
    case "profile":
      return profileCommand(interaction);
    case "set-country":
      return countryCommand(interaction);
  }
}
