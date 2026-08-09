-- ============================================================
-- CyberSecurity Fundamentals — Supabase schema
-- Run this in Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- ---------- extensions ----------
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES  (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  preferred_locale text not null default 'az' check (preferred_locale in ('az','en')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. SITE SETTINGS  (global switches, e.g. free -> paid transition)
-- ============================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values ('monetization_enabled', 'false'::jsonb)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Only admins can modify site settings"
  on public.site_settings for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ============================================================
-- 3. ROADMAP STRUCTURE  (sections -> topics)
-- Mirrors a TryHackMe "Pre Security"-style fundamentals path.
-- Video is OPTIONAL per topic — content is added gradually.
-- ============================================================
create table if not exists public.roadmap_sections (
  id uuid primary key default uuid_generate_v4(),
  order_index int not null,
  title_az text not null,
  title_en text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_topics (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.roadmap_sections(id) on delete cascade,
  order_index int not null,
  title_az text not null,
  title_en text not null,
  description_az text,
  description_en text,
  -- content status: text_only | has_video | coming_soon
  video_status text not null default 'coming_soon'
    check (video_status in ('text_only','has_video','coming_soon')),
  bunny_video_id text,           -- Bunny.net Stream video GUID (nullable)
  duration_minutes int,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  is_free_preview boolean not null default false, -- accessible without subscription
  created_at timestamptz not null default now()
);

create index if not exists idx_topics_section on public.roadmap_topics(section_id, order_index);

alter table public.roadmap_sections enable row level security;
alter table public.roadmap_topics enable row level security;

create policy "Anyone can read sections"
  on public.roadmap_sections for select using (true);

create policy "Anyone can read topics"
  on public.roadmap_topics for select using (true);

create policy "Only admins can write sections"
  on public.roadmap_sections for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Only admins can write topics"
  on public.roadmap_topics for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ============================================================
-- 4. USER PROGRESS  (which topics a user has completed)
-- ============================================================
create table if not exists public.user_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.roadmap_topics(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

alter table public.user_progress enable row level security;

create policy "Users manage own progress"
  on public.user_progress for all
  using (auth.uid() = user_id);


-- ============================================================
-- 5. SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'inactive'
    check (status in ('inactive','active','past_due','canceled')),
  payment_provider text check (payment_provider in ('payriff','stripe')),
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_subscriptions_user on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- writes only via service_role (webhooks) — no insert/update policy for normal users


-- ============================================================
-- 6. SERVICES  (audit / consulting packages)
-- ============================================================
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  order_index int not null default 0,
  name_az text not null,
  name_en text not null,
  description_az text,
  description_en text,
  price_from numeric,               -- null = "custom quote"
  currency text not null default 'AZN',
  features_az jsonb not null default '[]',
  features_en jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Anyone can read active services"
  on public.services for select using (is_active = true);

create policy "Only admins can write services"
  on public.services for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ============================================================
-- 7. SERVICE ORDERS  (audit/consulting requests)
-- ============================================================
create table if not exists public.service_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  message text,
  status text not null default 'new'
    check (status in ('new','contacted','in_progress','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.service_orders enable row level security;

create policy "Users can view own orders"
  on public.service_orders for select
  using (auth.uid() = user_id);

create policy "Anyone can create an order"
  on public.service_orders for insert
  with check (true);

create policy "Only admins can update orders"
  on public.service_orders for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));


-- ============================================================
-- 8. SEED DATA — Roadmap sections/topics (TryHackMe aligned)
-- ============================================================
do $$
declare
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
begin
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (1, 'Kibertəhlükəsizliyə Giriş', 'Introduction to Cyber Security') returning id into s1;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (2, 'Şəbəkə Fundamentləri', 'Network Fundamentals') returning id into s2;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (3, 'Veb Necə İşləyir', 'How The Web Works') returning id into s3;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (4, 'Linux Fundamentləri', 'Linux Fundamentals') returning id into s4;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (5, 'Windows Fundamentləri', 'Windows Fundamentals') returning id into s5;

  insert into public.roadmap_topics (section_id, order_index, title_az, title_en, video_status, is_free_preview) values
    (s1, 1, 'Hücum Təhlükəsizliyinə Giriş', 'Offensive Security Intro', 'coming_soon', true),
    (s1, 2, 'Müdafiə Təhlükəsizliyinə Giriş', 'Defensive Security Intro', 'coming_soon', true),
    (s1, 3, 'Kibertəhlükəsizlikdə Karyera', 'Careers in Cyber', 'coming_soon', false),

    (s2, 1, 'Networking Nədir?', 'What is Networking?', 'coming_soon', false),
    (s2, 2, 'LAN-a Giriş', 'Intro to LAN', 'coming_soon', false),
    (s2, 3, 'OSI Modeli', 'OSI Model', 'coming_soon', false),
    (s2, 4, 'Paketlər və Frame-lər', 'Packets & Frames', 'coming_soon', false),
    (s2, 5, 'Şəbəkəni Genişləndirmək', 'Extending Your Network', 'coming_soon', false),

    (s3, 1, 'DNS Ətraflı', 'DNS in Detail', 'coming_soon', false),
    (s3, 2, 'HTTP Ətraflı', 'HTTP in Detail', 'coming_soon', false),
    (s3, 3, 'Vebsaytlar Necə İşləyir', 'How Websites Work', 'coming_soon', false),
    (s3, 4, 'Hamısını Birləşdirmək', 'Putting it all together', 'coming_soon', false),

    (s4, 1, 'Linux Fundamentləri 1-ci Hissə', 'Linux Fundamentals Part 1', 'coming_soon', false),
    (s4, 2, 'Linux Fundamentləri 2-ci Hissə', 'Linux Fundamentals Part 2', 'coming_soon', false),
    (s4, 3, 'Linux Fundamentləri 3-cü Hissə', 'Linux Fundamentals Part 3', 'coming_soon', false),

    (s5, 1, 'Windows Fundamentləri 1', 'Windows Fundamentals 1', 'coming_soon', false),
    (s5, 2, 'Windows Fundamentləri 2', 'Windows Fundamentals 2', 'coming_soon', false),
    (s5, 3, 'Windows Fundamentləri 3', 'Windows Fundamentals 3', 'coming_soon', false);
end $$;

-- ============================================================
-- 9. SEED DATA — Services (audit / consulting)
-- ============================================================
insert into public.services (order_index, name_az, name_en, description_az, description_en, price_from, features_az, features_en) values
(1, 'Təhlükəsizlik Auditı', 'Security Audit',
   'Sisteminizin zəifliklərini üzə çıxaran hərtərəfli yoxlama.',
   'A comprehensive review that surfaces vulnerabilities in your systems.',
   500,
   '["İnfrastruktur skanlaması","Zəiflik hesabatı","Prioritetləşdirilmiş tövsiyələr"]',
   '["Infrastructure scanning","Vulnerability report","Prioritised recommendations"]'
),
(2, 'Sızma Testi (Pentest)', 'Penetration Testing',
   'Real hücum ssenariləri ilə sisteminizin dayanıqlılığını sınayırıq.',
   'We test your system''s resilience using real-world attack scenarios.',
   null,
   '["Manual + avtomatlaşdırılmış test","Exploitasiya sübutu (PoC)","Detallı texniki hesabat"]',
   '["Manual + automated testing","Proof-of-concept exploitation","Detailed technical report"]'
),
(3, 'Konsaltinq', 'Consulting',
   'Komandanız üçün fərdi kibertəhlükəsizlik məsləhəti və təlim.',
   'Tailored cyber security guidance and training for your team.',
   null,
   '["Komanda təlimi","Təhlükəsizlik siyasəti hazırlığı","Davamlı məsləhət dəstəyi"]',
   '["Team training","Security policy drafting","Ongoing advisory support"]'
);
