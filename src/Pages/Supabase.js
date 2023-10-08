// Supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtmjuwctzebijssijzhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWp1d2N0emViaWpzc2lqemhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY3MDkxNzMsImV4cCI6MjAxMjI4NTE3M30.vaQYl--Ug1pFLJjx7c8vJqbbtakUFR-Ozc0liPf0VHo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
