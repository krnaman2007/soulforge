# SoulForge API Documentation

This document outlines all backend REST API endpoints for the SoulForge Life RPG platform.

* **Base URL:** `http://localhost:3000/api/v1` (Canonical) or `http://localhost:3000/api` (Backward-Compatible)
* **Default Content-Type:** `application/json`
* **Standard Authentication:** `Authorization: Bearer <JWT_TOKEN>`

---

## Response Conventions

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error",
    "details": null
  }
}
```

---

## 1. System & Health

### 1.1 Server Health Check
Check whether the backend service is operational.

* **Method:** `GET`
* **URL:** `/api/v1/health` (or `/api/health`)
* **Auth Required:** No
* **Headers:** None
* **Request Data:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Life RPG API is running",
  "timestamp": "2026-09-12T09:34:38.066Z"
}
```

---

## 2. Authentication & User Onboarding

### 2.1 Register New Account
Registers a new player with email, password, and unique handle. Sends an email verification link.

* **Method:** `POST`
* **URL:** `/api/v1/auth/register` (or `/api/auth/register`)
* **Auth Required:** No (Rate limited)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | string | Yes | 2 - 50 chars | Player's display name |
| `email` | string | Yes | Valid email format | Player's unique email |
| `username` | string | Yes | 3 - 30 chars, `[a-zA-Z0-9_]` | Unique player handle (case-insensitive) |
| `password` | string | Yes | 6 - 100 chars | Account password |
| `timezone` | string | No | IANA timezone (e.g. `Asia/Kolkata`) | Player timezone for streaks & daily reset (default `UTC`) |

* **Example Request:**
```json
{
  "name": "Alex Vance",
  "email": "alex@example.com",
  "username": "alex_vance",
  "password": "SecretPassword123!",
  "timezone": "Asia/Kolkata"
}
```

* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful. Please check your email for a verification link.",
    "user": {
      "id": "cmty5c5bj000049xdf8xvbvu6",
      "email": "alex@example.com",
      "username": "alex_vance",
      "name": "Alex Vance",
      "isVerified": false
    },
    "character": {
      "level": 1,
      "xp": 0,
      "coins": 50,
      "strength": 10,
      "intellect": 10,
      "discipline": 10,
      "health": 10,
      "creativity": 10,
      "social": 10
    },
    "needsUsername": false
  }
}
```

---

### 2.2 Login with Password
Authenticates an existing verified user with email and password.

* **Method:** `POST`
* **URL:** `/api/v1/auth/login` (or `/api/auth/login`)
* **Auth Required:** No (Rate limited)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Account password |

* **Example Request:**
```json
{
  "email": "alex@example.com",
  "password": "SecretPassword123!"
}
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmty5c5bj000049xdf8xvbvu6",
      "email": "alex@example.com",
      "username": "alex_vance",
      "name": "Alex Vance",
      "isVerified": true
    },
    "character": {
      "level": 1,
      "xp": 0,
      "coins": 50
    },
    "needsUsername": false
  }
}
```

---

### 2.3 Logout
Invalidates the client session.

* **Method:** `POST`
* **URL:** `/api/v1/auth/logout` (or `/api/auth/logout`)
* **Auth Required:** No
* **Headers:** None
* **Request Data:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### 2.4 Get Current Authenticated Profile (`/me`)
Returns current authenticated player's full profile and RPG character stats.

* **Method:** `GET`
* **URL:** `/api/v1/auth/me` (or `/api/auth/me`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Data:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmty5c5bj000049xdf8xvbvu6",
      "email": "alex@example.com",
      "username": "alex_vance",
      "name": "Alex Vance",
      "isVerified": true
    },
    "character": {
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
      "longestStreak": 0,
      "avatarId": "avatar_starter",
      "themeId": "theme_classic",
      "titleId": "title_apprentice"
    },
    "needsUsername": false
  }
}
```

---

### 2.5 Resend Email Verification Link
Resends a verification link if expired or lost.

* **Method:** `POST`
* **URL:** `/api/v1/auth/resend-verification` (or `/api/auth/resend-verification`)
* **Auth Required:** No (Rate limited)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "alex@example.com"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Verification link sent to your email address"
  }
}
```

---

### 2.6 Verify Email Token
Confirms email ownership and activates the user account using the token sent in the email.

* **Method:** `GET`
* **URL:** `/api/v1/auth/verify-email` (or `/api/auth/verify-email`)
* **Auth Required:** No (Rate limited)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "token": "c9e0098613cf980458b11ce42b9c9771efb0d3635ca3bfeaba5b263528d8aab8"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmty5c5bj000049xdf8xvbvu6",
      "email": "alex@example.com",
      "username": "alex_vance",
      "name": "Alex Vance",
      "isVerified": true
    },
    "character": {
      "level": 1,
      "xp": 0,
      "coins": 50
    }
  }
}
```

---

### 2.7 Google OAuth Login
Authenticates or registers a user with a Google OAuth ID token.

* **Method:** `POST`
* **URL:** `/api/v1/auth/google` (or `/api/auth/google`)
* **Auth Required:** No (Rate limited)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `idToken` | string | Yes | Raw Google JWT ID Token from Google Identity Services |

