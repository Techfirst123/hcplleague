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
