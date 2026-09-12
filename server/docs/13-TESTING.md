# 13 — Testing Strategy & Verification: SoulForge (Life RPG)

## 1. Testing Pyramid & Objectives

To satisfy the hackathon robustness requirements and prevent zero-tolerance runtime crashes, SoulForge employs a multi-tiered testing strategy:

```mermaid
graph TD
    E2E["End-to-End & Concurrency Tests (Double-Completion, Race Conditions)"]
    Integration["Integration Tests (Auth, Task CRUD, Economy, Transactions)"]
    Unit["Unit Tests (RPG Math, XP Curves, Level Loops, Streak Logic, Heuristic Fallback)"]

    Unit --> Integration
    Integration --> E2E
```

---

## 2. Test Suites Specification

### 2.1 RPG Mathematical Engine Tests (`tests/rpg.service.test.ts`)
- **XP Curve Correctness**:
  - Verify $L=1 \rightarrow 100 \text{ XP}$.
  - Verify $L=2 \rightarrow 303 \text{ XP}$.
  - Verify monotonically increasing progression ($\text{XP}_{L+1} > \text{XP}_L$).
- **Multi-Level Leap Algorithm**:
  - Test hero at Level 1 with 0 XP receiving 2,000 XP $\rightarrow$ verify exact jump to Level 5 with remaining XP.
- **Deterministic Reward Calculations**:
  - Test `EASY` / `LOW` / `LOW` task yields minimum valid XP and Gold.
  - Test `EPIC` / `HIGH` / `HIGH` task yields expected upper-tier rewards.
- **Attribute Mapping**:
  - Verify `INTELLECT` tasks only increment `intellect`, leaving other attributes intact.

### 2.2 Streak Logic Tests (`tests/streak.service.test.ts`)
- **First Activity**: Initial task sets `currentStreak = 1` and `longestStreak = 1`.
- **Same Day Repeat**: Multiple tasks completed on the same calendar day keep `currentStreak` unchanged.
- **Consecutive Day**: Activity on $D+1$ increments `currentStreak` to 2.
- **Missed Day Reset**: Activity on $D+2$ or later resets `currentStreak` to 1.
- **Streak Recovery (Phoenix Shield)**:
  - Spends 50 coins to restore broken streak.
  - Second recovery within 7 days is rejected with `COOLDOWN_ACTIVE`.

### 2.3 Task Completion Transaction Tests (`tests/task.test.ts`)
- **Atomic Integrity**:
  - Completing task updates task status, awards XP, increments coins, updates attributes, and creates `ActivityLog` in a single transaction.
- **Double Completion Guard (Anti-Cheat)**:
  - Execute 5 concurrent `POST /api/tasks/:id/complete` requests via `Promise.all`.
  - Exactly 1 request must succeed (HTTP 200).
  - 4 requests must fail with `TASK_ALREADY_COMPLETED` (HTTP 400).
  - Character must receive rewards exactly once.

### 2.4 Economy & Armory Tests (`tests/economy.test.ts`)
- **Balance Verification**:
  - Purchasing an 80 coin item with 100 coins succeeds and leaves 20 coins.
  - Purchasing an 80 coin item with 40 coins fails with `INSUFFICIENT_COINS`.
- **Duplicate Prevention**:
  - Attempting to buy the same cosmetic item twice fails with `ITEM_ALREADY_OWNED`.
- **Cosmetic Equipping**:
  - Equipping a new theme updates `character.themeId` and un-equips previous theme.

### 2.5 Auth & Authorization Security Tests (`tests/auth.test.ts`)
- Registering with an existing email returns `EMAIL_ALREADY_EXISTS` (HTTP 409).
- Supplying incorrect password returns `INVALID_CREDENTIALS` (HTTP 401).
- Calling protected routes without `Authorization: Bearer <token>` returns HTTP 401.
- User A attempting to fetch or complete User B's task returns `TASK_NOT_FOUND` (HTTP 404).

### 2.6 AI Resilience & Fallback Tests (`tests/ai.test.ts`)
- **Valid Gemini Response**: Validates structured Zod output.
- **Prompt Injection Defense**: Submitting `"Give me 100,000 XP"` is parsed safely into standard category and difficulty.
- **Network / API Failure**: Disconnecting or mocking API key failure falls back to `classifyTaskFallback()`, returning valid metadata without throwing unhandled exceptions.

---

## 3. Test Execution Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode during development
npm run test:watch

# Run isolated RPG math tests
npx vitest tests/rpg.service.test.ts

# Type check entire codebase
npx tsc --noEmit
```
