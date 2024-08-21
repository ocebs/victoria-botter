import { ButtonInteraction } from "discord.js";
import { setSober } from "./commands/drinky";
import tournamentRegister from "./commands/tournament";

export const buttons = new Map<
  string,
  (interaction: ButtonInteraction) => unknown
>([
  ["set_sober", setSober],
  ["show-tournament-dialogue", tournamentRegister],
]);

export async function processButton(interaction: ButtonInteraction) {
  if (!buttons.has(interaction.customId)) return;
  try {
    await buttons.get(interaction.customId)?.(interaction);
  } catch (err) {
    interaction.reply(`\`\`\`\n${err}\n\`\`\``);
  }
}