* **Example Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmty4p42x00005nxdf0x4o45h",
      "email": "player@gmail.com",
      "username": null,
      "name": "Google Player",
      "isVerified": true
    },
    "character": {
      "level": 1,
      "xp": 0,
      "coins": 50
    },
    "isNewUser": true,
    "needsUsername": true
  }
}
```

---

### 2.8 Check Username Availability
Checks whether a handle is available or taken (for live frontend feedback).

* **Method:** `GET`
* **URL:** `/api/v1/auth/check-username` (or `/api/auth/check-username`)
* **Auth Required:** No (Rate limited)
* **Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `username` | string | Yes | Handle to check |

* **Example:** `GET /api/auth/check-username?username=dragon_slayer`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "username": "dragon_slayer"
  }
}
```
* **If Unavailable / Reserved (200 OK):**
```json
{
  "success": true,
  "data": {
    "available": false,
    "username": "admin",
    "reason": "This username is reserved"
  }
}
```

---

### 2.9 Set / Claim Username
Enables authenticated users (especially Google OAuth users on first login) to claim their unique handle.

* **Method:** `POST`
* **URL:** `/api/v1/auth/username` (or `/api/auth/username`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `username` | string | Yes | 3 - 30 chars, `[a-zA-Z0-9_]` | Handle to claim |

* **Example Request:**
```json
{
  "username": "dragon_slayer"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmty4p42x00005nxdf0x4o45h",
      "email": "player@gmail.com",
      "username": "dragon_slayer",
      "name": "Google Player",
      "isVerified": true
    },
    "character": {
      "level": 1,
      "xp": 0,
      "coins": 50
    },
    "needsUsername": false
  }
}
```

---

## 3. Social Graph & Public Profiles

### 3.1 Search Adventurers
Discovers other players by display name or handle.

* **Method:** `GET`
* **URL:** `/api/v1/users/search` (or `/api/users/search`)
* **Auth Required:** Optional (Returns contextual `isFollowing` if authenticated)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **Query Parameters:**
| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | string | Yes | - | Search query (minimum 2 characters) |
| `page` | integer | No | 1 | Page number (min 1) |
| `limit` | integer | No | 20 | Items per page (min 1, max 50) |

* **Example:** `GET /api/users/search?q=alice&page=1&limit=20`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cmty66yc10000j3xdyb26c8jd",
        "name": "Adventurer Alice",
        "username": "alice_adventurer",
        "level": 10,
        "currentStreak": 5,
        "avatarId": "knight",
        "titleId": "title_apprentice",
        "isFollowing": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3.2 Get Public Profile
Retrieves an adventurer's public profile, level, streak, followers/following counts, and follow state.

* **Method:** `GET`
* **URL:** `/api/v1/users/:userId` (or `/api/users/:userId`)
* **Auth Required:** Optional
* **Headers:** `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | Target user's CUID |

* **Example:** `GET /api/users/cmty66yc10000j3xdyb26c8jd`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty66yc10000j3xdyb26c8jd",
    "name": "Adventurer Alice",
    "username": "alice_adventurer",
    "createdAt": "2026-09-12T09:15:49.969Z",
    "level": 10,
    "xp": 0,
    "currentStreak": 5,
    "longestStreak": 0,
    "avatarId": "knight",
    "themeId": "theme_classic",
    "titleId": "title_apprentice",
    "followersCount": 42,
    "followingCount": 18,
    "isFollowing": false
  }
}
```

---

### 3.3 Follow User
Follows target adventurer. Creates a directed one-way social relationship.

* **Method:** `POST`
* **URL:** `/api/v1/users/:userId/follow` (or `/api/users/:userId/follow`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | ID of the user to follow |
* **Request Body:** None
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": "User followed successfully",
    "followId": "cmty6d000001j3xdabcdef12",
    "following": true
  }
}
```
* **Error Responses:**
  * `400 Bad Request` (`SELF_FOLLOW_NOT_ALLOWED`): If trying to follow own user ID.
  * `404 Not Found` (`USER_NOT_FOUND`): If target user ID does not exist.
  * `409 Conflict` (`ALREADY_FOLLOWING`): If already following target user.

---

### 3.4 Unfollow User
Removes the follow relationship with target adventurer.

* **Method:** `DELETE`
* **URL:** `/api/v1/users/:userId/follow` (or `/api/users/:userId/follow`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | ID of the user to unfollow |
* **Request Body:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User unfollowed successfully",
    "following": false
  }
}
```
* **Error Responses:**
  * `404 Not Found` (`NOT_FOLLOWING`): If no follow relationship exists.

---

### 3.5 Get Followers List
Returns paginated list of users following target user.

* **Method:** `GET`
* **URL:** `/api/v1/users/:userId/followers` (or `/api/users/:userId/followers`)
* **Auth Required:** Optional
* **Headers:** `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **URL Parameters:** `userId` (string, required)
* **Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (min 1) |
| `limit` | integer | 20 | Page size (1 to 50) |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cmty4p42x00005nxdf0x4o45h",
        "name": "Bob Builder",
        "username": "bob_builder",
        "level": 15,
        "currentStreak": 12,
        "avatarId": "mage",
        "titleId": "title_apprentice",
        "followedAt": "2026-09-12T09:20:00.000Z",
        "isFollowing": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3.6 Get Following List
Returns paginated list of users followed by target user.

* **Method:** `GET`
* **URL:** `/api/v1/users/:userId/following` (or `/api/users/:userId/following`)
* **Auth Required:** Optional
* **Headers:** `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **URL Parameters:** `userId` (string, required)
* **Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (min 1) |
| `limit` | integer | 20 | Page size (1 to 50) |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cmty66yc10000j3xdyb26c8jd",
        "name": "Adventurer Alice",
        "username": "alice_adventurer",
        "level": 10,
        "currentStreak": 5,
        "avatarId": "knight",
        "titleId": "title_apprentice",
        "followedAt": "2026-09-12T09:18:00.000Z",
        "isFollowing": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 4. Tasks & Productivity Management

