import { createClient } from "@supabase/supabase-js";

const supaURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supaURL || !supabaseKey) {
	throw new Error("Missing supa environment variables.");
}

export const supabase = createClient(supaURL, supabaseKey);
