import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface LeaderboardUser {
  id: string;
  username: string;
  avatarId?: string;
  level: number;
}

export interface LeaderboardEntry {
  rank: number | null;
  user: LeaderboardUser;
  xp?: number;
  weeklyXP?: number;
  currentStreak: number;
}

export interface LeaderboardState {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LeaderboardState = {
  global: [],
  weekly: [],
  friends: [],
  me: null,
  status: 'idle',
  error: null,
};

export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard/global', { params: { limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch global leaderboard');
    }
  }
);

export const fetchWeeklyLeaderboard = createAsyncThunk(
  'leaderboard/fetchWeekly',
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard/weekly', { params: { limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch weekly leaderboard');
    }
  }
);

export const fetchFriendsLeaderboard = createAsyncThunk(
  'leaderboard/fetchFriends',
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard/friends', { params: { limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch friends leaderboard');
    }
  }
);

export const fetchMyLeaderboardRank = createAsyncThunk(
  'leaderboard/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch my rank');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Global
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.global = action.payload;
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Weekly
      .addCase(fetchWeeklyLeaderboard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWeeklyLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.weekly = action.payload;
      })
      .addCase(fetchWeeklyLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Friends
      .addCase(fetchFriendsLeaderboard.fulfilled, (state, action) => {
        state.friends = action.payload;
      })
      // Me
      .addCase(fetchMyLeaderboardRank.fulfilled, (state, action) => {
        state.me = action.payload;
      });
  },
});

export default leaderboardSlice.reducer;
