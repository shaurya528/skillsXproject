import { supabaseAdmin } from './config/supabase';

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Connection failed:', error.message);
    return;
  }
  console.log('Connected! Users found:', data.users.length);
}

main();