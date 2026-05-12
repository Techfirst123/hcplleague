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

## Team Registration Google Sheet

Team registrations are saved locally in the browser immediately and can also be sent to Google Sheets through a Google Apps Script web app. Set this in `.env.local`:
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
