import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
    process.env.SUPABASE_PUBLIC_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
