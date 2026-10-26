create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists post_votes_post_id_idx on public.post_votes(post_id);

alter table public.post_votes enable row level security;

drop policy if exists "Anyone can read post votes" on public.post_votes;
create policy "Anyone can read post votes"
  on public.post_votes for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can create their own post votes" on public.post_votes;
create policy "Users can create their own post votes"
  on public.post_votes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can change their own post votes" on public.post_votes;
create policy "Users can change their own post votes"
  on public.post_votes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own post votes" on public.post_votes;
create policy "Users can remove their own post votes"
  on public.post_votes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_created_at_idx on public.comments(post_id, created_at desc);

alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can create their own comments" on public.comments;
create policy "Users can create their own comments"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);