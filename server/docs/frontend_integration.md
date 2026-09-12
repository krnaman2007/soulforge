# Frontend Integration

This document outlines the state of integration between the SoulForge frontend (React/Redux Toolkit) and the backend REST API.

## Overview

The frontend communicates with the backend via a pre-configured Axios instance (`client/src/api/axiosConfig.ts`). This instance handles automatically injecting the `Authorization` header containing the JWT token, which is stored in `localStorage` upon successful authentication.

Redux Toolkit (`@reduxjs/toolkit`) is used to manage the global state of the application. We use `createAsyncThunk` to define asynchronous actions that correspond to backend API endpoints.

## Integrated Features & Slices

The following components and features have been fully integrated with the backend API:

### Authentication (`authSlice`)
*   **Endpoints:** `/auth/register`, `/auth/login`, `/auth/me`
*   **Components:** `Login.tsx`, `Signup.tsx`, `Dashboard.tsx`, `CharacterSheet.tsx`, `ProgressionPath.tsx`
*   **Functionality:** User registration, login, fetching current user profile, managing JWT token, tracking XP, levels, and stats.

### Quests & Projects (`questSlice`)
*   **Endpoints:** `/quests` (GET, POST, PUT, DELETE)
*   **Components:** `Projects.tsx`, `QuestLog.tsx`
*   **Functionality:** Listing available and active quests, creating custom quests, joining quests, tracking quest progress.

### Tasks & Daily Activities (`taskSlice`)
*   **Endpoints:** `/tasks` (GET, POST, PUT, DELETE), `/tasks/:id/complete`
*   **Components:** `QuestLog.tsx`
*   **Functionality:** Listing daily tasks, marking tasks as complete, updating task properties.

### AI Generation (`aiSlice`)
*   **Endpoints:** `/ai/generate-quest`, `/ai/generate-habit`, `/ai/analyze-performance`
*   **Components:** `AIPlanner.tsx`, `HabitChanger.tsx`
*   **Functionality:** Leveraging AI to generate custom structured quests and personalized habits based on user prompts.

### Activity & Statistics (`activitySlice`)
*   **Endpoints:** `/activities`, `/activities/stats`
*   **Components:** `Dashboard.tsx`, `Stats.tsx`
*   **Functionality:** Fetching recent user activities (quest completions, level ups, etc.) and global performance statistics.

### Challenges (`challengeSlice`)
*   **Endpoints:** `/challenges`
*   **Components:** `Dashboard.tsx`
*   **Functionality:** Displaying active global or community challenges.

### Social & Friends (`socialSlice`)
*   **Endpoints:** `/social/friends`, `/social/requests`, `/social/guilds`
*   **Components:** `Friends.tsx`
*   **Functionality:** Viewing friends list, pending friend requests, and guild affiliations.

### Leaderboard (`leaderboardSlice`)
*   **Endpoints:** `/leaderboard/global`, `/leaderboard/friends`, `/leaderboard/weekly`, `/leaderboard/me`
*   **Components:** `Leaderboard.tsx`
*   **Functionality:** Displaying global rankings, friend rankings, and the current user's competitive standing.

### Shop & Inventory (`shopSlice`)
*   **Endpoints:** `/shop`, `/shop/:id/purchase`, `/inventory`, `/inventory/:id/equip`
*   **Components:** `Shop.tsx`
*   **Functionality:** Browsing the shop catalog (avatars, titles, skins, etc.), purchasing items with coins, and viewing available balance.

### Achievements & Titles (`achievementSlice`)
*   **Endpoints:** `/achievements`, `/achievements/me`
*   **Components:** `CharacterSheet.tsx`
*   **Functionality:** Tracking unlocked achievements, displaying equipped titles, and showing progression metrics.

## State Management Pattern

We follow a consistent pattern for data fetching and state updates across the frontend:

1.  **Mounting:** React components dispatch a `fetch...` thunk upon mounting (via `useEffect`).
2.  **Pending State:** The Redux store sets the status to `'loading'`, allowing the component to show skeletons or loaders.
3.  **Fulfilled State:** The API returns data, the thunk dispatches a fulfilled action, and the Redux state is updated. The component re-renders with the live data.
4.  **Error Handling:** If the API request fails, the status is set to `'failed'`, and the error message is stored in the state, which can be presented as a toast or inline error to the user.

## Future Integration Work

- **Real-time Updates:** Implement WebSockets (Socket.io) to receive real-time notifications for friend requests, guild messages, and challenge updates without needing to poll or reload.
- **Enhanced Caching:** Integrate RTK Query for more advanced caching and automatic background refetching.
