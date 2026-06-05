create table if not exists dashboard_layout (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  card_id text not null,
  card_name text,
  size text default 'M',
  visible boolean default true,
  position integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, card_id)
);
