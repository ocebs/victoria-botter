import { ChatInputCommandInteraction } from "discord.js";
import client from "../../client";

import UAParser from "ua-parser-js";

import sql from "../../db";
const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export default async function loginCommand(
	interaction: ChatInputCommandInteraction,
) {
	const uuid = interaction.options.getString("token");
	if (!uuid)
		return interaction.reply({
			ephemeral: true,
			content: "Missing login token",
		});
	if (!uuidRegex.test(uuid))
		return interaction.reply({
			content: "Invalid login token",
			ephemeral: true,
		});
	await interaction.deferReply({ ephemeral: true });

	const [session] = await sql<
		{
			id: string;
			timestamp: string;
			user: string;
			description: string;
		}[]
	>`select * from auth.session where id = ${uuid}`;

	if (!session) return interaction.editReply("Invalid login token");

	if (session.user)
		return interaction.editReply(
			`Already logged in on \`${session.description.replace(
				/([\\\*_\[\]`])/,
				"\\$1",
			)}\`  `,
		);

	const newUser = await sql`INSERT INTO
    auth."user" (id, lastlogin)
    VALUES (${interaction.user.id}, ${new Date().toISOString()})
    ON CONFLICT (id) DO
    UPDATE SET lastlogin = EXCLUDED.lastlogin;
    `;

	await sql`INSERT INTO secretsanta.profile (name, "user_id") VALUES (${interaction.user.username}, ${interaction.user.id}) ON CONFLICT DO NOTHING`;

	await sql`UPDATE auth.session set "user_id" = ${interaction.user.id} WHERE id = ${uuid}`;

	if (!Array.isArray(interaction.member?.roles)) {
		await interaction.member?.roles.add(process.env.SECRET_SANTA_ROLE);
	}

	const ua = new UAParser(session.description).getResult();

	const sanitise = (str: string) => str.replace(/([\\\*_\[\]`])/, "\\$1");

	interaction.editReply(
		`Logged into **${ua.browser.name || "Unknown Browser"}** on **${
			ua.os.name || "Unknown OS"
		}**`,
	);
}
