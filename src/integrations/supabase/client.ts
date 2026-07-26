import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded directly rather than read from Vercel env vars: this is the
// public anon key (meant to be embedded in client bundles, not a secret),
// and Vercel's masked env var UI kept silently corrupting the pasted value.
const SUPABASE_URL = 'https://xhtvwcnutzgxurcinxnf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodHZ3Y251dHpneHVyY2lueG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDQ3MzksImV4cCI6MjEwMDYyMDczOX0.z5QF_NlM1b3mF0jWWAOM0pI4qeX7ujK7LCjDkkGV5CE';

// Capture Google's provider_refresh_token from the OAuth redirect hash before
// supabase-js consumes/clears it. Stashed in sessionStorage so useAuth can
// persist it once an authenticated session is available.
if (typeof window !== 'undefined' && window.location.hash.includes('provider_refresh_token')) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const providerRefreshToken = params.get('provider_refresh_token');
  if (providerRefreshToken) {
    sessionStorage.setItem('pending_google_refresh_token', providerRefreshToken);
  }
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
