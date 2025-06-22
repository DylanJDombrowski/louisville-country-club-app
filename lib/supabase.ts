import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://zxyavwkcmpqonxrfvogl.supabase.co"; // Paste your URL here
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eWF2d2tjbXBxb254cmZ2b2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTcxMzQsImV4cCI6MjA2NjE5MzEzNH0.XdJdCjB9E-fP0mVJXoqWP4NAgurOpoLQ5oihN3AYLD0"; // Paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
