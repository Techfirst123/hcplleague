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
