import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ppzrqzkxsucbvxlconpq.supabase.co",
  process.env.SUPABASE_KEY
);

export default supabase;
