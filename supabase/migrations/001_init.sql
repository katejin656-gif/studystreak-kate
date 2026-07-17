create table topics (
  id text primary key,
  name text not null,
  icon text not null default '📚',
  color text not null default '#7c5cfc',
  difficulty text not null default 'Medium',
  progress int not null default 0,
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references topics(id) on delete cascade,
  position int not null default 0,
  question_text text not null,
  options jsonb not null default '["A","B","C","D"]',
  answer int not null default 0,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

alter table topics enable row level security;
alter table questions enable row level security;

create policy "Public read" on topics for select using (true);
create policy "Public insert" on topics for insert with check (true);
create policy "Public update" on topics for update using (true);
create policy "Public delete" on topics for delete using (true);

create policy "Public read" on questions for select using (true);
create policy "Public insert" on questions for insert with check (true);
create policy "Public update" on questions for update using (true);
create policy "Public delete" on questions for delete using (true);
