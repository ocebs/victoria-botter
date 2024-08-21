import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  Interaction,
  ModalBuilder,
  ModalMessageModalSubmitInteraction,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import supabase from "../supabase";

export default async function tournamentRegister(interaction: Interaction) {
  if (!interaction.isCommand() && !interaction.isButton()) return;
  interaction.showModal({
    title: "Tournament Registration",
    custom_id: "tournament-register",
    components: [
      {
        type: 1,
        components: [
          {
            type: ComponentType.TextInput,
            style: TextInputStyle.Short,
            label: "BeatLeader/ScoreSaber profile",
            custom_id: "profile",
            placeholder: "https://scoresaber.com/u/76561198404774259",
            min_length: 38,
            max_length: 50,
          },
        ],
      },
    ],
  });
}

export async function tournamentDialogue(interaction: ModalSubmitInteraction) {
  const { id, username: name } = interaction.user;
  await interaction.deferReply({ ephemeral: true });
  if (id == "387039537706172416") return interaction.reply("no");
  const table = supabase.from<{
    id: string;
    name: string;
    created_at: string;
    profile_link?: string;
  }>("tournament_registration");
  const roles = interaction.member?.roles;

  const checkForRole = Array.isArray(roles)
    ? (t: string) => roles.includes(t)
    : (t: string) => roles?.cache.has(t) ?? false;

  if (
    !checkForRole("1081591281601499296") &&
    !checkForRole("507851139602055168") &&
    !checkForRole("504541004397936640") &&
    !checkForRole("488330459466694667") &&
    !checkForRole("448274475717230603") &&
    !checkForRole("488329952421478411")
  )
    return interaction.editReply("You're outside top 50 OCE");

  const existing = await table.select("*").eq("id", id);
  if (existing.body?.length ?? 0 > 0)
    return interaction.editReply("You've already registered");

  const res = await table.upsert({
    id,
    name,
    profile_link: interaction.fields.getTextInputValue("profile"),
  });

  if (!Array.isArray(interaction.member?.roles)) {
    await interaction.member?.roles.add("1082564493701283870");
  }

  interaction.editReply(`Registered <@${id}> for the OCE tourney`);
}
