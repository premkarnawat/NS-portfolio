-- ============================================
-- SUPABASE SCHEMA FOR NIRBHAVA PORTFOLIO
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  name text not null default '',
  username text not null default '',
  bio text default '',
  location text default '',
  services text[] default '{}',
  profile_image text,
  resume_url text,
  impressions integer default 0,
  collaborations integer default 0,
  updated_at timestamptz default now()
);

-- Insert default profile
insert into profiles (name, username, bio, location, impressions, collaborations)
values (
  'Nirbhava Sawant',
  'nirbhava.design',
  '@nirbhava.design · UI/UX · Branding · Research. Designing clarity through simplicity. Creating accessible, human-centered digital experiences.',
  'Pune',
  50,
  10
);

-- ============================================
-- POSTS TABLE
-- ============================================
create table posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text default '',
  cover_image text,
  category text default '',
  project_link text,
  created_at timestamptz default now()
);

-- ============================================
-- HIGHLIGHTS TABLE
-- ============================================
create table highlights (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  cover_image text,
  link text,
  created_at timestamptz default now()
);

-- ============================================
-- EXPLORE LINKS TABLE
-- ============================================
create table explore_links (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  icon_image text,
  link text not null,
  created_at timestamptz default now()
);

-- Insert sample explore links
insert into explore_links (title, link) values
('LinkedIn', 'https://linkedin.com'),
('Behance', 'https://behance.net'),
('Figma', 'https://figma.com'),
('Instagram', 'https://instagram.com'),
('Art Instagram', 'https://instagram.com');

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table posts enable row level security;
alter table highlights enable row level security;
alter table explore_links enable row level security;
alter table messages enable row level security;

-- PUBLIC READ: profiles, posts, highlights, explore_links
create policy "Public can read profiles" on profiles for select using (true);
create policy "Public can read posts" on posts for select using (true);
create policy "Public can read highlights" on highlights for select using (true);
create policy "Public can read explore_links" on explore_links for select using (true);

-- PUBLIC INSERT: messages (contact form)
create policy "Public can insert messages" on messages for insert with check (true);

-- AUTHENTICATED FULL ACCESS (admin)
create policy "Auth users can manage profiles" on profiles for all using (auth.role() = 'authenticated');
create policy "Auth users can manage posts" on posts for all using (auth.role() = 'authenticated');
create policy "Auth users can manage highlights" on highlights for all using (auth.role() = 'authenticated');
create policy "Auth users can manage explore_links" on explore_links for all using (auth.role() = 'authenticated');
create policy "Auth users can manage messages" on messages for all using (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKETS
-- Create these in Supabase Dashboard > Storage
-- Or run the following:
-- ============================================

-- NOTE: Create these buckets in Supabase Dashboard > Storage > New Bucket
-- All as PUBLIC buckets:
-- 1. profile-images
-- 2. post-images
-- 3. highlight-images
-- 4. explore-icons
-- 5. resumes

-- Storage policies (run after creating buckets)
-- Allow public read on all buckets
insert into storage.buckets (id, name, public) values
  ('profile-images', 'profile-images', true),
  ('post-images', 'post-images', true),
  ('highlight-images', 'highlight-images', true),
  ('explore-icons', 'explore-icons', true),
  ('resumes', 'resumes', true)
on conflict do nothing;

create policy "Public read profile-images" on storage.objects for select using (bucket_id = 'profile-images');
create policy "Auth upload profile-images" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'profile-images');
create policy "Auth update profile-images" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'profile-images');

create policy "Public read post-images" on storage.objects for select using (bucket_id = 'post-images');
create policy "Auth upload post-images" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'post-images');
create policy "Auth update post-images" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'post-images');

create policy "Public read highlight-images" on storage.objects for select using (bucket_id = 'highlight-images');
create policy "Auth upload highlight-images" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'highlight-images');
create policy "Auth update highlight-images" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'highlight-images');

create policy "Public read explore-icons" on storage.objects for select using (bucket_id = 'explore-icons');
create policy "Auth upload explore-icons" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'explore-icons');
create policy "Auth update explore-icons" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'explore-icons');

create policy "Public read resumes" on storage.objects for select using (bucket_id = 'resumes');
create policy "Auth upload resumes" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'resumes');
create policy "Auth update resumes" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'resumes');
