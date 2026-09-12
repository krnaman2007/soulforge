import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import questReducer from './slices/questSlice';
import socialReducer from './slices/socialSlice';
import aiReducer from './slices/aiSlice';
import challengeReducer from './slices/challengeSlice';
import achievementReducer from './slices/achievementSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import activityReducer from './slices/activitySlice';
import shopReducer from './slices/shopSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    quests: questReducer,
    social: socialReducer,
    ai: aiReducer,
    challenges: challengeReducer,
    achievements: achievementReducer,
    leaderboard: leaderboardReducer,
    activity: activityReducer,
    shop: shopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

