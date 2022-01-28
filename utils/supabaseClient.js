const supabase = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

exports.supabaseClient = supabaseClient;