### 4.1 List Tasks
Retrieves all tasks for the authenticated user.

* **Method:** `GET`
* **URL:** `/api/v1/tasks` (or `/api/tasks`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Data:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmty7k0100001j3xdtask001",
      "userId": "cmty4p42x00005nxdf0x4o45h",
      "title": "Complete 30 min morning workout",
      "description": "HIIT and stretching session",
      "category": "HEALTH",
      "priority": "HIGH",
      "difficulty": "MEDIUM",
      "status": "PENDING",
      "xpReward": 35,
      "coinReward": 15,
      "dueDate": "2026-09-13T08:00:00.000Z",
      "completedAt": null,
      "createdAt": "2026-09-12T10:00:00.000Z"
    }
  ]
}
```

---

### 4.2 Create Task
Creates a new quest/task. Automatically classifies category and rewards using AI heuristics.

* **Method:** `POST`
* **URL:** `/api/v1/tasks` (or `/api/tasks`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `title` | string | Yes | 3 - 255 chars | Task title |
| `description` | string | No | max 1000 chars | Additional details |
| `dueDate` | string | No | ISO-8601 DateTime | Due date |
| `projectId` | string | No | Valid CUID | Link to an existing project |

* **Example Request:**
```json
{
  "title": "Study Systems Architecture for 2 hours",
  "description": "Read Distributed Systems chapter 4 and take notes",
  "dueDate": "2026-09-13T18:00:00.000Z"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmty7k0100001j3xdtask002",
    "title": "Study Systems Architecture for 2 hours",
    "category": "INTELLECT",
    "priority": "HIGH",
    "difficulty": "MEDIUM",
    "status": "PENDING",
    "xpReward": 50,
    "coinReward": 20,
    "aiAnalyzed": true
  }
}
```

---

### 4.3 Update Task
Updates fields on an existing task.

* **Method:** `PATCH`
* **URL:** `/api/v1/tasks/:id` (or `/api/tasks/:id`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | CUID of the task |
* **Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | 3 - 255 chars |
| `description` | string | No | max 1000 chars |
| `dueDate` | string | No | ISO-8601 DateTime |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty7k0100001j3xdtask002",
    "title": "Study Systems Architecture for 3 hours"
  }
}
```

---

### 4.4 Complete Task (Claim Rewards)
Marks a task completed, awards authoritative XP & coins to the user's character, advances streaks, and logs activity.

