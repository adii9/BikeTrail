import { createClient } from '@supabase/supabase-js';

SUPABASE_URL= 'https://kryofojqmfcsvykaccdj.supabase.co'
SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeW9mb2pxbWZjc3Z5a2FjY2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Njc3MTcsImV4cCI6MjA0ODA0MzcxN30.bkTWibz_SrxuS98oSE6H2aM6S7mygahqqGBpoyrwm6A'
CLIENT_ID = '1071773609270-vd7ahaarq3a1n29cg8q9di3ggs0s45em.apps.googleusercontent.com'


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
