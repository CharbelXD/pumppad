import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Token = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image_url: string;
  website: string;
  twitter: string;
  telegram: string;
  creator_address: string;
  mint_address: string;
  total_supply: number;
  presale_price: number;
  soft_cap: number;
  hard_cap: number;
  raised_amount: number;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'live' | 'ended' | 'finalized';
  replies_count: number;
  market_cap: number;
  is_featured: boolean;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Contribution = {
  id: string;
  token_id: string;
  contributor_address: string;
  amount_sol: number;
  tokens_allocated: number;
  tx_hash: string;
  created_at: string;
};

export type Comment = {
  id: string;
  token_id: string;
  author_address: string;
  author_name: string;
  content: string;
  created_at: string;
};
