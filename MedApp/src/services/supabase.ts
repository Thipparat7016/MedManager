import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qonicnhgnjwrckxupfdf.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbmljbmhnbmp3cmNreHVwZmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxOTU2NDIsImV4cCI6MjExMDc3MTY0Mn0.Eaa1M5caVgkXHIhNero7AxHrjuuaQeX6X7kqEHnPMnM';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  })
  : null;

