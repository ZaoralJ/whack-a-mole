# Whack-a-Mole

A browser-based Whack-a-Mole game with a persistent leaderboard, built to demonstrate AI-assisted development workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | C# / .NET 10 Web API |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 10 |
| Testing (FE) | Vitest + Playwright |
| Testing (BE) | xUnit + WebApplicationFactory |

## Quick Start

### Prerequisites

- Node.js 20+
- .NET 10 SDK
- Docker (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Start the Backend

```bash
cd backend
dotnet ef database update --project WhackAMole.Api
dotnet run --project WhackAMole.Api
```

API runs at `http://localhost:5255`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Game runs at `http://localhost:5173`

## Game Rules

- 3×3 grid of mole holes
- Moles pop up randomly, stay visible for ~1 second
- Click a visible mole to score a point
- Game lasts 30 seconds
- At most 2 moles visible simultaneously
- After game over, enter your name and submit to the leaderboard

## API Endpoints

### POST /api/scores

Submit a new score.

```json
{ "playerName": "Alice", "score": 15 }
```

Returns `201 Created` with the saved score entry.

### GET /api/scores?top=10

Get top scores, ordered descending. `top` is clamped to 1-50.

## Running Tests

### Backend (15 integration tests)

```bash
cd backend
dotnet test
```

### Frontend Unit Tests (20 tests)

```bash
cd frontend
npm run test
```

### Frontend E2E Tests (10 tests)

```bash
cd frontend
npx playwright test
```

## Architecture

```
frontend/src/
├── engine/          # Pure game logic (no React/DOM)
├── hooks/           # React hooks (bridge engine ↔ UI)
├── components/      # Presentational React components
└── api/             # API client (no React)

backend/WhackAMole.Api/
├── Controllers/     # HTTP endpoints (DTOs only)
├── Services/        # Business logic + validation
├── Repositories/    # Data access (EF Core)
├── Models/          # Entities + DTOs
└── Data/            # DbContext
```

### Key Design Decisions

1. **Pure GameEngine** — Zero React/DOM/timer dependencies. Time injected via `tick(deltaMs)`, RNG injectable for testing.
2. **Repository Pattern** — `IScoreRepository` with `PostgresScoreRepository` (production) and `InMemoryScoreRepository` (testing/fallback).
3. **DTOs separate from Entities** — Controllers never expose EF entities directly.
4. **Validation in Service layer** — Not in controllers, not in repositories.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5255` | Backend API base URL |
| `VITE_GAME_DURATION_MS` | `30000` | Game duration (used for test speedup) |
| `ConnectionStrings__DefaultConnection` | (see appsettings) | PostgreSQL connection string |
