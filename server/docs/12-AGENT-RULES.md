# 12 — Agent & Developer Operational Rules: SoulForge (Life RPG)

## 1. Absolute System Invariants

Any AI coding assistant or human developer modifying the SoulForge codebase must adhere strictly to these non-negotiable rules:

### Rule 1: The Backend is Authoritative
- **Never trust client-supplied game state**. The frontend requests actions; the backend calculates results; the database persists truth.
- Forbidden client inputs on completion or task creation: `xp`, `coins`, `level`, `attributeValues`, `rewardAmount`, `itemPrice`, `completedAt`, `userId`.
- If an endpoint accepts an update, only allow user-controllable fields (e.g., `title`, `description`, `dueDate`).

### Rule 2: AI is Advisory, Never Authoritative
- The LLM only classifies natural language into structured categories, difficulties, and priorities.
- The **Reward Engine** (`src/services/rpg/reward.service.ts`) computes numeric XP and Gold.
- Never write code where an LLM output string is directly saved as an XP reward without passing through the reward engine formula.

### Rule 3: Game Mutations Must Be Transactional
- Task completions, cosmetic purchases, streak recoveries, and campaign rewards **must execute inside `prisma.$transaction`**.
- If coins are deducted, inventory must be granted in the same transaction.
- If XP is granted, the task status must be marked completed in the same transaction.

### Rule 4: Mandatory Resource Ownership Verification
- Every protected operation must extract `userId` from `req.user.id` (set by `auth.middleware.ts`).
- Never query by resource ID alone. Always enforce compound queries:
  ```typescript
  // CORRECT
  const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.user.id } });

  // STRICTLY FORBIDDEN (Vulnerable to IDOR)
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  ```

### Rule 5: Historical Data Preservation
- Never delete or overwrite historical activity records (`ActivityLog`).
- If a task or project is deleted, set the foreign key to `null` via `onDelete: SetNull`. The historical XP and Gold gained remain part of the hero's permanent record.

### Rule 6: Layered Architecture Isolation
- **Routes (`src/routes/`)**: Mount endpoints and bind middleware only. Zero business logic.
- **Controllers (`src/controllers/`)**: Extract request params/body/query, call service methods, set HTTP status, return standard envelope. Never call Prisma directly.
- **Services (`src/services/`)**: Orchestrate business flows, permission checks, and database transactions.
- **Domain Engine (`src/services/rpg/`)**: Pure mathematical algorithms (XP curves, streak calculation, reward formulas).

### Rule 7: Zero-Tolerance Resilience (AI Fallback)
- Task creation must **never crash** if the LLM provider fails, times out, or lacks an API key.
- Always catch AI exceptions and route through `classifyTaskFallback()` in `src/services/ai/fallback.ts`.

---

## 2. Coding Standards & Conventions

### 2.1 TypeScript & Type Safety
- No `any` types. Use explicit types, Prisma-generated types, or Zod-inferred types (`z.infer<typeof Schema>`).
- Strict null checks must be respected.

### 2.2 Standard Response Envelopes
- Every HTTP response must follow the contract:
  - Success: `{ "success": true, "data": T }`
  - Failure: `{ "success": false, "error": { "code": string, "message": string, "details"?: any } }`

### 2.3 Error Handling
- Use the custom `AppError` class for expected operational errors:
  ```typescript
  throw new AppError('TASK_NOT_FOUND', 'Quest could not be found', 404);
  ```
- All unhandled exceptions must bubble to `error.middleware.ts`. Never leak database stack traces to the client in production.
