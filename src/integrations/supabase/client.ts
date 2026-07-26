import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
