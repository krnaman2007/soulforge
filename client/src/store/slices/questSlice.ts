import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';
import { Task } from './taskSlice';

export interface Quest {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  type: string;
  status: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  bonusXP: number;
  bonusCoins: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface QuestState {
  quests: Quest[];
  currentQuest: Quest | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuestState = {
  quests: [],
  currentQuest: null,
  status: 'idle',
  error: null,
};

export const fetchQuests = createAsyncThunk(
  'quests/fetchQuests',
  async (params: { page?: number; limit?: number; status?: string; category?: string; difficulty?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/quests', { params });
      return response.data.data.quests;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch quests');
    }
  }
);

export const createQuest = createAsyncThunk(
  'quests/createQuest',
  async (questData: { name: string; description?: string; category?: string; difficulty?: string; type?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/quests', questData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create quest');
    }
  }
);

export const fetchQuestById = createAsyncThunk(
  'quests/fetchQuestById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quests/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch quest details');
    }
  }
);

export const fetchQuestProgress = createAsyncThunk(
  'quests/fetchQuestProgress',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quests/${id}/progress`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch quest progress');
    }
  }
);

export const updateQuest = createAsyncThunk(
  'quests/updateQuest',
  async (data: { id: string; name?: string; description?: string; category?: string; difficulty?: string; type?: string; status?: string }, { rejectWithValue }) => {
    try {
      const { id, ...updates } = data;
      const response = await api.patch(`/quests/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update quest');
    }
  }
);

export const deleteQuest = createAsyncThunk(
  'quests/deleteQuest',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/quests/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete quest');
    }
  }
);

const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    clearCurrentQuest: (state) => {
      state.currentQuest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchQuests
      .addCase(fetchQuests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quests = action.payload;
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createQuest
      .addCase(createQuest.fulfilled, (state, action) => {
        state.quests.unshift(action.payload);
      })
      // fetchQuestById
      .addCase(fetchQuestById.fulfilled, (state, action) => {
        state.currentQuest = action.payload;
      })
      // fetchQuestProgress
      .addCase(fetchQuestProgress.fulfilled, (state, action) => {
        // We can update currentQuest or just a specific quest in the list
        if (state.currentQuest?.id === action.payload.id) {
          state.currentQuest = { ...state.currentQuest, ...action.payload };
        }
        const index = state.quests.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.quests[index] = { ...state.quests[index], ...action.payload };
        }
      })
      // updateQuest
      .addCase(updateQuest.fulfilled, (state, action) => {
        const index = state.quests.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.quests[index] = { ...state.quests[index], ...action.payload };
        }
        if (state.currentQuest?.id === action.payload.id) {
          state.currentQuest = { ...state.currentQuest, ...action.payload };
        }
      })
      // deleteQuest
      .addCase(deleteQuest.fulfilled, (state, action) => {
        state.quests = state.quests.filter((q) => q.id !== action.payload);
        if (state.currentQuest?.id === action.payload) {
          state.currentQuest = null;
        }
      });
  },
});

export const { clearCurrentQuest } = questSlice.actions;

export default questSlice.reducer;
