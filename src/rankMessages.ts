import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Message, TextChannel } from "discord.js";
import invariant from "tiny-invariant";
import client from "./client";
import type { components as ScoreSaber } from "./types/scoresaber";
import escape from "./messages/escape";

const localMilestones = [
  [250, "Top 250 OCE"],
  [100, "Top 100 OCE"],
  [50, "Top 50 OCE"],
  [25, "Top 25 OCE"],
  [10, "Top 10 OCE"],
  [1, "Top OCE player"],
].reverse() as [number, string][];

export default function sendRankMessages() {
  invariant(process.env.SUPABASE_KEY);
  invariant(process.env.SUPABASE_URL);
  invariant(process.env.RANK_FEED_CHANNEL);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  supabase
    .from<{
      name?: string;
      scoresaber_id: string;
      rank?: number;
    }>("rank_cache")
    .on("*", async (payload) => {
      if (payload.eventType == "DELETE") return;
      try {
        if (!payload.new.rank) return;
        payload.old.rank ??= Infinity;
        payload.new.name ??= "";
        const channel = (await client.channels.fetch(
          process.env.RANK_FEED_CHANNEL
        )) as TextChannel;
        invariant(channel);
        invariant(channel.isTextBased());

        for (let [milestone, message] of localMilestones) {
          if (payload.new.rank <= milestone && payload.old.rank > milestone) {
            return channel.send(
              `${escape(payload.new.name)} has reached ${message}`
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    })
    .subscribe(() => console.log("Watching for rank changes"));
}
