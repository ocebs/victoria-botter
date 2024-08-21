import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import invariant from "tiny-invariant";
import drinky from "./commands/drinky";
import flCommand from "./commands/fl";
import secretSanta from "./commands/secretsanta";
import { processProfileEdit } from "./commands/secretsanta/profile";
import tournamentRegister, { tournamentDialogue } from "./commands/tournament";

export default async function initCommands() {
  invariant(
    typeof process.env.DISCORD_TOKEN == "string",
    "Missing Discord token"
  );
  invariant(typeof process.env.DISCORD_ID == "string", "Missing Discord id");
  invariant(
    typeof process.env.DISCORD_SERVER == "string",
    "Missing Discord token"
  );
  const discordREST = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
  );
  const commands = [
    new SlashCommandBuilder()
      .setName("tournament")
      .setDescription("Commands relating to OCE tournaments")
      .addSubcommand((sub) =>
        sub
          .setName("register")
          .setDescription("Sign up to participate in a tournament")
      ),
    new SlashCommandBuilder()
      .setName("fl")
      .setDescription("Leaderboard of OCE firsts"),
    new SlashCommandBuilder()
      .setName("drinky")
      .setDescription("Throw yourself in the drunk tank")
      .addStringOption((option) =>
        option
          .setName("time")
          .setDescription("How long you'll be drinking")
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName("secretsanta")
      .setDescription("OCE Beat Saber's annual secret santa")
      .addSubcommand((sub) =>
        sub
          .setName("login")
          .setDescription("Log in to the secret santa website")
          .addStringOption((option) =>
            option
              .setName("token")
              .setDescription("Login token from the dialogue box")
              .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName("profile")
          .setDescription(
            "Update your profile's information, like your bio or address"
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName("set-country")
          .setDescription("Set your country for the secret santa")

          .addIntegerOption((option) =>
            option
              .setName("country")
              .setDescription("What country you live in")
              .setRequired(true)
              .addChoices(
                { name: "Australia", value: 1 },
                { name: "New Zealand", value: 2 }
              )
          )
      ),
  ];

  await discordREST
    .put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_ID,
        process.env.DISCORD_SERVER
      ),
      { body: commands }
    )
    .catch((error) => console.error(error));
  console.log(`Registered commands ${commands}`);
}

const commands = new Map<
  string,
  (interaction: ChatInputCommandInteraction) => unknown
>([
  ["fl", flCommand],
  ["drinky", drinky],
  ["secretsanta", secretSanta],
  ["tournament", tournamentRegister],
]);

export async function processCommand(interaction: ChatInputCommandInteraction) {
  if (!commands.has(interaction.commandName)) return;
  try {
    await commands.get(interaction.commandName)?.(interaction);
  } catch (err) {
    console.error(err);
    interaction.deferred
      ? interaction.editReply(`\`\`\`\n${err}\n\`\`\``)
      : interaction.reply(`\`\`\`\n${err}\n\`\`\``);
  }
}

const interactions = new Map<
  string,
  (interaction: ModalSubmitInteraction) => void
>([
  ["edit-profile", processProfileEdit],
  ["tournament-register", tournamentDialogue],
]);

export async function processModal(interaction: ModalSubmitInteraction) {
  if (!interactions.has(interaction.customId)) return;
  try {
    await interactions.get(interaction.customId)?.(interaction);
  } catch (err) {
    console.error(err);
    interaction.deferred
      ? interaction.editReply(`\`\`\`\n${err}\n\`\`\``)
      : interaction.reply(`\`\`\`\n${err}\n\`\`\``);
  }
}