* **Method:** `POST`
* **URL:** `/api/v1/tasks/:id/complete` (or `/api/tasks/:id/complete`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | CUID of the task |
* **Request Body:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "cmty7k0100001j3xdtask002",
      "status": "COMPLETED",
      "completedAt": "2026-09-12T10:15:00.000Z"
    },
    "rewards": {
      "xp": 50,
      "coins": 20,
      "attribute": "INTELLECT",
      "attributeIncrease": 3
    },
    "questCompleted": false,
    "questRewards": null,
    "character": {
      "level": 2,
      "xp": 50,
      "nextLevelXP": 150,
      "coins": 70,
      "intellect": 13,
      "strength": 10,
      "discipline": 10
    },
    "levelUp": {
      "leveledUp": true,
      "oldLevel": 1,
      "newLevel": 2
    },
    "streak": {
      "current": 1,
      "longest": 1,
      "streakIncreased": true
    },
    "achievementsUnlocked": [
      {
        "id": "cmty99ach1...",
        "code": "FIRST_BLOOD",
        "name": "First Blood",
        "description": "Complete your very first task.",
        "rewardXP": 100,
        "rewardCoins": 50,
        "badge": "badge-first-blood",
        "rewardTitle": "Novice Initiate"
      }
    ]
  }
}
```

---

### 4.5 Delete Task
Deletes a task owned by the authenticated player.

* **Method:** `DELETE`
* **URL:** `/api/v1/tasks/:id` (or `/api/tasks/:id`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | CUID of the task |
* **Request Body:** None
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

---

## 5. AI & RPG Intelligence (Google Gemini)

### 5.1 Analyze Task
Uses AI to classify an input task into the 6 Life RPG categories, estimating difficulty, effort, impact, XP, and coin rewards.

* **Method:** `POST`
* **URL:** `/api/v1/ai/tasks/analyze` (or `/api/ai/tasks/analyze`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `title` | string | Yes | 3 - 255 chars | Task name to analyze |
| `description` | string | No | max 1000 chars | Context / notes |

* **Example Request:**
```json
{
  "title": "Train for 5km marathon run in park",
  "description": "Aiming for sub-25 min pace"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": "STRENGTH",
    "priority": "HIGH",
    "difficulty": "HARD",
    "effort": "HIGH",
    "impact": "HIGH",
    "xpReward": 60,
    "coinReward": 25,
    "attribute": "STRENGTH",
    "aiConfidence": 0.94
  }
}
```

---

### 5.2 Plan Project
Generates a structured RPG questline / project breakdown for a user-specified goal.

* **Method:** `POST`
* **URL:** `/api/v1/ai/projects/plan` (or `/api/ai/projects/plan`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `goal` | string | Yes | 3 - 200 chars | The project or major milestone |

* **Example Request:**
```json
{
  "goal": "Build and launch a full-stack SaaS MVP in 2 weeks"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projectName": "Full-Stack SaaS Launch Quest",
    "category": "INTELLECT",
    "phases": [
      {
        "phaseName": "Phase 1: Architecture & Database",
        "tasks": [
          { "title": "Design PostgreSQL schema and Prisma migrations", "category": "INTELLECT", "xp": 40 },
          { "title": "Setup JWT Authentication and middleware", "category": "INTELLECT", "xp": 35 }
        ]
      },
      {
        "phaseName": "Phase 2: Core API & Frontend",
        "tasks": [
          { "title": "Build REST controllers and Zod validation", "category": "INTELLECT", "xp": 45 },
          { "title": "Implement React UI screens and integration", "category": "CREATIVITY", "xp": 50 }
        ]
      }
    ],
    "bonusXP": 150,
    "bonusCoins": 75
  }
}
```

---

### 5.3 Plan Habit
Creates a sustainable RPG habit schedule with progressive difficulty milestones.

* **Method:** `POST`
* **URL:** `/api/v1/ai/habit-plan` (or `/api/ai/habit-plan`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `habitGoal` | string | Yes | 3 - 200 chars | Habit to establish |

* **Example Request:**
```json
{
  "habitGoal": "Read 15 pages of non-fiction book every morning"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "habitName": "Morning Wisdom Reading",
    "attribute": "INTELLECT",
    "frequency": "DAILY",
    "starterStreakTarget": 7,
    "milestones": [
      { "streakDays": 7, "rewardTitle": "Curious Reader", "coins": 50 },
      { "streakDays": 21, "rewardTitle": "Dedicated Scholar", "coins": 150 },
      { "streakDays": 66, "rewardTitle": "Sage of the Morning", "coins": 500 }
    ],
    "baseDailyXP": 20,
    "baseDailyCoins": 10
  }
}
```

---

## 6. Quest & Campaign System

Quests are meaningful objectives (backed by Projects) that group tasks together, providing thematic purpose, progress tracking, and significant milestone rewards (+XP, +Coins, and +Attributes).

### 6.1 Create Quest
Creates a new Quest with difficulty-based authoritative milestone rewards.

* **Method:** `POST`
* **URL:** `/api/v1/quests` (or `/api/quests`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | string | Yes | 3 - 100 chars | Quest title |
| `description` | string | No | Max 1000 chars | Narrative/objective description |
| `category` | string | No | Enum (Default: `INTELLECT`) | `PHYSICAL`, `INTELLECT`, `STRENGTH`, `DISCIPLINE`, `HEALTH`, `CREATIVITY`, `SOCIAL`, `LEADERSHIP`, `FINANCE`, `CAREER`, `EMOTIONAL`, `LEARNING`, `PERSONAL_GROWTH` |
| `difficulty` | string | No | Enum (Default: `MEDIUM`) | `EASY`, `MEDIUM`, `HARD`, `EPIC` |
| `type` | string | No | Enum (Default: `PROJECT`) | `ONE_TIME`, `DAILY`, `RECURRING`, `MILESTONE`, `HABIT`, `PROJECT`, `LEARNING`, `CHALLENGE` |

* **Authoritative Difficulty Rewards:**
  * `EASY`: +100 XP, +50 Coins
  * `MEDIUM`: +250 XP, +120 Coins
  * `HARD`: +500 XP, +250 Coins
  * `EPIC`: +1000 XP, +500 Coins

* **Example Request:**
```json
{
  "name": "Master JavaScript Fundamentals",
  "description": "Master closures, event loop, and asynchronous patterns.",
  "category": "INTELLECT",
  "difficulty": "HARD",
  "type": "LEARNING"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmty81abc...",
    "userId": "cmty81xyz...",
    "name": "Master JavaScript Fundamentals",
    "description": "Master closures, event loop, and asynchronous patterns.",
    "category": "INTELLECT",
    "difficulty": "HARD",
    "type": "LEARNING",
    "status": "ACTIVE",
    "progress": 0,
    "totalTasks": 0,
    "completedTasks": 0,
    "bonusXP": 500,
    "bonusCoins": 250,
    "completedAt": null,
    "createdAt": "2026-09-12T10:00:00.000Z",
    "updatedAt": "2026-09-12T10:00:00.000Z",
    "tasks": []
  }
}
```

---

### 6.2 List Quests
Returns a paginated list of the authenticated user's quests with optional filtering.

* **Method:** `GET`
* **URL:** `/api/v1/quests` (or `/api/quests`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | 1 | Page number (min 1) |
| `limit` | integer | No | 20 | Page size (1 - 50) |
| `status` | string | No | - | Filter: `ACTIVE`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| `category` | string | No | - | Filter by Life RPG Category enum |
| `difficulty` | string | No | - | Filter: `EASY`, `MEDIUM`, `HARD`, `EPIC` |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "cmty81abc...",
        "userId": "cmty81xyz...",
        "name": "Master JavaScript Fundamentals",
        "description": "Master closures, event loop, and asynchronous patterns.",
        "category": "INTELLECT",
        "difficulty": "HARD",
        "type": "LEARNING",
        "status": "ACTIVE",
        "progress": 0.5,
        "totalTasks": 2,
        "completedTasks": 1,
        "bonusXP": 500,
        "bonusCoins": 250,
        "completedAt": null,
        "createdAt": "2026-09-12T10:00:00.000Z",
        "updatedAt": "2026-09-12T10:00:00.000Z",
        "tasks": [
          {
            "id": "cmty81task1...",
            "title": "Read MDN Closures Guide",
            "description": "Deep dive into lexical scoping",
            "status": "COMPLETED",
            "difficulty": "MEDIUM",
            "xpReward": 45,
            "coinReward": 18,
            "completedAt": "2026-09-12T10:05:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 6.3 Get Quest Details
Retrieves complete details of a specific quest.

* **Method:** `GET`
* **URL:** `/api/v1/quests/:id` (or `/api/quests/:id`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Quest ID |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty81abc...",
    "userId": "cmty81xyz...",
    "name": "Master JavaScript Fundamentals",
    "description": "Master closures, event loop, and asynchronous patterns.",
    "category": "INTELLECT",
    "difficulty": "HARD",
    "type": "LEARNING",
    "status": "ACTIVE",
    "progress": 0.5,
    "totalTasks": 2,
    "completedTasks": 1,
    "bonusXP": 500,
    "bonusCoins": 250,
    "tasks": []
  }
}
```

