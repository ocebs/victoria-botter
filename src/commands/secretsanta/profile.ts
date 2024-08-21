import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  StringSelectMenuBuilder,
  TextInputStyle,
  SelectMenuBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import sql from "../../db";

export default async function profileCommand(
  interaction: ChatInputCommandInteraction
) {
  const [currentProfile] = await sql<
    { name: string; address: string; bio: string }[]
  >`SELECT "name", bio, address FROM secretsanta.profile WHERE "user_id" = ${interaction.user.id}`;

  if (!currentProfile)
    return interaction.reply({
      content: "Profile not found, have you signed up?",
      ephemeral: true,
    });

  const inputs = {
    nickname: new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Nickname")
      .setPlaceholder(interaction.user.username)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setValue(currentProfile?.name ?? ""),
    bio: new TextInputBuilder()
      .setCustomId("bio")
      .setLabel("Bio")
      .setPlaceholder(
        "Somebody once told me the world is gonna roll me;\nI ain't the sharpest tool in the shed"
      )
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(currentProfile?.bio ?? ""),
    address: new TextInputBuilder()
      .setCustomId("address")
      .setLabel("Address")
      .setPlaceholder("12 Example St\nSydney NSW\n2077")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setValue(currentProfile?.address ?? ""),
  };
  const actionRows = [
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      inputs.nickname
    ),
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      inputs.bio
    ),
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      inputs.address
    ),
  ];

  const modal = new ModalBuilder()
    .setTitle("Edit profile")
    .setCustomId("edit-profile")
    /// @ts-ignore bad types
    .addComponents(...actionRows);

  await interaction.showModal(modal);
}

export async function countryCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const country = interaction.options.getInteger("country");
  const [updated] = await sql<
    []
  >`UPDATE secretsanta.profile SET country_id = ${country} WHERE "user_id" = ${interaction.user.id} RETURNING country_id`;

  if (!updated)
    return interaction.editReply({
      content: "Profile not found, have you signed up?",
    });
  return interaction.editReply("Profile updated");
}

export async function processProfileEdit(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const filteredOptions = [...interaction.fields.fields]
    .filter(([key]) => ["name", "bio", "address"].includes(key))
    .map(([k, v]) => [k, v.value]);

  const [updated] = await sql`UPDATE secretsanta.profile SET ${sql(
    Object.fromEntries(filteredOptions)
  )} where "user_id" = ${interaction.user.id}`;

  interaction.editReply("Profile updated!");
}
