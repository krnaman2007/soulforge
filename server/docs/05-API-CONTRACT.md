# 05 — Frozen API Contract Specification: SoulForge (Life RPG)

## 1. Global Standard Envelope & Headers

All responses adhere strictly to the standardized JSON envelope.

### 1.1 Success Response (`2xx`)
```json
{
  "success": true,
  "data": {}
}
```

### 1.2 Error Response (`4xx`, `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of error",
    "details": {}
  }
}
```

### 1.3 Standard Request Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (Required for all protected endpoints)

---

## 2. Health & Verification Endpoint

### `GET /api/health`
Deployment ping and monitoring check.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Life RPG API is running",
  "timestamp": "2026-09-12T11:30:00.000Z"
}
```

---

## 3. Authentication & Profile (`/api/auth`)

### `POST /api/auth/register`
Creates User account, initializes Character with starter stats and inventory.
- **Request Body**:
```json
{
  "name": "Aayansh",
  "email": "hero@soulforge.gg",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "cuid_user_1",
      "name": "Aayansh",
      "email": "hero@soulforge.gg"
    },
    "character": {
      "id": "cuid_char_1",
      "level": 1,
      "xp": 0,
      "coins": 50,
      "strength": 10,
      "intellect": 10,
      "discipline": 10,
      "health": 10,
      "creativity": 10,
      "social": 10,
      "currentStreak": 0,
      "longestStreak": 0
    }
  }
}
```

### `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "hero@soulforge.gg",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**: Returns token, user, and character.

### `GET /api/auth/me`
Fetches authenticated user identity and active hero.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid_user_1", "name": "Aayansh", "email": "hero@soulforge.gg" },
    "character": { "id": "cuid_char_1", "level": 1, "xp": 0, "coins": 50 }
  }
}
```

---

## 4. Dashboard Consolidated API (`/api/dashboard`)

### `GET /api/dashboard`
Single query returning complete state required for the hero home screen to minimize network roundtrips.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "character": {
      "id": "cuid_char_1",
      "level": 4,
      "xp": 95,
      "nextLevelXP": 150,
      "coins": 240,
      "attributes": {
        "strength": 18,
        "intellect": 42,
        "discipline": 25,
        "health": 15,
        "creativity": 20,
        "social": 12
      },
      "cosmetics": {
        "avatarId": "avatar_starter",
        "themeId": "theme_classic",
        "titleId": "title_apprentice"
      }
    },
    "streak": {
      "current": 5,
      "longest": 12,
      "isActiveToday": true
    },
    "activeTasks": [
      {
        "id": "cuid_task_1",
        "title": "Study Graph Algorithms",
        "category": "INTELLECT",
        "priority": "HIGH",
        "difficulty": "HARD",
        "xpReward": 85,
        "coinReward": 34,
        "status": "PENDING"
      }
    ],
    "activeProjects": [
      {
        "id": "cuid_proj_1",
        "name": "Master React 19",
        "progress": 0.6,
        "totalTasks": 5,
        "completedTasks": 3
      }
    ],
    "recentActivity": [
      {
        "id": "cuid_log_1",
        "type": "TASK_COMPLETED",
        "xpChange": 85,
        "coinChange": 34,
        "createdAt": "2026-09-12T10:15:00.000Z"
      }
    ]
  }
}
```

---

## 5. Quest System APIs (`/api/tasks`)

### `GET /api/tasks`
Lists authenticated user's tasks with optional filtering.
- **Query Params**: `status` (`PENDING|IN_PROGRESS|COMPLETED`), `category`, `projectId`.
- **Response `200 OK`**: `{ "success": true, "data": [ ...tasks ] }`

### `POST /api/tasks`
Creates a new quest. Automatically invokes AI task classification and authoritative reward calculation.
- **Request Body**:
```json
{
  "title": "Study Normalization & BCNF for 2 hours",
  "description": "Read Chapter 14 and solve 5 database design problems",
  "dueDate": "2026-09-15T18:00:00.000Z",
  "projectId": "cuid_proj_1"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_task_99",
    "title": "Study Normalization & BCNF for 2 hours",
    "category": "INTELLECT",
    "priority": "HIGH",
    "difficulty": "MEDIUM",
    "effort": "HIGH",
    "impact": "HIGH",
    "xpReward": 60,
    "coinReward": 24,
    "aiAnalyzed": true,
    "aiConfidence": 0.94,
    "status": "PENDING"
  }
}
```

