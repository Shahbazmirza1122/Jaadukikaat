
import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars without crashing
const getEnvVar = (key: string, viteKey: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      return import.meta.env[viteKey];
    }
  } catch (e) {
    console.debug('Environment variable access error', e);
  }
  return null;
};

// YOUR SPECIFIC SUPABASE CONFIGURATION
// Defaulting to the provided hardcoded values if env vars are missing or empty
const HARDCODED_URL = 'https://jfgtkjezujobzsushhhz.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZ3RramV6dWpvYnpzdXNoaGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTQ2MDIsImV4cCI6MjA5NTk5MDYwMn0.SuILcqDeJtGFoRtcERPqeYefk7gMJQ2Tb_tMBoO-mxA';

const envUrl = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const envKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Use env var if present and not empty, otherwise fallback
const supabaseUrl = (envUrl && envUrl.trim().length > 0) ? envUrl.trim() : HARDCODED_URL;
const supabaseKey = (envKey && envKey.trim().length > 0) ? envKey.trim() : HARDCODED_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Authentication will fail.");
}

// Create client with optimized settings for stability
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for better security and stability
  },
  global: {
    headers: { 'x-application-name': 'jaadu-ki-kaat' }
  }
});
