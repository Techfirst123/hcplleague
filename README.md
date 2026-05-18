# Hcplleague

A React website built with Vite.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Live Match API

Create `.env.local` from `.env.example` and set your live match endpoint:
```bash
VITE_LIVE_MATCH_API_URL=https://your-live-match-api.example.com/match/current
VITE_LIVE_MATCH_POLL_MS=30000
```

The home page expects JSON like this:
```json
{
  "title": "HCPL Final",
  "status": "Live",
  "streamUrl": "https://example.com/live-match.mp4",
  "venue": "Hazaribag Stadium",
  "battingTeam": "Team Alpha",
  "bowlingTeam": "Team Beta",
  "score": "150/5",
  "overs": "17.4",
  "target": "146"
}
```

## Supabase Team Registration

The registration form now saves teams into Supabase, the admin panel reads all team records from Supabase after login, and the public team sections only show records whose `status` is `Verified`.

Set this in `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_TEAMS_TABLE=teams
VITE_SUPABASE_GALLERY_TABLE=gallery_media
VITE_SUPABASE_SPONSORS_TABLE=sponsor_media
VITE_SUPABASE_LIVE_MATCH_TABLE=live_match
VITE_SUPABASE_SPONSOR_CARDS_TABLE=sponsor_cards
VITE_SUPABASE_FIXTURES_TABLE=match_fixtures
VITE_SUPABASE_POINTS_TABLE=points_table
VITE_SUPABASE_PLAYER_STATS_TABLE=player_stats
VITE_SUPABASE_GALLERY_BUCKET=gallery-media
VITE_SUPABASE_SPONSORS_BUCKET=sponsor-media
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=hcpladmin123
```

Expected Supabase table:
```sql
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  status text not null default 'Pending management verification',
  team_name text not null,
  captain_name text not null,
  captain_number text not null,
  vice_captain_name text not null,
  vice_captain_number text not null,
  sponsor_paid boolean not null default false,
  team_logo_name text,
  players jsonb not null default '[]'::jsonb
);
```

## Supabase Gallery, Sponsors, and Live Match

The admin panel can store gallery images/videos, sponsor promotion images, and the current live match scoreboard in Supabase. Create these tables:

```sql
create table public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  media_type text not null check (media_type in ('image', 'video')),
  src text not null,
  title text,
  alt text,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.sponsor_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  media_type text not null default 'image' check (media_type = 'image'),
  src text not null,
  title text,
  alt text,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.live_match (
  id text primary key default 'current',
  updated_at timestamptz not null default now(),
  title text not null,
  status text not null,
  stream_url text not null,
  venue text not null,
  batting_team text not null,
  bowling_team text not null,
  score text not null,
  overs text not null,
  target text not null
);

create table public.sponsor_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  value text not null,
  meta text,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.match_fixtures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  match_date text not null,
  match_title text not null,
  venue text not null,
  status text not null default 'Scheduled',
  is_active boolean not null default true
);

create table public.points_table (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_name text not null,
  played integer not null default 0,
  won integer not null default 0,
  lost integer not null default 0,
  net_run_rate numeric not null default 0,
  points integer not null default 0,
  is_active boolean not null default true
);

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  value text not null,
  meta text,
  display_order integer not null default 0,
  is_active boolean not null default true
);
```

Create public storage buckets named `gallery-media` and `sponsor-media`. The app uploads gallery image/video files to `gallery-media`, sponsor images to `sponsor-media`, then saves the public URLs into the tables above.

Example seed rows:

```sql
insert into public.live_match (
  id, title, status, stream_url, venue, batting_team, bowling_team, score, overs, target
) values (
  'current', 'HCPL Live Match', 'Live', 'https://www.youtube.com/watch?v=BNkIgRYDnBo', 'Hazaribag Stadium', 'Team A', 'Team B', '0/0', '0.0', '-'
) on conflict (id) do update set
  title = excluded.title,
  status = excluded.status,
  stream_url = excluded.stream_url,
  venue = excluded.venue,
  batting_team = excluded.batting_team,
  bowling_team = excluded.bowling_team,
  score = excluded.score,
  overs = excluded.overs,
  target = excluded.target;
```

For the current client-side admin flow, your Supabase policies must allow the configured anon key to select/insert/delete gallery and sponsor rows, select/upsert the `live_match` row, select sponsor cards, fixtures, points, and player stats, and upload/select objects from those two public buckets. For production, move these privileged writes behind Supabase Auth or a secure backend.

If you want public users to see only verified teams, your row-level security policies should allow:
1. `select` for rows where `status = 'Verified'`
2. `insert` for new registrations
3. admin update/delete only through whatever secure flow you decide to use next

## Optional Google Sheets Sync

Supabase is now the main source of truth. You can still mirror each registration to Google Sheets through a Google Apps Script web app. Set this in `.env.local` if you want the extra sync:
```bash
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_TEAM_REGISTRATION_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

`NEXT_PUBLIC_APPS_SCRIPT_URL` is the preferred deployment variable. `VITE_TEAM_REGISTRATION_WEBHOOK_URL` is kept as a fallback.

Connect the Apps Script to this spreadsheet:
```text
https://docs.google.com/spreadsheets/d/1tBXBpebHrXQ65XV5QUstK_KOlpxsEsbnXMxglEFGobA/edit?usp=sharing
```

Example Apps Script:
```javascript
const SHEET_ID = '1tBXBpebHrXQ65XV5QUstK_KOlpxsEsbnXMxglEFGobA'

function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]

  sheet.appendRow([
    data.submittedAt,
    data.status,
    data.teamName,
    data.captainName,
    data.captainNumber,
    data.viceCaptainName,
    data.viceCaptainNumber,
    JSON.stringify(data.players),
  ])

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
}
```

## Admin Panel

The current admin login is still client-side env-based, but after login it now fetches all team records from Supabase so management can review, edit, verify, and delete registrations from one place.

This is still a temporary admin auth model. For production, move admin authentication and privileged database writes behind a secure backend or Supabase Auth plus restricted RLS policies.

## Build

To build the project:
```bash
npm run build
```

## Lint

To run the linter:
```bash
npm run lint
```