### `POST /api/tasks/:id/complete` (The Central Celebration Engine)
Executes atomic task completion transaction and returns celebratory payload.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "cuid_task_99",
      "status": "COMPLETED",
      "completedAt": "2026-09-12T11:45:00.000Z"
    },
    "rewards": {
      "xp": 60,
      "coins": 24,
      "attribute": "INTELLECT",
      "attributeIncrease": 5
    },
    "character": {
      "level": 5,
      "xp": 25,
      "nextLevelXP": 240,
      "coins": 264,
      "intellect": 47
    },
    "levelUp": {
      "leveledUp": true,
      "oldLevel": 4,
      "newLevel": 5
    },
    "streak": {
      "current": 6,
      "longest": 12,
      "streakIncreased": true
    },
    "achievementsUnlocked": [
      {
        "id": "cuid_ach_5",
        "code": "LEVEL_5",
        "name": "Novice Ascendant",
        "rewardCoins": 100,
        "rewardXP": 200
      }
    ]
  }
}
```

---

## 6. Campaigns / Projects (`/api/projects`)

### `GET /api/projects`
- **Response `200 OK`**: Lists user's active and completed projects with computed progress.

### `POST /api/projects`
- **Request Body**:
```json
{
  "name": "Build Fullstack Life RPG",
  "description": "Tech Zephyr Hackathon submission",
  "bonusXP": 150,
  "bonusCoins": 75
}
```

### `POST /api/projects/:id/complete`
Validates that all tasks inside the project are completed, then grants bonus XP and gold.
- **Response `200 OK`**: Returns updated character and project status.

---

## 7. AI Advisory Endpoints (`/api/ai`)

### `POST /api/ai/tasks/analyze`
Directly inspects what classification the AI gives to a raw text task before creation.
- **Request Body**: `{ "title": "Run 5km", "description": "Morning outdoor jog" }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "category": "HEALTH",
    "priority": "MEDIUM",
    "difficulty": "MEDIUM",
    "effort": "HIGH",
    "impact": "HIGH",
    "confidence": 0.95,
    "suggestedXP": 55,
    "suggestedCoins": 22
  }
}
```

### `POST /api/ai/projects/plan`
Decomposes high-level goal into structured phases and quests.
- **Request Body**: `{ "goal": "Learn React from scratch in 2 weeks" }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "projectName": "React Mastery Campaign",
    "phases": [
      {
        "phaseNumber": 1,
        "title": "Core Fundamentals",
        "tasks": [
          { "title": "Master JSX Syntax", "category": "INTELLECT", "difficulty": "EASY" },
          { "title": "Build First Component Tree", "category": "INTELLECT", "difficulty": "MEDIUM" }
        ]
      }
    ]
  }
}
```

### `POST /api/ai/habit-plan`
Deconstructs vague personal habit resolutions into 7-day micro-quests.
- **Request Body**: `{ "habitGoal": "Stop doomscrolling before sleep" }`
- **Response `200 OK`**: Returns structured quest chain.

---

## 8. Economy & Inventory (`/api/items`, `/api/inventory`)

### `GET /api/items`
Browse shop catalogue with filtering by `type` or `rarity`.

### `POST /api/items/:id/purchase`
Atomic purchase transaction.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "item": { "id": "item_cyber_theme", "name": "Cyberpunk Neon Theme" },
    "remainingCoins": 140,
    "inventory": { "id": "inv_12", "itemId": "item_cyber_theme", "equipped": false }
  }
}
```

### `POST /api/inventory/:id/equip`
Equips cosmetic item to character sheet and unequips previously equipped item of the same type.

---

## 9. Streak & Recovery (`/api/streak`)

### `GET /api/streak`
Returns current streak, longest streak, and recovery eligibility.

### `POST /api/streak/recover`
Spends 50 coins to restore broken streak (1 recovery per 7 days allowed).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "recoveredStreak": 12,
    "coinsDeducted": 50,
    "remainingCoins": 90,
    "message": "Streak successfully restored with Phoenix Shield!"
  }
}
```

---

## 10. Social & Hall of Champions (`/api/friends`, `/api/leaderboard`)

### `GET /api/leaderboard/global`
Weekly XP rankings of top heroes.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "cuid_user_8",
      "name": "ShadowBlade",
      "avatarId": "avatar_cyber_ninja",
      "level": 14,
      "weeklyXP": 1420
    }
  ]
}
```

### `GET /api/friends`
List accepted friends and their active levels and streaks.

### `POST /api/friends/request/:userId`
Sends friend request to another hero.
