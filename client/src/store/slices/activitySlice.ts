import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Activity {
  id: string;
  type: string;
  description: string;
  xp?: number;
  coins?: number;
  metadata?: any;
  createdAt: string;
  task?: any;
}

export interface ActivityStats {
  period: string;
  totalActivities: number;
  totalXP: number;
  totalCoins: number;
  tasksCompleted: number;
  questsCompleted: number;
  challengesClaimed: number;
  achievementsUnlocked: number;
  breakdown: Record<string, { count: number; xp: number; coins: number }>;
}

export interface ActivityAnalytics {
  xpTrajectory: { day: string; xp: number }[];
  activityDensity: number[];
  operationalMatrix: (number | null)[][];
  currentMonthLabel: string;
  peakVelocity: number;
}

export interface ActivityState {
  feed: { activities: Activity[]; pagination: any };
  recent: Activity[];
  stats: ActivityStats | null;
  analytics: ActivityAnalytics | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ActivityState = {
  feed: { activities: [], pagination: {} },
  recent: [],
  stats: null,
  analytics: null,
  status: 'idle',
  error: null,
};

export const fetchActivityFeed = createAsyncThunk(
  'activity/fetchFeed',
  async (params: { page?: number; limit?: number; type?: string; startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/activity', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch activity feed');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'activity/fetchRecent',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await api.get('/activity/recent', { params: { limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch recent activities');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'activity/fetchStats',
  async (period: 'today' | 'week' | 'month' | 'all' = 'week', { rejectWithValue }) => {
    try {
      const response = await api.get('/activity/stats', { params: { period } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch activity stats');
    }
  }
);

export const fetchActivityAnalytics = createAsyncThunk(
  'activity/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/activity/analytics');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch activity analytics');
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(fetchActivityFeed.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActivityFeed.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.feed = action.payload;
      })
      .addCase(fetchActivityFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Recent
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recent = action.payload;
      })
      // Stats
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Analytics
      .addCase(fetchActivityAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export default activitySlice.reducer;