---

### 6.4 Get Quest Progress
Retrieves lightweight progress analytics and task breakdown for a quest.

* **Method:** `GET`
* **URL:** `/api/v1/quests/:id/progress` (or `/api/quests/:id/progress`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty81abc...",
    "name": "Master JavaScript Fundamentals",
    "category": "INTELLECT",
    "difficulty": "HARD",
    "type": "LEARNING",
    "status": "ACTIVE",
    "progress": 0.5,
    "totalTasks": 2,
    "completedTasks": 1,
    "bonusRewards": {
      "xp": 500,
      "coins": 250,
      "attribute": "INTELLECT"
    },
    "tasks": []
  }
}
```

---

### 6.5 Update Quest
Updates metadata of an existing quest. If `difficulty` changes, milestone bonuses are authoritatively updated.

* **Method:** `PATCH`
* **URL:** `/api/v1/quests/:id` (or `/api/quests/:id`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Updated title |
| `description` | string | No | Updated description |
| `category` | string | No | Updated Category enum |
| `difficulty` | string | No | Updated Difficulty enum |
| `type` | string | No | Updated QuestType enum |
| `status` | string | No | `ACTIVE`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty81abc...",
    "name": "Master Modern JavaScript",
    "category": "INTELLECT",
    "difficulty": "EPIC",
    "bonusXP": 1000,
    "bonusCoins": 500
  }
}
```

---

### 6.6 Delete Quest
Deletes a quest. Any child tasks are detached (`projectId` set to `null`).

* **Method:** `DELETE`
* **URL:** `/api/v1/quests/:id` (or `/api/quests/:id`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Quest deleted successfully",
    "questId": "cmty81abc..."
  }
}
```

---

## 7. Challenge System (Daily & Weekly)

Challenges track real-time activity aggregated across daily and weekly windows, unlocking claimable rewards when targets are reached.

### 7.1 Get Daily Challenge Status
Checks progress towards the daily completion quota (3 tasks/day).

* **Method:** `GET`
* **URL:** `/api/v1/challenges/daily` (or `/api/challenges/daily`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "DAILY",
    "title": "Daily Heroics",
    "description": "Complete 3 tasks in a single day.",
    "periodKey": "2026-09-12",
    "targetCount": 3,
    "completedCount": 3,
    "progress": 1,
    "isCompleted": true,
    "isClaimed": false,
    "claimedAt": null,
    "canClaim": true,
    "rewards": {
      "xp": 150,
      "coins": 75
    }
  }
}
```

---

### 7.2 Get Weekly Challenge Status
Checks progress towards the weekly completion quota (15 tasks/week).

* **Method:** `GET`
* **URL:** `/api/v1/challenges/weekly` (or `/api/challenges/weekly`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "WEEKLY",
    "title": "Weekly Grand Crusade",
    "description": "Complete 15 tasks this week.",
    "periodKey": "W-2026-09-07",
    "targetCount": 15,
    "completedCount": 7,
    "progress": 0.47,
    "isCompleted": false,
    "isClaimed": false,
    "claimedAt": null,
    "canClaim": false,
    "rewards": {
      "xp": 750,
      "coins": 400
    }
  }
}
```

---

### 7.3 Claim Challenge Reward
Claims bonus rewards for a completed daily or weekly challenge. Claims are idempotent per period window.

* **Method:** `POST`
* **URL:** `/api/v1/challenges/:type/claim` (or `/api/challenges/:type/claim`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **URL Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `daily` or `weekly` (case-insensitive) |

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "DAILY challenge claimed successfully",
    "claim": {
      "id": "cmty81claim...",
      "type": "DAILY",
      "periodKey": "2026-09-12",
      "claimedAt": "2026-09-12T10:15:00.000Z"
    },
    "rewards": {
      "xp": 150,
      "coins": 75
    },
    "levelUp": {
      "leveledUp": false,
      "oldLevel": 3,
      "newLevel": 3,
      "nextLevelXP": 580
    },
    "character": {
      "level": 3,
      "xp": 245,
      "nextLevelXP": 580,
      "coins": 495
    }
  }
}
```
* **Error Responses:**
  * `400 Bad Request` (`CHALLENGE_NOT_COMPLETED`): When task count is below target.
  * `409 Conflict` (`CHALLENGE_ALREADY_CLAIMED`): When already claimed for the current period.

---

## 8. AI Quest Campaign Generator

### 8.1 Generate Quest Campaign with AI
Decomposes a broad goal into sequential phases and tasks, calculates authoritative rewards, and atomically creates the Quest and child Tasks in the user's quest line.

