import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ctwwjdcmnvddmwoanioz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d3dqZGNtbnZkZG13b2FuaW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTA3MTEsImV4cCI6MjA2OTQ4NjcxMX0.JtPyiCpCNtvv1rvDSYJYGuCfQaXqnRfcM5oWDPoTp8c';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};