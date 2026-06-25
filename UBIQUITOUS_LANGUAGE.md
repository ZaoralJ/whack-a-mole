# Ubiquitous Language — Whack-a-Mole

> Domain glossary generated from source code. Each term is grounded in code
> references. Definitions describe observed behavior; clauses marked
> `(inferred)` are plausible but not fully provable from code.

- **Source:** `https://github.com/ZaoralJ/whack-a-mole`
- **Generated:** 2026-06-25
- **Scope:** whole repo (frontend `src/engine/`, `src/hooks/`, `src/components/`, `src/api/`; backend `WhackAMole.Api/`)
- **Bounded contexts covered:** Game Engine, Leaderboard

## How to read this

- **Definition** — what the concept means, based on code.
- **Code references** — where the term is defined and used (`file:line`).
- **Synonyms / aliases** — other names for the same concept in the codebase.
- **Related terms** — linked domain concepts (contains, references, state-of).
- `(inferred)` — interpretation not fully provable from code; confirm with a
  domain expert.

---

## Game Engine

The pure game logic governing mole spawning, player interaction, scoring, and
time management. Runs entirely in the browser with no server dependency.

### Game Config

**Definition.** The configuration object controlling all game parameters: grid
size, game duration, mole visibility time, maximum simultaneous visible moles,
and spawn interval. Configurable via environment variable
`VITE_GAME_DURATION_MS` for test speedup; otherwise defaults to 30-second games
on a 5×5 grid.

**Code references.**
- `frontend/src/engine/types.ts:1` — `GameConfig` interface definition
- `frontend/src/engine/types.ts:24` — `DEFAULT_CONFIG` with production defaults
- `frontend/src/engine/GameEngine.ts:10` — constructor accepts `GameConfig`

**Synonyms / aliases.** `DEFAULT_CONFIG`, "config".