* **Method:** `POST`
* **URL:** `/api/v1/ai/quests/generate` (or `/api/ai/quests/generate`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `goal` | string | Yes | 3 - 300 chars | Broad objective or ambition |
| `category` | string | No | Enum (Default: `INTELLECT`) | Life RPG category |
| `difficulty` | string | No | Enum (Default: `MEDIUM`) | `EASY`, `MEDIUM`, `HARD`, `EPIC` |
| `autoCreate` | boolean | No | Default: `true` | When true, atomically saves quest + tasks to database |

* **Example Request:**
```json
{
  "goal": "Learn Docker and Kubernetes for Cloud Deployment",
  "category": "CAREER",
  "difficulty": "MEDIUM",
  "autoCreate": true
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmty81aiquest...",
    "userId": "cmty81xyz...",
    "name": "Campaign: Learn Docker and Kubernetes for Cloud Deployment",
    "description": "Campaign Goal: Learn Docker and Kubernetes for Cloud Deployment",
    "category": "CAREER",
    "difficulty": "MEDIUM",
    "type": "PROJECT",
    "status": "ACTIVE",
    "progress": 0,
    "totalTasks": 6,
    "completedTasks": 0,
    "bonusXP": 250,
    "bonusCoins": 120,
    "tasks": [
      {
        "id": "cmty81aitask1...",
        "title": "Research fundamentals for Docker and Kubernetes",
        "description": "Phase 1: Foundation and Research",
        "status": "PENDING",
        "difficulty": "MEDIUM",
        "xpReward": 45,
        "coinReward": 18
      }
    ]
  }
}
```

---

## 9. Achievement System (Permanent Milestones & Badges)

Achievements are permanent RPG milestones awarded automatically when key events occur (completing tasks, sustaining streaks, leveling up, clearing quests, and claiming challenges). Rewards include bonus XP, coins, player titles, and visual badge identifiers. Unlocks are strictly event-driven and evaluated within transactional boundaries.

### 9.1 List All Achievements
Retrieves the full achievement catalog. If authenticated with a Bearer token, returns the user's progress percentage, unlock status, and unlock timestamp for each achievement. Supports filtering by achievement category type.

* **Method:** `GET`
* **URL:** `/api/v1/achievements` (or `/api/achievements`)
* **Auth Required:** Optional (`Authorization: Bearer <JWT_TOKEN>`)
* **Query Parameters:**
  * `type` (optional string): Filter by category: `TASK`, `STREAK`, `LEVEL`, `PROJECT`, `ECONOMY`, `CHALLENGE`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmty99ach100001j3xd001",
      "code": "FIRST_BLOOD",
      "name": "First Blood",
      "description": "Complete your very first task.",
      "type": "TASK",
      "requirement": {
        "metric": "TASK_COUNT",
        "target": 1
      },
      "rewardXP": 100,
      "rewardCoins": 50,
      "badge": "badge-first-blood",
      "rewardTitle": "Novice Initiate",
      "isUnlocked": true,
      "unlockedAt": "2026-09-12T10:45:00.000Z",
      "progress": {
        "current": 1,
        "target": 1,
        "percentage": 100
      }
    },
    {
      "id": "cmty99ach100001j3xd002",
      "code": "GETTING_SERIOUS",
      "name": "Getting Serious",
      "description": "Achieve a 7-day task streak.",
      "type": "STREAK",
      "requirement": {
        "metric": "STREAK_DAYS",
        "target": 7
      },
      "rewardXP": 350,
      "rewardCoins": 150,
      "badge": "badge-getting-serious",
      "rewardTitle": "Dedicated",
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": {
        "current": 3,
        "target": 7,
        "percentage": 43
      }
    }
  ]
}
```

---

### 9.2 Get My Achievements Summary
Retrieves a personalized summary of the authenticated user's unlocked achievements, completion statistics, and aggregate rewards earned.

* **Method:** `GET`
* **URL:** `/api/v1/achievements/me` (or `/api/achievements/me`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUnlocked": 3,
      "totalAvailable": 15,
      "completionPercentage": 20,
      "totalXPEarned": 850,
      "totalCoinsEarned": 420
    },
    "unlockedAchievements": [
      {
        "id": "cmty99ach100001j3xd001",
        "code": "FIRST_BLOOD",
        "name": "First Blood",
        "description": "Complete your very first task.",
        "type": "TASK",
        "rewardXP": 100,
        "rewardCoins": 50,
        "badge": "badge-first-blood",
        "rewardTitle": "Novice Initiate",
        "unlockedAt": "2026-09-12T10:45:00.000Z"
      }
    ]
  }
}
```

---

### 9.3 Get Achievement Details
Retrieves details of a specific achievement by its unique ID, including the authenticated user's current progress.

