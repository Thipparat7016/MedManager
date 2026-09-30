import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://lgkabxnmgcwsuqrhmdyv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2FieG5tZ2N3c3VxcmhtZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDY1ODIsImV4cCI6MjEwMzIyMjU4Mn0._a4VUC_cbhsytVn10ojNY4FdiVV65ozJReAb4FApHFI';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: safeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

