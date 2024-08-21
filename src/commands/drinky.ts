import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import ms from "ms";

export async function setSober(interaction: ButtonInteraction) {
  const roles = interaction.member?.roles;
  if (!roles || Array.isArray(roles)) return;
  await roles.remove(process.env.DRUNK_ROLE_ID);

  try {
    interaction.update({ content: "Welcome Back\\!", components: [] });
  } catch (err) {}
}

export default async function (interaction: ChatInputCommandInteraction) {
  const timeParam = interaction.options.getString("time");
  const time = (timeParam && ms(timeParam)) || ms("3 hours");
  const roles = interaction.member?.roles;

  if (!roles || Array.isArray(roles)) return;
  if (
    interaction.member &&
    !Array.isArray(interaction.member?.roles) &&
    interaction.member?.roles.cache.some(
      ({ id }) => id == process.env.DRUNK_ROLE_ID
    )
  ) {
    interaction.reply({
      content: "You are already in the drunk tank",
      ephemeral: true,
    });
    return;
  }
  await roles.add(process.env.DRUNK_ROLE_ID);

  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  actionRow.addComponents(
    new ButtonBuilder()
      .setLabel("I am no longer drunk")
      .setCustomId("set_sober")
      .setStyle(2)
  );

  interaction.reply({
    content: `You've been moved to the drunk tank until <t:${Math.floor(
      (Date.now() + time) / 1000
    )}:t>.`,
    components: [actionRow],
    ephemeral: true,
  });

  setTimeout(async () => {
    const roles = interaction.member?.roles;
    if (!roles || Array.isArray(roles)) return;
    await roles.remove(process.env.DRUNK_ROLE_ID);
    interaction.editReply({
      content: `Welcome back!`,
      components: [],
    });
  }, time);
}
