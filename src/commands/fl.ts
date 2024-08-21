import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

interface First {
  rank: number;
  name: string;
  scoresaber_id: string;
  country: string;
  profilePicture: string;
  firsts: number;
}

import { fetch as f } from "undici";

import { createCanvas, loadImage } from "canvas";

const colours = {
  first: "#ff2052",
  ten: "#e400ff",
  "twenty-five": "#0d7eff",
  fifty: "#18eaa8",
  "one-hundred": "#00ff11",
  "two-hundred-and-fifty": "#f1c40f",
  "five-hundred": "#e67e22",
  "one-thousand": "#607d8b",
  "": "#404040",
};

export function getRankBorder(rank: number | undefined) {
  if (rank == undefined) return "";
  if (rank == 1) return "first";
  if (rank <= 10) return "ten";
  if (rank <= 25) return "twenty-five";
  if (rank <= 50) return "fifty";
  if (rank <= 100) return "one-hundred";
  if (rank <= 250) return "two-hundred-and-fifty";
  if (rank <= 500) return "five-hundred";
  if (rank <= 1000) return "one-thousand";
  else return "";
}

export default async function flCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply();

  const firsts = await f(
    "https://leaderboard-api.ocebs.com/rest/v1/first?limit=10"
  ).then(
    (i) =>
      i.json() as Promise<
        {
          rank: number;
          oce_rank?: number;
          name: string;
          scoresaber_id: string;
          country: string;
          profilePicture: string;
          firsts: number;
        }[]
      >
  );

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder({})
      .setURL("https://leaderboard.ocebs.com/firsts")
      .setLabel("View full leaderboard")
      .setStyle(5)
  );

  const width = 624;
  const height = firsts.length * 50 + 4;
  const scale = 2;

  const c = createCanvas(width * scale, height * scale);
  const ctx = c.getContext("2d");

  ctx.scale(scale, scale);

  ctx.fillStyle = "rgb(23, 23, 23);";
  ctx.fillRect(0, 0, width, height);

  ctx.translate(0, 2);

  await Promise.all(
    firsts?.map(async (player, n) => {
      const imageSize = 32;
      const image = await loadImage(player.profilePicture);

      const imagePos = n * 50 + (50 - imageSize) / 2;

      //image background
      ctx.save();
      ctx.fillStyle = colours[getRankBorder(player.oce_rank)];
      ctx.shadowColor = colours[getRankBorder(player.oce_rank)] + "7f";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(
        50 + imageSize / 2,
        imagePos + imageSize / 2,
        imageSize / 2 + 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // image
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        50 + imageSize / 2,
        imagePos + imageSize / 2,
        imageSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();

      ctx.drawImage(image, 50, imagePos, imageSize, imageSize);
      ctx.restore();

      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(player.name, imageSize + 12 + 50, n * 50 + 25);
      ctx.textAlign = "right";
      ctx.fillText(`#${player.rank}`, 50 - 12, n * 50 + 25);
      ctx.fillText(
        player.firsts.toLocaleString("en-AU", {
          maximumFractionDigits: 2,
        }) + " firsts",
        width - 12,
        n * 50 + 25
      );

      ctx.fillStyle = "rgb(38, 38, 38);";
      if (n > 0) ctx.fillRect(0, n * 50 - 1, width, 2);
    })
  );

  const image = c.toBuffer("image/png");

  try {
    interaction.editReply({
      components: [row],
      files: [
        {
          attachment: image,
          name: "leaderboard.png",
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}
