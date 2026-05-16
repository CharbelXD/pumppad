
/*
  # Solana Presale Launchpad Schema

  1. New Tables
    - `tokens`
      - `id` (uuid, primary key)
      - `name` (text) - token name
      - `symbol` (text) - token ticker
      - `description` (text)
      - `image_url` (text)
      - `website` (text, optional)
      - `twitter` (text, optional)
      - `telegram` (text, optional)
      - `creator_address` (text) - Solana wallet address
      - `mint_address` (text, unique) - token mint address
      - `total_supply` (bigint)
      - `presale_price` (numeric) - price per token in SOL
      - `soft_cap` (numeric) - minimum SOL to raise
      - `hard_cap` (numeric) - maximum SOL to raise
      - `raised_amount` (numeric) - current SOL raised
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `status` (text) - 'upcoming', 'live', 'ended', 'finalized'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `replies_count` (int)
      - `market_cap` (numeric)
      - `is_featured` (boolean)
      - `category` (text)

    - `contributions`
      - `id` (uuid, primary key)
      - `token_id` (uuid, FK tokens)
      - `contributor_address` (text)
      - `amount_sol` (numeric)
      - `tokens_allocated` (numeric)
      - `tx_hash` (text)
      - `created_at` (timestamptz)

    - `comments`
      - `id` (uuid, primary key)
      - `token_id` (uuid, FK tokens)
      - `author_address` (text)
      - `author_name` (text)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public read on tokens, contributions, comments
    - Allow authenticated insert on contributions and comments
*/

CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symbol text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  website text DEFAULT '',
  twitter text DEFAULT '',
  telegram text DEFAULT '',
  creator_address text NOT NULL DEFAULT '',
  mint_address text UNIQUE NOT NULL DEFAULT '',
  total_supply bigint NOT NULL DEFAULT 1000000000,
  presale_price numeric NOT NULL DEFAULT 0.000001,
  soft_cap numeric NOT NULL DEFAULT 10,
  hard_cap numeric NOT NULL DEFAULT 100,
  raised_amount numeric NOT NULL DEFAULT 0,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'live',
  replies_count int NOT NULL DEFAULT 0,
  market_cap numeric NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT 'meme',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  contributor_address text NOT NULL,
  amount_sol numeric NOT NULL,
  tokens_allocated numeric NOT NULL,
  tx_hash text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  author_address text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tokens"
  ON tokens FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert tokens"
  ON tokens FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update tokens"
  ON tokens FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view contributions"
  ON contributions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert contributions"
  ON contributions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_token_id ON contributions(token_id);
CREATE INDEX IF NOT EXISTS idx_comments_token_id ON comments(token_id);

INSERT INTO tokens (name, symbol, description, image_url, creator_address, mint_address, total_supply, presale_price, soft_cap, hard_cap, raised_amount, status, replies_count, market_cap, is_featured, category) VALUES
('PepeCoin', 'PEPE', 'The original meme coin on Solana. Born from the streets, destined for the moon. Community-driven, no team tokens, pure degen energy.', 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'PEPEsol1111111111111111111111111111111111111', 1000000000, 0.000001, 50, 200, 143.5, 'live', 342, 143500, true, 'meme'),
('DogWifHat', 'WIF', 'Dog with a hat on the Solana blockchain. Simple. Elegant. Revolutionary. The hat stays on.', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400', '3yFwqXBfZY8CqiMiLGHGBF6uPVQk1LkEFKPShvRmGcpS', 'WIFsol111111111111111111111111111111111111111', 1000000000, 0.0000005, 30, 150, 89.2, 'live', 156, 89200, true, 'meme'),
('CatInABox', 'CATBOX', 'Schrodinger''s memecoin. Is it alive? Is it dead? Only one way to find out. Buy now before you know!', 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400', '9mNPcE3zBVKk2vXkFz2zBcnGGgNzKAMmWiPiMLzFxpQL', 'CATBOXsol11111111111111111111111111111111111', 500000000, 0.000002, 20, 100, 12.3, 'live', 78, 24600, false, 'meme'),
('SolanaFrog', 'SFROG', 'Frogs on Solana. No utility. No roadmap. Just vibes and frogs. Ribbit.', 'https://images.pexels.com/photos/70083/frog-macro-amphibian-green-70083.jpeg?auto=compress&cs=tinysrgb&w=400', '5kCDnFy9MEP4FdUxGUBGRqfVb8vSZM9NKQ6FWHRhGxpP', 'SFROGsol111111111111111111111111111111111111', 2000000000, 0.0000003, 15, 80, 62.1, 'live', 203, 62100, false, 'meme'),
('MoonRocket', 'MOON', 'To the moon and beyond. First deflationary rocket token on Solana. Each transaction burns 1% of supply.', 'https://images.pexels.com/photos/355935/pexels-photo-355935.jpeg?auto=compress&cs=tinysrgb&w=400', '2hGhMLCCbBrCKZBtePdUEk3YLnTJfN2jFMcVxfFQWgVK', 'MOONsol1111111111111111111111111111111111111', 500000000, 0.000003, 25, 120, 120, 'ended', 445, 360000, true, 'defi'),
('MemeBonk', 'MBONK', 'BONK''s little brother came to Solana to party. Wen lambo? Wen moon? Wen BONK hard.', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400', '6rNvBJLfHNJb2p3bU4nQkM7rMVzBKkKMPNfJpStPdGm4', 'MBONKsol11111111111111111111111111111111111', 1000000000000, 0.0000001, 100, 500, 234.7, 'live', 567, 234700, false, 'meme'),
('SolApe', 'SAPE', 'Apes together strong. Apes on Solana even stronger. Diamond hands only. No paper hands allowed in this jungle.', 'https://images.pexels.com/photos/2295744/pexels-photo-2295744.jpeg?auto=compress&cs=tinysrgb&w=400', '8pQhJkMnBLzVxYwRtUeIsOaKjCvDfGhNmPsSdWqZxTrE', 'SAPEsol111111111111111111111111111111111111', 777777777, 0.000002, 40, 180, 5.8, 'live', 34, 11600, false, 'meme'),
('TurboToad', 'TOAD', 'The fastest toad on Solana. Turbo-charged, high-octane amphibian finance. TOAD to the stars.', 'https://images.pexels.com/photos/70083/frog-macro-amphibian-green-70083.jpeg?auto=compress&cs=tinysrgb&w=400', '4mVcPkNjLyWqBtRsUeOaKiGhDfEbNpSvYxZwMqTrCuAl', 'TOADsol111111111111111111111111111111111111', 420690000, 0.0000042, 10, 69, 69, 'ended', 289, 289800, false, 'meme');
