# CLAUDE.md — Whack-a-Mole Project Rules

## Project Overview

Whack-a-Mole browser game with React + TypeScript frontend, C# .NET 8 Web API backend, and PostgreSQL database. This project demonstrates AI-assisted development workflows.

## Architecture Rules (ENFORCED)

### Frontend

#### Rule 1: Pure Game Engine
- `src/engine/` MUST NOT import from React, ReactDOM, or any UI library.
- `GameEngine.ts` receives time via `tick(elapsed)` — it MUST NOT use `setTimeout`, `setInterval`, `requestAnimationFrame`, `Date.now()`, or any browser/Node timer API.
- All game state transitions MUST go through `GameEngine` methods. Components MUST NOT compute game logic directly.

#### Rule 2: Layer Separation
- `src/engine/` — Pure game logic. Zero dependencies on React or DOM.
- `src/hooks/` — React hooks only. Bridge between engine and components. No game logic here.
- `src/components/` — Presentational React components. No direct API calls. No game logic.
- `src/api/` — API client functions. No React imports. No game logic.

#### Rule 3: Type Safety
- No `any` type. No `@ts-ignore`. No `@ts-expect-error`.
- All component props MUST have explicit TypeScript interfaces.
- API responses MUST be typed — no untyped `fetch().then(r => r.json())`.

#### Rule 4: Testing
- Every function in `src/engine/` MUST have a corresponding test.
- Tests use deterministic inputs — no real timers, no randomness without seeding.
- Component tests use React Testing Library — test behavior, not implementation.

### Backend

#### Rule 5: Repository Pattern
- Controllers MUST NOT access `AppDbContext` directly.
- Controllers depend on `IScoreService`. Services depend on `IScoreRepository`.
- `IScoreRepository` has two implementations: `InMemoryScoreRepository` and `PostgresScoreRepository`.
- Switching storage MUST require only a DI registration change in `Program.cs`.

#### Rule 6: DTOs vs Entities
- Controllers MUST accept and return DTOs (`ScoreDto`), never EF entities (`Score`).
- Mapping between DTOs and entities happens in the Service layer.
- EF entity `Score` MUST NOT appear in controller method signatures.

#### Rule 7: Validation
- `playerName`: required, 1-30 characters, trimmed.
- `score`: required, integer, 0-99.
- Validation MUST happen in the Service layer, not in the Controller.
- Invalid requests return 400 with a descriptive error message.

#### Rule 8: Testing
- Integration tests use `WebApplicationFactory` with in-memory database.
- Tests MUST NOT depend on external PostgreSQL instance.
- Every endpoint MUST have happy-path and error-path tests.

### General

#### Rule 9: No Dead Code
- No commented-out code blocks.
- No unused imports.
- No TODO comments without a corresponding issue/ticket.

#### Rule 10: Documentation
- Every public class/function MUST have a doc comment (JSDoc for TS, XML doc for C#).
- README.md MUST be updated when adding new features or changing the API contract.
- Architecture decisions MUST be documented — explain WHY, not just WHAT.

## Build Commands

### Frontend
```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint
```

### Backend
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project WhackAMole.Api    # Start API
dotnet test                             # Run xUnit tests
```

### Database
```bash
docker compose up -d                    # Start PostgreSQL
cd backend
dotnet ef migrations add InitialCreate --project WhackAMole.Api
dotnet ef database update --project WhackAMole.Api
```

## File Naming Conventions

- Frontend components: `PascalCase.tsx` (e.g., `GameBoard.tsx`)
- Frontend logic/utils: `camelCase.ts` (e.g., `scoresApi.ts`)
- Frontend tests: `*.test.ts` or `*.test.tsx` (co-located)
- Backend: PascalCase for all C# files (standard .NET convention)
- Backend tests: `*Tests.cs` (e.g., `ScoresControllerTests.cs`)

## AI Workflow Demo Points

These are intentional architecture constraints designed to be demonstrable:

1. **Break Rule 1** → Import `useState` in `GameEngine.ts` → AI should flag this in review.
2. **Break Rule 6** → Return `Score` entity from controller → AI should flag this in review.
3. **Break Rule 3** → Use `any` type → AI should flag this in review.
4. **Skip tests** → Add a new engine method without tests → AI should flag missing coverage.
