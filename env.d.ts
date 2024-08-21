declare namespace NodeJS {
  export interface ProcessEnv {
    DISCORD_ID: string;
    DISCORD_TOKEN: string;
    DISCORD_SERVER: string;
    DRUNK_ROLE_ID: string;
    FIRSTS_CHANNEL: string;
    RANK_FEED_CHANNEL: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    DATABASE_URL: string;
    SECRET_SANTA_ROLE: string;
  }
}
