import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars without crashing if process is undefined
// Supports both Create React App (process.env) and Vite (import.meta.env)
const getEnvVar = (key: string, viteKey: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
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

// Retrieve keys from environment or use the hardcoded credentials provided
const envUrl = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const envKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// YOUR SPECIFIC SUPABASE CONFIGURATION
// We prioritize the hardcoded values here as requested, with env vars as overrides/fallbacks.
const supabaseUrl = 'https://ihlxttnoaexqaevhdzdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobHh0dG5vYWV4cWFldmhkemRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQyNzksImV4cCI6MjA4MTU3MDI3OX0.jgoxW6r8Uj7GqR7UiF1tCo7jxbUBP3QjdLRzDmFnuVk';

// Final config check
const finalUrl = envUrl || supabaseUrl;
const finalKey = envKey || supabaseAnonKey;

if (!finalUrl || !finalKey) {
    console.warn("Supabase credentials missing.");
}

export const supabase = createClient(finalUrl, finalKey);