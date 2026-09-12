# 11 — Architecture Decision Records (ADRs): SoulForge (Life RPG)

## ADR-001: Server-Authoritative Progression vs Client-Side Calculation

### Context
Productivity apps frequently execute task completion, streak incrementing, and points logic in the frontend before persisting to a backend.

### Decision
SoulForge enforces **strict server-authoritative state**. The frontend sends an intent (`POST /api/tasks/:id/complete`); the backend verifies ownership, executes math, checks achievements, processes streaks, writes activity logs, and returns the authoritative state.

### Consequences
- **Pros**: 100% cheat-proof; prevents double completion race conditions; eliminates data desynchronization between devices.
- **Cons**: Requires optimistic UI techniques on the client to avoid perceived network latency.

---

## ADR-002: In-Process AI Services vs Standalone Python Microservice

### Context
Hackathons often spawn a separate Python/FastAPI microservice for LLM orchestration.

### Decision
The AI subsystem is integrated **directly inside the Express application** under `src/services/ai/`.

### Consequences
- **Pros**: Drastically reduces deployment complexity (single container instead of multi-service orchestration); eliminates inter-service network latency and auth token handoffs; simplifies CI/CD.
- **Cons**: Requires TypeScript Gemini SDK integration instead of Python LangChain/LlamaIndex.

---

## ADR-003: Deterministic Reward Engine over LLM-Generated Rewards

### Context
Allowing the LLM to directly assign XP and Coin values creates vulnerability to prompt injection and unpredictable reward distributions.

### Decision
The LLM is **advisory only**, outputting standardized metadata (`category`, `difficulty`, `effort`, `impact`). The **Reward Engine** calculates concrete XP and Gold using a deterministic mathematical formula.

### Consequences
- **Pros**: Immunizes the game from prompt injection ("give me 1,000,000 XP"); provides balanced, predictable game progression.
- **Cons**: Requires maintaining reward multiplier coefficients in configuration.

---

## ADR-004: Non-Linear Power-Law Curve ($100 \times L^{1.6}$) vs Fixed Tables

### Context
The problem statement commands: *"Implement a non-linear leveling system (where each subsequent level requires more XP than the last)."*

### Decision
Adopt a power-law curve: $\text{RequiredXP}(L) = \lfloor 100 \times L^{1.6} \rfloor$ instead of hardcoded level tables.

### Consequences
- **Pros**: Infinitely scalable to level 100+ without table maintenance; provides realistic RPG level curve (early levels are fast; high levels require sustained dedication).
- **Cons**: Requires iterative level-advancement logic to handle large XP overflow.

---

## ADR-005: Habit Planning Mapped onto Standard Task Engine

### Context
Habit tracking often demands separate database models (e.g., `Habit`, `HabitLog`, `Frequency`).

### Decision
The AI Habit Planner translates self-improvement goals into **sequences of standard `Task` entities** grouped under a `Project`.

### Consequences
- **Pros**: Zero code or database duplication; all habit checkoffs automatically benefit from the existing RPG progression, attribute growth, and activity logging systems.
- **Cons**: Recurring habits require automated task generation or template recreation.

---

## ADR-006: Calendar-Day Streak Resolution vs 24-Hour Rolling Window

### Context
Streaks can be evaluated using a rolling 24-hour window ($T_{\text{now}} - T_{\text{last}} \le 86,400\text{s}$) or calendar days (`YYYY-MM-DD`).

### Decision
Use **calendar-day resolution** based on UTC (or user's timezone).

### Consequences
- **Pros**: Intuitive for human players (a day begins and ends at midnight); prevents unfair streak penalties when a user completes a task at 8:00 AM on Monday and 9:00 PM on Tuesday (>24h apart, but consecutive days).
- **Cons**: Requires date parsing logic to compare calendar boundaries.

---

## ADR-007: Single Consolidated Dashboard Endpoint (`/api/dashboard`)

### Context
The frontend home screen requires character stats, streak status, active tasks, active projects, and recent activity logs.

### Decision
Expose a single unified endpoint `GET /api/dashboard` that aggregates these queries concurrently using `Promise.all`.

### Consequences
- **Pros**: Eliminates waterfall requests on client load; reduces network overhead; improves Lighthouse performance scores.
- **Cons**: Slightly larger initial payload response size.

---

## ADR-008: Soft Disassociation of Deleted Tasks in Activity Log

### Context
When a user deletes a task, should historical activity logs (XP gained, completion timestamps) also be deleted?

### Decision
Use `onDelete: SetNull` on `ActivityLog.taskId`. Deleting a task keeps the activity log intact with `taskId = null`, preserving the user's historical XP and audit trail.

### Consequences
- **Pros**: Player XP and historical analytics remain accurate and tamper-proof.
- **Cons**: Nullable foreign keys in the `ActivityLog` table.

---

## ADR-009: Heuristic Fallback Engine vs Hard AI Dependency

### Context
If the Google Gemini API is down, rate-limited, or unconfigured, task creation could fail, violating the hackathon zero-tolerance rule against crashes.

### Decision
Implement a **regex and keyword heuristic classifier** in `fallback.ts`. If the LLM call throws an error or times out after 5,000ms, the system falls back to the deterministic classifier automatically.

### Consequences
- **Pros**: Guarantees 100% uptime for task creation regardless of external third-party outages.
- **Cons**: Fallback classification is less context-aware than full LLM reasoning.