* **Method:** `GET`
* **URL:** `/api/v1/achievements/:id` (or `/api/achievements/:id`)
* **Auth Required:** Optional (`Authorization: Bearer <JWT_TOKEN>`)
* **URL Parameters:**
  * `id` (string, required): Achievement UUID / CUID
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmty99ach100001j3xd001",
    "code": "FIRST_BLOOD",
    "name": "First Blood",
    "description": "Complete your very first task.",
    "type": "TASK",
    "requirement": {
      "metric": "TASK_COUNT",
      "target": 1
    },
    "rewardXP": 100,
    "rewardCoins": 50,
    "badge": "badge-first-blood",
    "rewardTitle": "Novice Initiate",
    "isUnlocked": true,
    "unlockedAt": "2026-09-12T10:45:00.000Z",
    "progress": {
      "current": 1,
      "target": 1,
      "percentage": 100
    }
  }
}
```
* **Error Responses:**
  * `404 Not Found`:
  ```json
  {
    "success": false,
    "error": {
      "code": "ACHIEVEMENT_NOT_FOUND",
      "message": "Achievement not found",
      "details": null
    }
  }
  ```

---

## 10. Leaderboard System (Weekly & Lifetime Rankings)

The leaderboard subsystem calculates real-time competitive rankings across adventurers. Weekly rankings aggregate XP gained in the current UTC week via `ActivityLog` (`TASK_COMPLETED`, `PROJECT_COMPLETED`, `CHALLENGE_CLAIMED`, `ACHIEVEMENT_UNLOCKED`, `XP_GAINED`), giving new and active players an equal opportunity to compete.

### 10.1 Global Lifetime Leaderboard
Ranks all adventurers globally by total lifetime character XP.

* **Method:** `GET`
* **URL:** `/api/v1/leaderboard/global` (or `/api/leaderboard/global`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 100 | Maximum number of ranked players to return |

* **Example Request:**
```bash
curl http://localhost:3000/api/v1/leaderboard/global?limit=10 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "cmtya5ip3000ht1xdz9wmoirb",
        "username": "hero_p0_199217",
        "avatarId": "avatar_starter",
        "level": 3
      },
      "xp": 377,
      "currentStreak": 1
    },
    {
      "rank": 2,
      "user": {
        "id": "cmty9qcto000gamxdrwdjym8k",
        "username": "hunter_1789210493525",
        "avatarId": "avatar_starter",
        "level": 3
      },
      "xp": 182,
      "currentStreak": 1
    }
  ]
}
```

---

### 10.2 Global Weekly Leaderboard
Ranks adventurers globally by XP gained within the current UTC week.

* **Method:** `GET`
* **URL:** `/api/v1/leaderboard/weekly` (or `/api/leaderboard/weekly`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 100 | Maximum number of ranked players to return |

* **Example Request:**
```bash
curl http://localhost:3000/api/v1/leaderboard/weekly?limit=10 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "cmtya5ip3000ht1xdz9wmoirb",
        "username": "hero_p0_199217",
        "avatarId": "avatar_starter",
        "level": 3
      },
      "weeklyXP": 430,
      "currentStreak": 1
    },
    {
      "rank": 2,
      "user": {
        "id": "cmty9qcto000gamxdrwdjym8k",
        "username": "hunter_1789210493525",
        "avatarId": "avatar_starter",
        "level": 3
      },
      "weeklyXP": 235,
      "currentStreak": 1
    }
  ]
}
```

---

### 10.3 Friends Weekly Leaderboard
Ranks mutual accepted friends and the requesting authenticated player by weekly XP earned.

* **Method:** `GET`
* **URL:** `/api/v1/leaderboard/friends` (or `/api/leaderboard/friends`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 100 | Maximum number of friend entries to return |

* **Example Request:**
```bash
curl http://localhost:3000/api/v1/leaderboard/friends \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "cmty9qcto000gamxdrwdjym8k",
        "username": "hunter_1789210493525",
        "avatarId": "avatar_starter",
        "level": 3
      },
      "weeklyXP": 235,
      "currentStreak": 1
    }
  ]
}
```

---

### 10.4 Current Player Weekly Rank (`/leaderboard/me`)
Returns the authenticated player's rank, weekly XP earned, and streak on the current weekly leaderboard.

* **Method:** `GET`
* **URL:** `/api/v1/leaderboard/me` (or `/api/leaderboard/me`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Data:** None

* **Example Request:**
```bash
curl http://localhost:3000/api/v1/leaderboard/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK - Ranked):**
```json
{
  "success": true,
  "data": {
    "rank": 3,
    "user": {
      "id": "cmty9qcto000gamxdrwdjym8k",
      "username": "hunter_1789210493525",
      "avatarId": "avatar_starter",
      "level": 3
    },
    "weeklyXP": 235,
    "currentStreak": 1
  }
}
```

* **Success Response (200 OK - Unranked):**
```json
{
  "success": true,
  "data": {
    "rank": null,
    "user": {
      "id": "cmtydz6jq0000zsxdky7vq03k",
      "username": "new_player",
      "avatarId": "avatar_starter",
      "level": 1
    },
    "weeklyXP": 0,
    "currentStreak": 0
  }
}
```

---

## 11. Activity & Player History Subsystem

The activity subsystem provides a chronological event log of the player's life RPG journey. It tracks task completions, quest progression, challenge claims, achievement unlocks, level ups, streak changes, and item acquisitions. The activity feed powers frontend dashboard timelines, recent achievement notifications, XP audits, and the weekly leaderboard.

### 11.1 Paginated Activity Feed
Retrieves the authenticated user's activity feed with pagination, optional activity type filtering, and date range filters.

