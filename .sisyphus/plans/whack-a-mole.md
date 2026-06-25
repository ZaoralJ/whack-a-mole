# Whack-a-Mole — Architecture Plan

## Overview

A browser-based Whack-a-Mole game with a persistent leaderboard, built to demonstrate AI-assisted development workflows: architecture enforcement, documentation generation, integration testing, and UI testing.

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React 18 + TypeScript + Vite   |
| Backend     | C# / .NET 8 Web API            |
| Database    | PostgreSQL                     |
| ORM         | Entity Framework Core          |
| Testing (FE)| Vitest + React Testing Library + Playwright |
| Testing (BE)| xUnit + WebApplicationFactory  |

---

## Game Rules

- 3×3 grid of mole holes
- Moles appear randomly in holes, stay visible for ~1 second
- Tap/click a visible mole → score +1, mole disappears
- Game lasts 30 seconds
- At most 1-2 moles visible simultaneously
- On game over → enter player name → submit to leaderboard
- Leaderboard shows top 10 scores

---

## Architecture

### High-Level Diagram

```
┌─────────────────────────────────────┐
│  React App (TypeScript)             │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │ Game Engine  │  │ API Client   │  │
│  │ (pure logic) │  │ (fetch)      │  │
│  └──────┬──────┘  └──────┬───────┘  │
│         │                │          │
│  ┌──────▼──────────────▼────────┐  │
│  │       React Components        │  │
│  │  GameBoard, Mole, Scoreboard  │  │
│  │  Timer, GameOver, Leaderboard │  │
│  └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ HTTP (REST)
┌──────────────▼──────────────────────┐
│  .NET 8 Web API                     │
│                                     │
│  Controllers/                       │
│    └─ ScoresController              │
│                                     │
│  Services/                          │
│    └─ IScoreService → ScoreService  │
│                                     │
│  Repositories/                      │
│    └─ IScoreRepository              │
│       ├─ InMemoryScoreRepository    │
│       └─ PostgresScoreRepository    │
│                                     │
│  Models/                            │
│    └─ Score, ScoreDto               │
│                                     │
│  Data/                              │
│    └─ AppDbContext (EF Core)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  PostgreSQL                         │
│  Table: scores                      │
│    id (PK), player_name, score,     │
│    played_at (timestamp)            │
└─────────────────────────────────────┘
```

---

### Frontend Structure

```
frontend/
├── src/
│   ├── engine/                  # Pure game logic — NO React imports
│   │   ├── GameEngine.ts        # Core game loop, mole spawning, scoring
│   │   ├── types.ts             # MoleState, GameState, GameConfig
│   │   └── GameEngine.test.ts   # Unit tests for game logic
│   │
│   ├── hooks/                   # React hooks — bridge engine ↔ UI
│   │   ├── useGameEngine.ts     # Manages GameEngine lifecycle
│   │   └── useLeaderboard.ts    # Fetches/submits scores
│   │
│   ├── components/              # React components — UI only
│   │   ├── GameBoard.tsx        # 3×3 grid layout
│   │   ├── Mole.tsx             # Single mole hole (visible/hidden)
│   │   ├── Scoreboard.tsx       # Current score + timer display
│   │   ├── GameOver.tsx         # Name input + submit score
│   │   ├── Leaderboard.tsx      # Top 10 scores table
│   │   └── App.tsx              # Root: routes between game/leaderboard
│   │
│   ├── api/                     # API client — isolated fetch logic
│   │   └── scoresApi.ts         # submitScore(), getTopScores()
│   │
│   ├── main.tsx
│   └── index.css
│
├── e2e/                         # Playwright end-to-end tests
│   └── game.spec.ts
│
├── tsconfig.json
├── vite.config.ts
├── package.json
└── vitest.config.ts
```

### Backend Structure

```
backend/
├── WhackAMole.Api/
│   ├── Controllers/
│   │   └── ScoresController.cs      # [GET] /api/scores, [POST] /api/scores
│   │
│   ├── Services/
│   │   ├── IScoreService.cs
│   │   └── ScoreService.cs          # Validation, business rules
│   │
│   ├── Repositories/
│   │   ├── IScoreRepository.cs
│   │   ├── InMemoryScoreRepository.cs   # For dev/fallback
│   │   └── PostgresScoreRepository.cs   # EF Core implementation
│   │
│   ├── Models/
│   │   ├── Score.cs                 # Entity
│   │   └── ScoreDto.cs              # Request/Response DTOs
│   │
│   ├── Data/
│   │   └── AppDbContext.cs
│   │
│   ├── Program.cs
│   └── appsettings.json
│
├── WhackAMole.Api.Tests/
│   ├── ScoresControllerTests.cs     # Integration tests via WebApplicationFactory
│   ├── ScoreServiceTests.cs         # Unit tests
│   └── Helpers/
│       └── TestWebApplicationFactory.cs
│
├── WhackAMole.Api.sln
└── docker-compose.yml               # PostgreSQL for local dev
```

---

## API Contract

### POST /api/scores

Submit a new score.

**Request:**
```json
{
  "playerName": "Alice",
  "score": 15
}
```

**Validation:**
- `playerName`: required, 1-30 characters, alphanumeric + spaces
- `score`: required, integer, 0-99

**Response (201 Created):**
```json
{
  "id": 1,
  "playerName": "Alice",
  "score": 15,
  "playedAt": "2026-06-25T14:30:00Z"
}
```

**Errors:**
- `400` — Validation failure (empty name, score out of range)

### GET /api/scores?top=10

Get top scores.

**Query Parameters:**
- `top` (optional, default: 10, max: 50)

