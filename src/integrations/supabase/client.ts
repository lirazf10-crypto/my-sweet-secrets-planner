import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded directly rather than read from Vercel env vars: this is the
// public anon key (meant to be embedded in client bundles, not a secret),
// and Vercel's masked env var UI kept silently corrupting the pasted value.
const SUPABASE_URL = 'https://xhtvwcnutzgxurcinxnf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodHZ3Y251dHpneHVyY2lueG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDQ3MzksImV4cCI6MjEwMDYyMDczOX0.z5QF_NlM1b3mF0jWWAOM0pI4qeX7ujK7LCjDkkGV5CE';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Google's provider_refresh_token is only attached to the Session object
// during the SIGNED_IN event that follows the OAuth redirect (PKCE code
// exchange) - it is never persisted to storage and is gone if we miss this
// event. Registered here at module load, before React mounts, so it can't
// lose the race to a useEffect subscribing too late.
supabase.auth.onAuthStateChange((_event, session) => {
  const refreshToken = (session as unknown as { provider_refresh_token?: string })?.provider_refresh_token;
  if (!refreshToken) return;
  supabase
    .from('google_calendar_tokens')
    .delete()
    .gte('updated_at', '1900-01-01')
    .then(() => supabase.from('google_calendar_tokens').insert({ refresh_token: refreshToken }));
});
