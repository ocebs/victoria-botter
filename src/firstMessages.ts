import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Message } from "discord.js";
import invariant from "tiny-invariant";
import client from "./client";
import firstMessage from "./messages/first";
import type { components as ScoreSaber } from "./types/scoresaber";

export default function sendFirstMessages() {
  invariant(process.env.SUPABASE_KEY);
  invariant(process.env.SUPABASE_URL);
  invariant(process.env.FIRSTS_CHANNEL);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  supabase
    .from<{
      data: ScoreSaber["schemas"]["LeaderboardInfo"];
      scoreData: ScoreSaber["schemas"]["Score"];
    }>("map")
    .on("*", async (payload) => {
      if (payload.eventType == "DELETE") return;
      try {
        if (!payload.new.scoreData) return;
        const channel = await client.channels.fetch(process.env.FIRSTS_CHANNEL);
        invariant(channel);
        invariant(channel.isTextBased());

        const message = firstMessage(
          {
            leaderboard: payload.new.data,
            score: payload.new.scoreData,
          },
          payload.old.scoreData && Object.keys(payload.old.scoreData).length > 0
            ? payload.old?.scoreData
            : undefined
        );
        if (
          !payload.old.scoreData ||
          payload.new.scoreData.modifiedScore >
            payload.old.scoreData.modifiedScore
        )
          // @ts-ignore
          channel.send({ embeds: message.body.embeds });
      } catch (err) {
        console.error(err);
      }
    })
    .subscribe(() => console.log("Watching for improved scores"));
}
