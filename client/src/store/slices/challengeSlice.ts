import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Challenge {
  type: string;
  title: string;
  description: string;
  periodKey: string;
  targetCount: number;
  completedCount: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  claimedAt: string | null;
  canClaim: boolean;
  rewards: {
    xp: number;
    coins: number;
  };
}

export interface ChallengeState {
  dailyChallenge: Challenge | null;
  weeklyChallenge: Challenge | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChallengeState = {
  dailyChallenge: null,
  weeklyChallenge: null,
  status: 'idle',
  error: null,
};

export const fetchDailyChallenge = createAsyncThunk(
  'challenges/fetchDailyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/daily');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch daily challenge');
    }
  }
);

export const fetchWeeklyChallenge = createAsyncThunk(
  'challenges/fetchWeeklyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/weekly');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch weekly challenge');
    }
  }
);

export const claimChallenge = createAsyncThunk(
  'challenges/claimChallenge',
  async (type: 'daily' | 'weekly', { rejectWithValue }) => {
    try {
      const response = await api.post(`/challenges/${type}/claim`);
      return { type, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to claim challenge');
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchDailyChallenge
      .addCase(fetchDailyChallenge.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDailyChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dailyChallenge = action.payload;
      })
      .addCase(fetchDailyChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchWeeklyChallenge
      .addCase(fetchWeeklyChallenge.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWeeklyChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.weeklyChallenge = action.payload;
      })
      .addCase(fetchWeeklyChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // claimChallenge
      .addCase(claimChallenge.fulfilled, (state, action) => {
        if (action.payload.type === 'daily' && state.dailyChallenge) {
          state.dailyChallenge.isClaimed = true;
          state.dailyChallenge.canClaim = false;
          state.dailyChallenge.claimedAt = action.payload.data.claim.claimedAt;
        } else if (action.payload.type === 'weekly' && state.weeklyChallenge) {
          state.weeklyChallenge.isClaimed = true;
          state.weeklyChallenge.canClaim = false;
          state.weeklyChallenge.claimedAt = action.payload.data.claim.claimedAt;
        }
      });
  },
});

export default challengeSlice.reducer;
