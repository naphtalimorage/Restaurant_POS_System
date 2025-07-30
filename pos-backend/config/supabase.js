const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

SUPABASE_URL='https://ctwwjdcmnvddmwoanioz.supabase.co';
SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d3dqZGNtbnZkZG13b2FuaW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTA3MTEsImV4cCI6MjA2OTQ4NjcxMX0.JtPyiCpCNtvv1rvDSYJYGuCfQaXqnRfcM5oWDPoTp8c';

// Initialize Supabase client
const supabase = createClient(
    SUPABASE_URL,       // ✅ This must be the Supabase project URL
    SUPABASE_ANON_KEY  // ✅ This must be the anon/public API key
);

// Function to check Supabase connection
const connectSupabase = async () => {
  try {
    // Simple query to check connection
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.log(`❌ Supabase connection failed: ${error.message}`);
      // Don't exit process, just log the error
    } else {
      console.log('✅ Supabase Connected');
    }
  } catch (error) {
    console.log(`❌ Supabase connection failed: ${error.message}`);
    // Don't exit process, just log the error
  }
};

module.exports = { supabase, connectSupabase };