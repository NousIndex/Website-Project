// Supabase.js
import { createClient } from '@supabase/supabase-js';

// The anon key is designed to ship in the browser bundle -- row level security,
// not secrecy, is what protects the data behind it. The literals are fallbacks
// so existing deploys keep working before the env vars are set.
const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || 'https://vtmjuwctzebijssijzhq.supabase.co';
const supabaseAnonKey =
  import.meta.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWp1d2N0emViaWpzc2lqemhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY3MDkxNzMsImV4cCI6MjAxMjI4NTE3M30.vaQYl--Ug1pFLJjx7c8vJqbbtakUFR-Ozc0liPf0VHo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