* **Method:** `GET`
* **URL:** `/api/v1/activity` (or `/api/activity`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | 1 | Page number (min 1) |
| `limit` | integer | No | 20 | Number of entries per page (1-100) |
| `type` | string | No | - | Filter by activity type: `TASK_CREATED`, `TASK_COMPLETED`, `TASK_DELETED`, `PROJECT_CREATED`, `PROJECT_COMPLETED`, `XP_GAINED`, `LEVEL_UP`, `ITEM_PURCHASED`, `ITEM_EQUIPPED`, `STREAK_STARTED`, `STREAK_INCREASED`, `STREAK_BROKEN`, `STREAK_RECOVERED`, `ACHIEVEMENT_UNLOCKED`, `CHALLENGE_CLAIMED` |
| `startDate` | string | No | - | ISO-8601 date string filter (e.g. `2026-09-01T00:00:00Z`) |
| `endDate` | string | No | - | ISO-8601 date string filter |

* **Example Request:**
```bash
curl "http://localhost:3000/api/v1/activity?page=1&limit=10&type=TASK_COMPLETED" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "cmtye8f0a0004zsxd3b91a7c2",
        "type": "TASK_COMPLETED",
        "description": "Completed task: Study System Architecture",
        "xp": 50,
        "coins": 20,
        "metadata": {
          "taskTitle": "Study System Architecture",
          "difficulty": "MEDIUM",
          "attribute": "INTELLECT"
        },
        "createdAt": "2026-09-12T13:40:00.000Z",
        "task": {
          "id": "cmtye8ezy0002zsxd8v01a91a",
          "title": "Study System Architecture",
          "primaryAttribute": "INTELLECT",
          "difficulty": "MEDIUM"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 11.2 Recent Activities Feed
Fetches the player's most recent activity events for quick display on home dashboards, sidebars, or notification dropdowns.

* **Method:** `GET`
* **URL:** `/api/v1/activity/recent` (or `/api/activity/recent`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 10 | Maximum number of recent events to retrieve (1-50) |

* **Example Request:**
```bash
curl "http://localhost:3000/api/v1/activity/recent?limit=5" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmtye8f0a0004zsxd3b91a7c2",
      "type": "TASK_COMPLETED",
      "description": "Completed task: Study System Architecture",
      "xp": 50,
      "coins": 20,
      "metadata": {
        "taskTitle": "Study System Architecture",
        "difficulty": "MEDIUM",
        "attribute": "INTELLECT"
      },
      "createdAt": "2026-09-12T13:40:00.000Z",
      "task": {
        "id": "cmtye8ezy0002zsxd8v01a91a",
        "title": "Study System Architecture",
        "primaryAttribute": "INTELLECT",
        "difficulty": "MEDIUM"
      }
    },
    {
      "id": "cmtye8f0b0005zsxd4c92b8d3",
      "type": "ACHIEVEMENT_UNLOCKED",
      "description": "Unlocked Achievement: First Blood",
      "xp": 100,
      "coins": 50,
      "metadata": {
        "achievementId": "ach_first_blood",
        "achievementName": "First Blood"
      },
      "createdAt": "2026-09-12T13:40:01.000Z"
    }
  ]
}
```

---

### 11.3 Aggregated Activity Statistics
Returns player activity metrics aggregated across a selected time period (`today`, `week`, `month`, or lifetime `all`), including total XP/coins earned, task completion counts, quest completions, and full category breakdowns.

* **Method:** `GET`
* **URL:** `/api/v1/activity/stats` (or `/api/activity/stats`)
* **Auth Required:** Yes
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `period` | string | No | `all` | Time window: `today`, `week`, `month`, or `all` |

* **Example Request:**
```bash
curl "http://localhost:3000/api/v1/activity/stats?period=week" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalActivities": 12,
    "totalXP": 450,
    "totalCoins": 180,
    "tasksCompleted": 8,
    "questsCompleted": 1,
    "challengesClaimed": 2,
    "achievementsUnlocked": 1,
    "breakdown": {
      "TASK_COMPLETED": {
        "count": 8,
        "xp": 300,
        "coins": 120
      },
      "PROJECT_COMPLETED": {
        "count": 1,
        "xp": 50,
        "coins": 30
      },
      "CHALLENGE_CLAIMED": {
        "count": 2,
        "xp": 50,
        "coins": 20
      },
      "ACHIEVEMENT_UNLOCKED": {
        "count": 1,
        "xp": 50,
        "coins": 10
      }
    }
  }
}
```

---

## 12. Common Status Codes

| Status Code | Code Constant | Reason |
|---|---|---|
| `200 OK` | - | Request succeeded |
| `201 Created` | - | Resource created successfully |
| `400 Bad Request` | `VALIDATION_ERROR`, `SELF_FOLLOW_NOT_ALLOWED`, `CHALLENGE_NOT_COMPLETED`, `TASK_ALREADY_COMPLETED`, `QUEST_DIFFICULTY_LOCKED`, `FOREIGN_KEY_VIOLATION` | Invalid input or invalid business action |
| `401 Unauthorized` | `UNAUTHORIZED`, `INVALID_CREDENTIALS` | Missing, invalid, or expired JWT Bearer token |
| `403 Forbidden` | `ACCOUNT_NOT_VERIFIED`, `FORBIDDEN` | Action blocked until email is verified or access denied |
| `404 Not Found` | `USER_NOT_FOUND`, `NOT_FOLLOWING`, `QUEST_NOT_FOUND`, `TASK_NOT_FOUND`, `ACHIEVEMENT_NOT_FOUND`, `RESOURCE_NOT_FOUND`, `CHARACTER_NOT_FOUND` | Target resource does not exist |
| `409 Conflict` | `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `ALREADY_FOLLOWING`, `CHALLENGE_ALREADY_CLAIMED`, `DUPLICATE_RESOURCE` | Uniqueness conflict or duplicate claim |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Rate limit threshold reached |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | Unexpected server condition |