**Response (200 OK):**
```json
[
  { "id": 1, "playerName": "Alice", "score": 15, "playedAt": "2026-06-25T14:30:00Z" },
  { "id": 2, "playerName": "Bob", "score": 12, "playedAt": "2026-06-25T14:25:00Z" }
]
```

---

## Data Model

### PostgreSQL Table: `scores`

| Column      | Type                     | Constraints          |
|-------------|--------------------------|----------------------|
| id          | SERIAL                   | PRIMARY KEY          |
| player_name | VARCHAR(30)              | NOT NULL             |
| score       | INTEGER                  | NOT NULL, CHECK >= 0 |
| played_at   | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW |

---

## Game Engine Design (Pure Logic)

```typescript
// types.ts
interface GameConfig {
  gridSize: number;          // 3 (3×3)
  gameDurationMs: number;    // 30000
  moleVisibleMs: number;     // 1000
  maxVisibleMoles: number;   // 2
  spawnIntervalMs: number;   // 800
}

interface MoleState {
  id: number;        // 0-8 (grid position)
  isVisible: boolean;
  visibleSince: number;
}

interface GameState {
  moles: MoleState[];
  score: number;
  timeRemainingMs: number;
  status: 'idle' | 'playing' | 'gameOver';
}

// GameEngine.ts — pure functions, no side effects
class GameEngine {
  constructor(config: GameConfig);
  start(): GameState;
  tick(elapsed: number): GameState;   // Called every frame
  whack(moleId: number): GameState;   // Player taps a mole
  getState(): GameState;
}
```

**Key principle**: `GameEngine` has ZERO dependencies on React, DOM, or timers. It receives elapsed time via `tick()`. This makes it fully testable with deterministic inputs.

---

## Testing Strategy

### 1. Unit Tests (Vitest) — Game Engine

| Test Case | Assertion |
|-----------|-----------|
| `start()` sets status to 'playing' | `state.status === 'playing'` |
| `whack()` on visible mole increments score | `state.score === 1` |
| `whack()` on hidden mole does nothing | `state.score === 0` |
| Mole disappears after `moleVisibleMs` | After tick, `mole.isVisible === false` |
| Game ends after `gameDurationMs` | `state.status === 'gameOver'` |
| Max visible moles not exceeded | `visibleCount <= config.maxVisibleMoles` |

### 2. Integration Tests (xUnit) — Backend API

| Test Case | Setup | Assertion |
|-----------|-------|-----------|
| POST valid score → 201 | Send valid DTO | Response 201 + body matches |
| POST empty name → 400 | `{ playerName: "", score: 5 }` | Response 400 |
| POST negative score → 400 | `{ playerName: "A", score: -1 }` | Response 400 |
| GET top scores returns ordered | Seed 5 scores | Response ordered DESC by score |
| GET top=3 limits results | Seed 5 scores | Response has exactly 3 items |
| POST then GET round-trip | Submit, then fetch | Submitted score appears in list |

### 3. UI / E2E Tests (Playwright) — Browser

| Test Case | Steps | Assertion |
|-----------|-------|-----------|
| Game starts on button click | Click "Start Game" | Timer visible, moles start appearing |
| Clicking mole increases score | Wait for mole → click it | Score display increments |
| Game ends after 30 seconds | Start game → wait | Game over screen appears |
| Score submission works | Play → game over → enter name → submit | Leaderboard shows the score |
| Leaderboard displays scores | Navigate to leaderboard | Table with scores visible |

---

## Hackathon Time Budget (2 hours)

| Phase | Task | Time | AI Skill Demonstrated |
|-------|------|------|----------------------|
| 1 | Scaffold projects (Vite + .NET) | 10 min | AI generates boilerplate |
| 2 | Backend: Score model + EF + migration | 15 min | Architecture adherence |
| 3 | Backend: Controller + Service + Repository | 15 min | Architecture adherence |
| 4 | Backend: Integration tests | 10 min | AI writes tests |
| 5 | Frontend: GameEngine (pure logic) | 15 min | Architecture adherence |
| 6 | Frontend: GameEngine unit tests | 10 min | AI writes tests |
| 7 | Frontend: React components + hooks | 20 min | Architecture adherence |
| 8 | Frontend: Playwright E2E tests | 10 min | AI writes UI tests |
| 9 | Wire frontend → backend | 5 min | — |
| 10 | Generate documentation | 5 min | AI writes docs |
| 11 | Demo moment: break rule → AI catches | 5 min | Architecture enforcement |

### If Running Behind — Cut List (in order)

1. Drop Playwright E2E → keep unit + integration only
2. Drop PostgreSQL → use InMemoryScoreRepository
3. Drop name input → hardcode "Player"
4. Drop leaderboard screen → show POST works in console

---

## Demo Script

### Narrative: "AI as Your Engineering Team"

1. **"Here's our architecture"** — Show this plan. AI didn't just write code, it defined the architecture.

2. **"Watch AI build to spec"** — Live-build 2-3 features. Show AI following CLAUDE.md rules (pure engine, no React in logic, DTOs separate from entities).

3. **"Watch AI write tests"** — AI generates unit tests for GameEngine, integration tests for API, E2E tests for the browser. Run them live — all green.

4. **"Watch AI catch mistakes"** — Import React inside `GameEngine.ts` → AI review flags it. Return entity instead of DTO → AI catches it.

5. **"Watch AI document"** — AI generates/updates README, API docs, architecture diagrams after features land.

6. **Metrics**: "X features, Y tests, Z doc pages — 2 hours, AI-assisted."
