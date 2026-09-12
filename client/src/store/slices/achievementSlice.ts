import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  rewardXP: number;
  rewardCoins: number;
  badge: string;
  rewardTitle: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface AchievementSummary {
  totalUnlocked: number;
  totalAvailable: number;
  completionPercentage: number;
  totalXPEarned: number;
  totalCoinsEarned: number;
}

export interface AchievementState {
  allAchievements: Achievement[];
  mySummary: AchievementSummary | null;
  unlockedAchievements: Achievement[];
  achievementDetails: Achievement | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AchievementState = {
  allAchievements: [],
  mySummary: null,
  unlockedAchievements: [],
  achievementDetails: null,
  status: 'idle',
  error: null,
};

export const fetchAllAchievements = createAsyncThunk(
  'achievements/fetchAllAchievements',
  async (type: string | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/achievements', { params: { type } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchMyAchievementsSummary = createAsyncThunk(
  'achievements/fetchMyAchievementsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/achievements/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch achievements summary');
    }
  }
);

export const fetchAchievementDetails = createAsyncThunk(
  'achievements/fetchAchievementDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/achievements/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch achievement details');
    }
  }
);

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAllAchievements
      .addCase(fetchAllAchievements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllAchievements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allAchievements = action.payload;
      })
      .addCase(fetchAllAchievements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchMyAchievementsSummary
      .addCase(fetchMyAchievementsSummary.fulfilled, (state, action) => {
        state.mySummary = action.payload.summary;
        state.unlockedAchievements = action.payload.unlockedAchievements;
      })
      // fetchAchievementDetails
      .addCase(fetchAchievementDetails.fulfilled, (state, action) => {
        state.achievementDetails = action.payload;
      });
  },
});

export default achievementSlice.reducer;
