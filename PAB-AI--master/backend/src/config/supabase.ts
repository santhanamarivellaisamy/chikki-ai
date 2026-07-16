import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check if credentials are placeholders or missing
const isMockMode =
  !supabaseUrl ||
  !supabaseServiceKey ||
  supabaseUrl === 'your_supabase_project_url' ||
  supabaseServiceKey === 'your_supabase_service_role_key';

if (isMockMode) {
  console.warn(
    'WARNING: Supabase credentials are missing or using placeholders. Running in MOCK DATABASE MODE.'
  );
}

// Initialize Supabase client
export const supabase = isMockMode
  ? (null as any) // We will handle mock mode inside the database services
  : createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

export { isMockMode };
