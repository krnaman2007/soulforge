# Soulforge

> Life RPG - Authoritative Game Backend & Gamified Productivity Ecosystem

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwind-css)
![Node](https://img.shields.io/badge/Node.js-Backend-339933.svg?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1.svg?logo=postgresql)

## 📑 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Key Features](#key-features)
5. [Application Workflow](#application-workflow)
6. [Pages & Modules](#pages--modules)
7. [Tech Stack](#tech-stack)
8. [System Architecture](#system-architecture)
9. [Project Structure](#project-structure)
10. [Frontend Architecture](#frontend-architecture)
11. [Backend Architecture](#backend-architecture)
12. [Database Architecture](#database-architecture)
13. [Authentication & Authorization](#authentication--authorization)
14. [API Documentation](#api-documentation)
15. [Important Data Flows](#important-data-flows)
16. [Environment Variables](#environment-variables)
17. [Prerequisites](#prerequisites)
18. [Installation](#installation)
19. [Running Locally](#running-locally)
20. [Security](#security)
21. [Development Guidelines](#development-guidelines)
22. [Troubleshooting](#troubleshooting)
23. [Future Scope](#future-scope)
24. [License](#license)

---

## 🌟 Overview

**Soulforge** is a full-stack "Life RPG" and gamified productivity application. It bridges the gap between daily task management and immersive role-playing games by mapping real-world tasks and habits to virtual character progression. Users complete tasks to earn XP, level up, boost character attributes, and unlock digital/real-world rewards.

## 🚨 Problem Statement

Traditional task managers and productivity apps often lack long-term engagement. Users suffer from burnout, procrastination, and a lack of immediate gratification when pursuing long-term goals.

## 💡 Solution

Soulforge introduces **gamification** to daily life. By treating personal development as an RPG, users are incentivized by immediate feedback loops—XP gains, level-ups, attribute increases, and tangible rewards—making productivity inherently engaging and rewarding.

---

## ✨ Key Features

### 👤 User & Authentication
* **Registration & Login**: Secure email/password and Google OAuth integration.
* **Authentication**: JWT-based session management.
* **Profile Management**: Customizable user profiles and settings.

### 🎮 Gamification / Progression
* **Authoritative Progression**: Backend-driven XP and level calculation to prevent client-side manipulation.
* **12 Character Attributes**: Physical, Intellect, Strength, Discipline, Health, Creativity, Social, Leadership, Finance, Career, Emotional, and Learning/Personal Growth.
* **Streaks**: Daily activity tracking with streak preservation and recovery mechanics.
* **Achievements**: Unlockable badges for reaching specific milestones.

### 🏆 Social & Community
* **Friends System**: Send, accept, and manage friend requests.
* **Leaderboard**: Global ranking system based on total XP and level.
* **Followers**: Social following mechanics.

### 🎁 Rewards / Shop (Marketplace)
* **XP Rewards Marketplace**: Spend earned XP to redeem digital or real-world rewards (coupons, vouchers).
* **Inventory**: Track redeemed rewards and active coupons.
* **Transaction History**: Secure backend logging of all XP expenditures.

### 📊 Analytics / Statistics
* **Activity Logs**: Detailed history of all XP/coin transactions, task completions, and level-ups.
* **Progression Path**: Visual mapping of the user's journey, upcoming rank titles, and unlocked features.

---

## 🔄 Application Workflow

```text
User Registration / Login
         ↓
Dashboard (Command Center)
         ↓
Create & Complete Tasks / Projects
         ↓
Earn XP & Coins (Authoritative Backend Validation)
         ↓
Character Levels Up & Attributes Increase
         ↓
Compare Progress on Leaderboard / Add Friends
         ↓
Spend XP in the Rewards Marketplace
         ↓
Redeem Real-World/Digital Rewards
```

---

## 🖥️ Pages & Modules

* **Landing / Auth**: Secure entry points with login/register forms.
* **Dashboard**: The central "Command Center" summarizing lifetime XP, current level, active tasks, and recent activity.
* **Character Sheet**: In-depth view of the user's RPG stats, 12 core attributes, equipped items, and current rank.
* **Progression Path**: A visual roadmap showing past and future ranks, required XP, and unlockable features.
* **Shop (Marketplace)**: A premium UI where users exchange earned XP for rewards and coupons.
* **Leaderboard**: Ranked list of all players based on XP.
* **Friends**: Social hub for managing connections and friend requests.
* **Stats**: Detailed analytics and activity history.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 19 + Vite | UI framework and build tooling |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Animations**| Framer Motion | Fluid spring-based UI animations |
| **State** | Redux Toolkit | Global client state management |
| **Backend** | Node.js + Express.js| REST API server |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Type-safe database client and schema management |
| **Authentication**| JWT + bcrypt | Secure token-based auth and password hashing |
| **AI Integration**| Google Generative AI / Groq | AI-driven insights and task analysis |

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────────────┐
                    │            Frontend             │
                    │   React 19 + Vite + Tailwind    │
                    │      (Redux Toolkit State)      │
                    └───────────────┬─────────────────┘
                                    │
                              HTTP / REST API
                                    │
                    ┌───────────────▼─────────────────┐
                    │             Backend             │
                    │       Node.js + Express.js      │
                    │  (Controllers, Services, Auth)  │
                    └───────────────┬─────────────────┘
                                    │
                               Prisma ORM
                                    │
                    ┌───────────────▼─────────────────┐
                    │            Database             │
                    │           PostgreSQL            │
                    └─────────────────────────────────┘
```

---

## 📁 Project Structure

```text
soulforge/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios configuration and API interceptors
│   │   ├── components/         # Reusable UI components (Sidebar, Modals, etc.)
│   │   ├── screens/            # Main page components (Dashboard, Shop, etc.)
│   │   ├── store/              # Redux slices and store configuration
│   │   ├── utils/              # Client-side helpers (RPG math, formatting)
│   │   ├── App.tsx             # Main React entry and Router setup
│   │   └── main.tsx            # Application mount point
│   └── package.json            
│
├── server/                     # Backend Node.js Application
│   ├── prisma/                 # Database schema and migrations
│   │   └── schema.prisma       # Prisma data models
│   ├── src/
│   │   ├── config/             # Environment and third-party config
│   │   ├── controllers/        # Route handlers linking requests to services
│   │   ├── middleware/         # Auth, validation, and error middleware
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Core business logic (rpg, user, rewards)
│   │   └── utils/              # Backend helpers
│   ├── server.js               # Express app initialization
│   └── package.json            
│
└── README.md
```

---

## 🎨 Frontend Architecture

* **Entry Point**: `client/src/main.tsx` mounts the app.
* **Routing**: Handled by `react-router-dom` in `App.tsx` with protected route wrappers.
* **State Management**: Redux Toolkit (`client/src/store`) manages global state for `auth`, `shop`, `activities`, etc.
* **API Layer**: `axios` instance with request interceptors to automatically attach JWT bearer tokens.
* **Styling System**: Tailwind CSS v4 coupled with custom glassmorphism (`backdrop-blur`), neon glow effects, and complex `clip-path` geometry for a sci-fi/gaming aesthetic.

---

## ⚙️ Backend Architecture

* **Entry Point**: `server/server.js` initializes Express, CORS, Helmet, and mounts routes.
* **Request Lifecycle**: 
  `Request` → `Auth Middleware` → `Route` → `Controller` → `Service` → `Prisma (DB)` → `Response`.
* **Services**: The `services/` directory contains all business logic (e.g., `reward.service.js` handles transactional XP deduction and coupon assignment to prevent race conditions).
* **Security**: `helmet` for HTTP headers, `express-rate-limit` for DDoS protection, and `bcrypt` for password hashing.

---

## 🗄️ Database Architecture

The application uses **PostgreSQL** managed via **Prisma**.

### Key Models

| Model | Purpose | Key Relationships |
| --- | --- | --- |
| **User** | Core identity, auth credentials | 1:1 Character, 1:M Tasks, 1:M Friends |
| **Character** | RPG stats, XP, Level, Attributes | 1:1 User |
| **Task / Project** | Actionable items that grant XP | M:1 User |
| **ActivityLog** | Immutable ledger of all XP/Coin changes| M:1 User, Optional link to Task/Item |
| **Reward** | Available items in the Shop | 1:M RedeemedReward |
| **RedeemedReward**| Instances of rewards claimed by users | M:1 User, M:1 Reward |
| **Friendship** | Social connections | M:1 User (Requester/Receiver) |

---

## 🔐 Authentication & Authorization

1. **Registration**: User submits credentials → Backend hashes password via `bcrypt` → Creates `User` and default `Character` → Returns JWT.
2. **Login**: Verifies credentials → Generates signed JWT.
3. **Middleware**: `auth.middleware.js` intercepts protected routes, verifies the JWT via `jsonwebtoken`, and attaches the `user` object to the request.
4. **Authorization**: Controllers verify that the authenticated `req.user.id` matches the owner of the requested resource (e.g., you can only complete your own tasks).

*Note: Passwords and sensitive data are never returned in API responses.*

---

## 🌐 API Documentation

*Base URL: `/api`*

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Authenticate user | No |
| GET | `/auth/me` | Get current user & character profile | Yes |

### Tasks (`/tasks`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/tasks` | List user's tasks | Yes |
| POST | `/tasks` | Create a new task | Yes |
| POST | `/tasks/:id/complete` | Complete task & trigger XP calculation | Yes |

### Rewards & Shop (`/shop`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/shop/rewards` | List available rewards | Yes |
| POST | `/shop/rewards/:id/redeem` | Deduct XP and claim reward | Yes |
| GET | `/shop/redemptions` | View user's redeemed rewards history | Yes |

### Social (`/social`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/social/leaderboard` | Get global XP rankings | Yes |
| GET | `/social/friends` | Get user's friend list | Yes |
| POST | `/social/friends/request` | Send a friend request | Yes |

---

## 🌊 Important Data Flows

### Task Completion & XP Flow
```text
1. User clicks "Complete" on Frontend
2. POST /api/tasks/:id/complete
3. Backend validates task ownership and status
4. Backend calculates authoritative XP/Coins based on task difficulty/attributes
5. Backend updates Task status to COMPLETED
6. Backend increments Character XP/Level and specific Attributes
7. Backend creates ActivityLog entry for the transaction
8. Backend returns updated Character state
9. Frontend Redux store updates, triggering UI animations (e.g., Level Up modal)
```

### Reward Redemption Flow
```text
1. User selects a reward in the Shop
2. POST /api/shop/rewards/:id/redeem
3. Backend Service initiates a Database Transaction
4. Verifies Reward exists and is active
5. Verifies Character has sufficient XP balance
6. Deducts XP from Character
7. Generates unique Coupon Code
8. Creates RedeemedReward record
9. Creates ActivityLog entry for XP expenditure
10. Transaction commits
11. Frontend displays Success Modal and updated XP balance
```

---

## 🔑 Environment Variables

The project requires `.env` configuration in the `server/` directory.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Authentication
JWT_SECRET="your_super_secret_jwt_key_here"

# External APIs (Optional depending on active features)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GROQ_API_KEY="your_groq_api_key"
```

*CRITICAL: Never commit `.env` files or expose your secrets.*

---

## 📋 Prerequisites

* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**
* **PostgreSQL** database (local or cloud-hosted)

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd soulforge
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup:**
   Create a `.env` file in the `server` directory and add your `DATABASE_URL`. Then run:
   ```bash
   cd server
   npx prisma db push
   # Optional: Seed the database with initial rewards/achievements
   npm run prisma:seed 
   ```

---

## 💻 Running Locally

You need two terminal windows to run the full stack.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🛡️ Security

* **No Client-Side Authority**: All XP, levels, and attributes are calculated strictly on the backend to prevent cheating.
* **Transactions**: Critical operations (like spending XP in the shop) use database transactions to prevent race conditions.
* **CORS**: Configured to only allow requests from the designated frontend origin.
* **Helmet**: Sets secure HTTP headers automatically.
* **Rate Limiting**: Protects authentication and heavy computational routes from abuse.

---

## 📜 Development Guidelines

* **Authoritative Backend**: Never trust the client. Any action that changes state (tasks, xp, purchases) must be validated on the backend.
* **UI Aesthetic**: Maintain the established design system (Tailwind classes for glassmorphism `bg-black/50 backdrop-blur-md`, standard clip-paths, and `Rajdhani`/`Inter` fonts).
* **State Management**: Use Redux for global data (User Profile, Shop Inventory). Use local React state for UI-only toggles (Modals, Dropdowns).

---

## 🔧 Troubleshooting

* **Backend won't start?** 
  Ensure PostgreSQL is running and `DATABASE_URL` is correctly formatted in your `.env`.
* **Frontend can't connect?** 
  Check that the backend is running on port 5000 and that CORS is configured properly in `server.js`.
* **Prisma Errors?** 
  Run `npx prisma generate` in the server directory if you change `schema.prisma` or switch Node environments.

---

## 🔮 Future Scope

* **Guilds / Parties**: Group quests where multiple users contribute to shared goals.
* **Dynamic AI Coaching**: Expanded use of LLMs to analyze user task patterns and suggest attribute-specific goals.
* **Push Notifications**: Real-time alerts for friend requests and daily streak reminders.
* **Expanded Inventory**: Equipable visual cosmetics for the user's avatar based on unlocked items.

---

## 🏆 Credits & Acknowledgements

This project was proudly built by **Team WebNexus** as a submission for the **WebHackathon by IIT Bhubaneswar**.

---

## 📄 License

This project is licensed under the **ISC License**.