# 03 — Technology Stack & Tooling: SoulForge (Life RPG)

## 1. Overview & Technology Selection Matrix

The technology choices for SoulForge balance **developer velocity**, **type safety**, **relational data integrity**, and **hackathon zero-tolerance compliance**.

| Domain | Selected Technology | Alternative Considered | Rationale for Selection |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | **Node.js (v20+ LTS / v24)** | Python, Go | Unified TypeScript across full stack; rich ecosystem for AI SDKs and real-time gaming loops. |
| **Backend Framework** | **Express.js + TypeScript** | NestJS, FastAPI | Express provides lightweight, unopinionated control without NestJS abstraction overhead or multi-service FastAPI complexity. |
| **Database** | **PostgreSQL 16** | MongoDB, SQLite | Relational schema is mandatory for ACID transactions (financial ledger, inventory constraints, foreign keys). MongoDB lacks native join enforcement. |
| **ORM / Query Builder** | **Prisma ORM** | TypeORM, Drizzle | Automatic TypeScript type generation from schema, declarative migrations, and intuitive `$transaction` API. |
| **Authentication** | **Custom JWT + bcryptjs** | NextAuth, Clerk | Full control over token payload (`userId`), cross-origin flexibility, zero third-party vendor lock-in or quota limits. |
| **Validation** | **Zod** | Joi, Yup | Static TypeScript type inference (`z.infer<typeof Schema>`) matches validation schemas directly to service parameters. |
| **AI LLM Integration** | **Google Gemini SDK (`@google/genai`)** | OpenAI, Claude | Generous free tier for hackathon demos, rapid structured JSON output, native multi-modal readiness. |
| **Frontend Framework** | **React 18+ / Vite** | Next.js, Svelte | Client-side SPA enables instantaneous optimistic state transitions and 60fps game animations without SSR rehydration latency. |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Material UI, Bootstrap | Custom dark fantasy design system without generic enterprise component styling. |
| **Animation & Audio** | **Framer Motion + Canvas Confetti + Howler.js** | Pure CSS | Game-feel micro-interactions: spring physics, celebration particle bursts, and tactile audio feedback. |
| **Testing Engine** | **Vitest + Supertest** | Jest | Instant Vite-powered ESM execution, native TypeScript support, and zero-config HTTP route mocking. |

---

## 2. Detailed Component Specifications

### 2.1 Backend Server (Express + TypeScript)
- **TypeScript 5.x**: Strict mode enabled (`strict: true`, `noImplicitAny: true`).
- **Express 4.x / 5.x**:
  - `cors`: Configured with explicit `origin: process.env.FRONTEND_URL` and `credentials: true`.
  - `helmet`: Secure HTTP headers (CSP, XSS filter, frameguard).
  - `express-rate-limit`: Per-IP throttling for brute-force and AI abuse prevention.
  - `dotenv`: Secure environment loading.

### 2.2 Database & Persistence Layer (PostgreSQL + Prisma)
- **PostgreSQL 16**: Relational storage engine with native support for `ENUM`, `JSONB`, and compound indexes.
- **Prisma Schema (`schema.prisma`)**:
  - Declarative data modeling with strict 1:1, 1:N, and N:M relationships.
  - Generates type-safe database client (`@prisma/client`).
  - Migration engine tracks versioned schema updates (`prisma migrate dev`).
  - Seed pipeline automates shop items and achievement initialization (`prisma/seed.ts`).

### 2.3 Artificial Intelligence Layer
- **Google Gemini API**:
  - Model: `gemini-1.5-flash` or `gemini-2.0-flash` for ultra-low latency (< 1s) classification.
  - System Prompting: Enforces strict structured JSON schema responses.
  - Built-in heuristic fallback engine prevents zero-tolerance disqualification if API quota is reached or network fails.

### 2.4 Frontend Stack (React + Vite)
- **Vite**: Sub-second Hot Module Replacement (HMR) and optimized Rollup bundling.
- **State Management**: Zustand / React Context for lightweight client-side state caching and optimistic UI updates.
- **Game Micro-Interactions**:
  - `framer-motion`: Smooth spring layout transitions, health bar tweening, and floating number popups.
  - `canvas-confetti`: Confetti bursts on quest completion and level advancement.
  - `howler.js`: Cross-browser audio synthesizer for quest clicks, level-up fanfares, and shop transactions.

---

## 3. Package Dependencies Manifest

```json
{
  "name": "soulforge-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^20.17.6",
    "@types/supertest": "^6.0.2",
    "prisma": "^5.22.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}
```