**Related terms.** Consumed by [Game Engine](#game-engine-1); controls
[Mole](#mole) spawning and [Game Duration](#game-duration).

### Game Duration

**Definition.** The total time a game lasts, in milliseconds. Defaults to
30,000ms (30 seconds). Configurable via `VITE_GAME_DURATION_MS` environment
variable. When time remaining reaches zero, the game transitions to
[Game Over](#game-status).

**Code references.**
- `frontend/src/engine/types.ts:26` — `gameDurationMs` in `DEFAULT_CONFIG`
- `frontend/src/engine/GameEngine.ts:30` — time decremented in `tick()`
- `frontend/src/engine/GameEngine.ts:32` — game over triggered at zero

**Synonyms / aliases.** `gameDurationMs`, "time remaining".

**Related terms.** Part of [Game Config](#game-config); drives
[Game Status](#game-status) transition.

### Game Engine (class)

**Definition.** The core class implementing all game logic. Exposes four
methods: `start()` to begin a new game, `tick(deltaMs)` to advance time,
`whack(moleId)` to register a player hit, and `getState()` to retrieve an
immutable snapshot. Has zero dependencies on React, DOM, or timers — time is
injected via `tick()` and randomness via a constructor-injected RNG function.

**Code references.**
- `frontend/src/engine/GameEngine.ts:6` — class definition
- `frontend/src/engine/GameEngine.ts:15` — `start()` method
- `frontend/src/engine/GameEngine.ts:23` — `tick(deltaMs)` method
- `frontend/src/engine/GameEngine.ts:38` — `whack(moleId)` method
- `frontend/src/engine/GameEngine.ts:48` — `getState()` returns immutable copy

**Synonyms / aliases.** "engine", `engineRef`.

**Related terms.** Manages [Mole](#mole)s, [Score](#score),
[Game Status](#game-status); bridged to React by [useGameEngine](#usegameengine).

### Game State

**Definition.** The complete snapshot of the game at any point in time:
the array of [Mole](#mole) states, current [Score](#score), time remaining in
milliseconds, and [Game Status](#game-status). Returned as an immutable copy
by `getState()` — external mutations do not affect the engine.

**Code references.**
- `frontend/src/engine/types.ts:17` — `GameState` interface
- `frontend/src/engine/GameEngine.ts:48` — `getState()` deep-copies state

**Synonyms / aliases.** `gameState`, "state".

**Related terms.** Contains [Mole](#mole) array, [Score](#score),
[Game Status](#game-status).

### Game Status

**Definition.** The lifecycle state of the game. One of three values: `idle`
(before first start or after restart), `playing` (active gameplay with timer
running), or `gameOver` (time expired). Determines which UI screen is rendered
and whether `tick()` and `whack()` have any effect.

**Code references.**
- `frontend/src/engine/types.ts:15` — `GameStatus` type: `'idle' | 'playing' | 'gameOver'`
- `frontend/src/engine/GameEngine.ts:16` — `start()` sets `'playing'`
- `frontend/src/engine/GameEngine.ts:32` — `tick()` sets `'gameOver'` at zero time
- `frontend/src/App.tsx:29` — UI routing based on status

**Synonyms / aliases.** "phase", "status", `status`.

**Related terms.** Part of [Game State](#game-state); gates
[Whack](#whack) and [Tick](#tick).

### Mole

**Definition.** A single position in the game grid that can be visible (popped
up) or hidden. Each mole has an `id` (0–8, matching its grid position), an
`isVisible` flag, and a `visibleSince` timestamp tracking when it appeared.
Moles are spawned by the engine at random intervals and expire after
`moleVisibleMs`. A visible mole can be [whacked](#whack) for a point.

**Code references.**
- `frontend/src/engine/types.ts:9` — `MoleState` interface
- `frontend/src/engine/GameEngine.ts:62` — moles initialized as hidden
- `frontend/src/engine/GameEngine.ts:76` — `expireVisibleMoles` hides expired moles
- `frontend/src/engine/GameEngine.ts:84` — `trySpawnMole` makes a random mole visible
- `frontend/src/components/Mole.tsx:6` — `Mole` component renders a single hole

**Synonyms / aliases.** "mole hole", `.mole-hole` (CSS class).

**Related terms.** Part of [Game State](#game-state); rendered by
[Game Board](#game-board); target of [Whack](#whack).

### Score

**Definition.** The player's accumulated points during a single game. Starts at
zero on `start()`, increments by 1 each time the player successfully
[whacks](#whack) a visible [Mole](#mole). Displayed in the
[Scoreboard](#scoreboard) during play and on the [Game Over](#game-over-screen)
screen. Submitted to the [Leaderboard](#leaderboard) backend after the game
ends.

**Code references.**
- `frontend/src/engine/types.ts:19` — `score` field in `GameState`
- `frontend/src/engine/GameEngine.ts:42` — `score += 1` on successful whack
- `frontend/src/components/Scoreboard.tsx:8` — displays current score
- `frontend/src/App.tsx:13` — `gameState.score` passed to submit

**Synonyms / aliases.** "points", `score`.

**Related terms.** Incremented by [Whack](#whack); displayed by
[Scoreboard](#scoreboard); submitted to [Leaderboard](#leaderboard).

### Spawn Interval

**Definition.** The minimum time between mole appearances, in milliseconds
(default 600ms). The engine accumulates elapsed time and attempts to spawn a new
mole only when the interval is reached and the [max visible moles](#max-visible-moles)
cap is not exceeded.

**Code references.**
- `frontend/src/engine/types.ts:28` — `spawnIntervalMs: 800` in `DEFAULT_CONFIG`
- `frontend/src/engine/GameEngine.ts:82` — interval check in `trySpawnMole`
- `frontend/src/engine/GameEngine.ts:81` — `elapsedSinceLastSpawn` accumulator reset

**Synonyms / aliases.** `spawnIntervalMs`, "spawn cooldown".

**Related terms.** Controls [Mole](#mole) appearance rate; part of
[Game Config](#game-config).

### Max Visible Moles

**Definition.** The maximum number of moles that can be visible simultaneously
(default 3). When this cap is reached, no new moles spawn until one expires or
is whacked.

**Code references.**
- `frontend/src/engine/types.ts:27` — `maxVisibleMoles: 2` in `DEFAULT_CONFIG`
- `frontend/src/engine/GameEngine.ts:87` — cap check in `trySpawnMole`

**Synonyms / aliases.** `maxVisibleMoles`.

**Related terms.** Constrains [Mole](#mole) spawning; part of
[Game Config](#game-config).

### Tick

**Definition.** A single frame advance of the game clock. The `tick(deltaMs)`
method decreases time remaining, expires old moles, and attempts to spawn new
ones. Called by `requestAnimationFrame` in the React bridge at ~60fps. Has no
effect when game status is not `playing`.

**Code references.**
- `frontend/src/engine/GameEngine.ts:23` — `tick(deltaMs)` method
- `frontend/src/hooks/useGameEngine.ts:13` — rAF loop calling `tick`

**Synonyms / aliases.** "frame", "game loop iteration".

**Related terms.** Drives [Mole](#mole) lifecycle; decrements
[Game Duration](#game-duration).

### Whack

**Definition.** The player action of clicking/tapping a visible mole. If the
targeted mole is visible, it is hidden and [Score](#score) increments by 1. If
the mole is already hidden or the game is not `playing`, the action is a no-op.

**Code references.**
- `frontend/src/engine/GameEngine.ts:38` — `whack(moleId)` method
- `frontend/src/hooks/useGameEngine.ts:32` — `whackMole` callback
- `frontend/src/components/Mole.tsx:8` — `onClick={onWhack}` handler

**Synonyms / aliases.** "hit", "click", `onWhack`.

**Related terms.** Targets a [Mole](#mole); increments [Score](#score).

---

## Leaderboard

The persistent scoring system: accepts player scores via a REST API, stores them
in PostgreSQL, and returns ranked results.

### Leaderboard

**Definition.** The ranked list of top player scores, fetched from the backend
API. Displays player name, score, and rank. Shown on the start screen and after
game over. Refreshes when the game transitions to `gameOver` and after a
successful score submission.

**Code references.**
- `frontend/src/components/Leaderboard.tsx:12` — `Leaderboard` component
- `frontend/src/hooks/useLeaderboard.ts:11` — `fetchScores` fetches top 10
- `frontend/src/App.tsx:15` — refetches on `playing → gameOver` transition
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:34` — `GET /api/scores`

**Synonyms / aliases.** "top scores", "high scores".

**Related terms.** Displays [Score Entry](#score-entry); populated via
[Submit Score](#submit-score).

### Player Name

**Definition.** The name a player enters after a game to associate with their
score. Validated server-side: required, trimmed, 1–30 characters. Stored in the
`player_name` column.

**Code references.**
- `frontend/src/components/GameOver.tsx:22` — name input field (maxLength 30)
- `backend/WhackAMole.Api/Services/ScoreService.cs:17` — trim + validation
- `backend/WhackAMole.Api/Models/ScoreDto.cs:3` — `PlayerName` in `SubmitScoreRequest`
- `backend/WhackAMole.Api/Data/AppDbContext.cs:19` — `HasMaxLength(30)`

**Synonyms / aliases.** `playerName`, `player_name` (DB column).

**Related terms.** Part of [Score Entry](#score-entry); validated by
[Score Service](#score-service).

### Score Entry

**Definition.** A persisted game result in the database. Contains an
auto-generated `id`, `playerName`, `score` (0–99), and `playedAt` timestamp
(server-assigned, UTC). Mapped to the PostgreSQL `scores` table with snake_case
columns.

**Code references.**
- `backend/WhackAMole.Api/Models/Score.cs:3` — `ScoreEntry` entity class
- `backend/WhackAMole.Api/Data/AppDbContext.cs:14` — Fluent API mapping to `scores` table
- `backend/WhackAMole.Api/Migrations/20260625083509_InitialCreate.cs` — table creation

**Synonyms / aliases.** `ScoreEntry` (entity), "score" (in API responses).

**Related terms.** Created by [Score Service](#score-service); stored via
[Score Repository](#score-repository); returned as [Score Response](#score-response).

### Score Response

**Definition.** The DTO returned by the API for a score entry. Contains `id`,
`playerName`, `score`, and `playedAt`. Controllers only expose this type — never
the `ScoreEntry` entity directly (architecture Rule 6).

**Code references.**
- `backend/WhackAMole.Api/Models/ScoreDto.cs:5` — `ScoreResponse` record
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:22` — returned from POST
- `frontend/src/api/scoresApi.ts:4` — `ScoreResponse` interface (frontend mirror)

**Synonyms / aliases.** `ScoreResponse`, "score DTO".

**Related terms.** Maps from [Score Entry](#score-entry); consumed by
[Leaderboard](#leaderboard).

### Score Repository

**Definition.** The data access abstraction for score persistence. Defined by
`IScoreRepository` with two implementations: `PostgresScoreRepository` (EF Core,
production) and `InMemoryScoreRepository` (testing/fallback). Swappable via a
single DI registration change.

**Code references.**
- `backend/WhackAMole.Api/Repositories/IScoreRepository.cs:5` — interface
- `backend/WhackAMole.Api/Repositories/PostgresScoreRepository.cs:8` — EF Core impl
- `backend/WhackAMole.Api/Repositories/InMemoryScoreRepository.cs:5` — in-memory impl
- `backend/WhackAMole.Api/Program.cs:14` — DI registration

**Synonyms / aliases.** `IScoreRepository`, "repository".

**Related terms.** Persists [Score Entry](#score-entry); used by
[Score Service](#score-service).

### Score Service

**Definition.** The business logic layer for score operations. Validates input
(name length, score range), maps between DTOs and entities, assigns
server-authoritative timestamps, and delegates persistence to the
[Score Repository](#score-repository). Validation throws `ArgumentException`
on failure.

**Code references.**
- `backend/WhackAMole.Api/Services/IScoreService.cs:5` — interface
- `backend/WhackAMole.Api/Services/ScoreService.cs:6` — implementation
- `backend/WhackAMole.Api/Services/ScoreService.cs:17` — name validation (trim, 1–30)
- `backend/WhackAMole.Api/Services/ScoreService.cs:23` — score validation (0–99)
- `backend/WhackAMole.Api/Services/ScoreService.cs:35` — `Math.Clamp(count, 1, 50)` for top

**Synonyms / aliases.** `IScoreService`, `ScoreService`.

**Related terms.** Validates [Player Name](#player-name) and [Score](#score);
uses [Score Repository](#score-repository); called by
[Scores Controller](#scores-controller).

### Scores Controller

**Definition.** The HTTP API surface for the leaderboard. Exposes two endpoints:
`POST /api/scores` (submit a score, returns 201 or 400) and
`GET /api/scores?top=N` (retrieve top N scores, default 10, clamped 1–50).
Accepts and returns only DTOs — never EF entities (Rule 6).

**Code references.**
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:9` — controller class
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:19` — `POST` endpoint
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:34` — `GET` endpoint

**Synonyms / aliases.** "API", "scores endpoint".

**Related terms.** Delegates to [Score Service](#score-service); returns
[Score Response](#score-response).

### Submit Score

**Definition.** The action of sending a player's name and score to the backend
after a game ends. Triggered by the player filling in their name and clicking
"Submit Score" on the [Game Over](#game-over-screen) screen. The frontend
`submitScore()` function POSTs to `/api/scores`.

**Code references.**
- `frontend/src/api/scoresApi.ts:16` — `submitScore()` function
- `frontend/src/hooks/useLeaderboard.ts:24` — `submitPlayerScore` hook method
- `frontend/src/components/GameOver.tsx:14` — form submit handler
- `backend/WhackAMole.Api/Controllers/ScoresController.cs:19` — receives the POST

**Synonyms / aliases.** "post score", `submitPlayerScore`, `SubmitScoreRequest`.

**Related terms.** Creates a [Score Entry](#score-entry); refreshes
[Leaderboard](#leaderboard).

---

## UI Components

Presentational React components — no game logic, no direct API calls.

### Game Board

**Definition.** The 5×5 CSS grid container that renders 25 [Mole](#mole)
components. Receives the moles array and an `onWhack` callback from the parent.

**Code references.**
- `frontend/src/components/GameBoard.tsx:10` — `GameBoard` component
- `frontend/src/App.tsx:32` — rendered during `playing` status

**Synonyms / aliases.** `.game-board` (CSS class).

**Related terms.** Contains [Mole](#mole) components; rendered during `playing`
[Game Status](#game-status).

### Game Over Screen

**Definition.** The UI shown when the game ends. Displays the final score, a
name input field, a "Submit Score" button (disabled until name entered), and a
"Play Again" button.

**Code references.**
- `frontend/src/components/GameOver.tsx:11` — `GameOver` component
- `frontend/src/App.tsx:37` — rendered during `gameOver` status

**Synonyms / aliases.** "game over", `GameOver`.

**Related terms.** Triggers [Submit Score](#submit-score); offers restart via
`startGame`.

### Scoreboard

**Definition.** The HUD displayed during gameplay showing the current
[Score](#score) and a countdown timer (seconds remaining, rounded up).

**Code references.**
- `frontend/src/components/Scoreboard.tsx:7` — `Scoreboard` component
- `frontend/src/App.tsx:31` — rendered during `playing` status

**Synonyms / aliases.** `.scoreboard` (CSS class).

**Related terms.** Displays [Score](#score) and [Game Duration](#game-duration)
countdown.

### useGameEngine

**Definition.** The React hook that bridges the pure [Game Engine](#game-engine-1)
to React's render cycle. Manages the `requestAnimationFrame` loop, exposes
`startGame`, `whackMole`, and the current `gameState`. Defensively cancels rAF
on restart and cleanup.

**Code references.**
- `frontend/src/hooks/useGameEngine.ts:6` — hook definition
- `frontend/src/hooks/useGameEngine.ts:12` — rAF game loop
- `frontend/src/hooks/useGameEngine.ts:25` — `startGame` with defensive cancel

**Synonyms / aliases.** "game hook", `useGameEngine`.

**Related terms.** Wraps [Game Engine](#game-engine-1); consumed by `App.tsx`.

---

## Open questions / ambiguities

None — all terms are grounded in code.
