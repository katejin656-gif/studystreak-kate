create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references topics(id) on delete cascade,
  score int not null,
  total int not null,
  is_ai_generated boolean default false,
  created_at timestamptz not null default now()
);

alter table quiz_results enable row level security;

create policy "Public read" on quiz_results for select using (true);
create policy "Public insert" on quiz_results for insert with check (true);
create policy "Public update" on quiz_results for update using (true);
create policy "Public delete" on quiz_results for delete using (true);
