# 🎓 Student Wrapped

> Spotify Wrapped, but for your student life.

A behavioral reflection platform where students log daily check-ins and receive a cinematic weekly recap — revealing patterns in sleep, stress, study, and energy.

---

## ✨ Features

- **Daily check-ins** — 5 sliders, under 45 seconds
- **Dashboard** — weekly averages, charts, heatmap, wellness score
- **Weekly Wrapped** — card-by-card animated recap (Spotify Wrapped style)
- **Insight engine** — rule-based behavioral pattern detection
- **Streak system** — gamified habit tracking
- **Google Auth** — via Supabase OAuth

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/student-wrapped.git
cd student-wrapped
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema below in the **SQL editor**
3. Enable **Google OAuth** in Authentication → Providers → Google

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase URL and anon key from **Project Settings → API**.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Supabase Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (auto-created on first login via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  streak_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Check-ins table
create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  sleep_hours numeric(3,1) not null check (sleep_hours >= 0 and sleep_hours <= 12),
  stress_level int not null check (stress_level >= 1 and stress_level <= 10),
  study_minutes int not null check (study_minutes >= 0 and study_minutes <= 720),
  academic_load int not null check (academic_load >= 0 and academic_load <= 10),
  energy_level int not null check (energy_level >= 1 and energy_level <= 10),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

-- Policies: users can only read/write their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own checkins"
  on public.checkins for select using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.checkins for insert with check (auth.uid() = user_id);

create policy "Users can update own checkins"
  on public.checkins for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Indexes for performance
create index checkins_user_date on public.checkins (user_id, date desc);
```

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (same as `.env.local`)
4. Set **Root Directory** to `/` and **Framework** to `Next.js`
5. Deploy!

Update your Supabase OAuth redirect URL to your Vercel domain:
`Authentication → URL Configuration → Redirect URLs → https://your-app.vercel.app/**`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login
│   ├── onboarding/page.tsx   # First-time onboarding
│   ├── checkin/page.tsx      # Daily check-in (slider flow)
│   ├── dashboard/page.tsx    # Stats, charts, heatmap
│   ├── wrapped/page.tsx      # Weekly Wrapped cards
│   └── api/
│       ├── checkin/route.ts  # GET/POST check-ins
│       └── wrapped/route.ts  # GET Wrapped insights
├── lib/
│   ├── supabase.ts           # Supabase client helpers
│   └── insights.ts           # Stats + insight generation engine
├── types/
│   └── index.ts              # TypeScript interfaces
└── app/globals.css           # Global styles + design system
```

---

## 🎨 Design System

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#070710` | Page background |
| `--bg-card` | `#0d0d1a` | Card background |
| `--violet` | `#7c3aed` | Primary accent |
| `--pink` | `#ec4899` | Secondary accent |
| `--cyan` | `#06b6d4` | Study/data accent |
| `--amber` | `#f59e0b` | Energy accent |
| `--emerald` | `#10b981` | Load/success accent |

Fonts: **Clash Display** (headings) · **Cabinet Grotesk** (body) · **JetBrains Mono** (data)

---

## 🧠 Insight Engine

The insight generation lives in `src/lib/insights.ts`. It uses rule-based logic to detect:

- Sleep consistency score (standard deviation based)
- Sleep → energy correlation
- Peak stress and study days
- Workload patterns
- Composite wellness score

To add AI-powered insights, swap `generateInsights()` with a call to the Anthropic API or OpenAI.

---

## 📊 Example Dummy Data

Set `USE_DUMMY_DATA=true` in `.env.local` to bypass Supabase and use generated data for development.

The `generateDummyCheckins()` function in `insights.ts` produces a realistic 7-day dataset.

---

Made with 🎓 for students who care about self-awareness.
