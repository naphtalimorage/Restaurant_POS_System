// config/config.js
require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    accessTokenSecret: process.env.JWT_SECRET,
};
