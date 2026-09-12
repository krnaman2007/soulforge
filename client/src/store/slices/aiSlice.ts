import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface AiState {
  analysisResult: any | null;
  projectPlan: any | null;
  habitPlan: any | null;
  campaignStatus: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AiState = {
  analysisResult: null,
  projectPlan: null,
  habitPlan: null,
  campaignStatus: null,
  status: 'idle',
  error: null,
};

export const analyzeTask = createAsyncThunk(
  'ai/analyzeTask',
  async (taskData: { title: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/tasks/analyze', taskData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to analyze task');
    }
  }
);

export const planProject = createAsyncThunk(
  'ai/planProject',
  async (goalData: { goal: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/projects/plan', goalData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to plan project');
    }
  }
);

export const planHabit = createAsyncThunk(
  'ai/planHabit',
  async (habitData: { habitGoal: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/habit-plan', habitData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to plan habit');
    }
  }
);

export const generateQuestCampaign = createAsyncThunk(
  'ai/generateQuestCampaign',
  async (campaignData: { goal: string; category?: string; difficulty?: string; autoCreate?: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/quests/generate', campaignData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to generate quest campaign');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAnalysisResult: (state) => {
      state.analysisResult = null;
    },
    clearProjectPlan: (state) => {
      state.projectPlan = null;
    },
    clearHabitPlan: (state) => {
      state.habitPlan = null;
    },
    clearCampaignStatus: (state) => {
      state.campaignStatus = null;
    },
    clearAllAiStates: (state) => {
      state.analysisResult = null;
      state.projectPlan = null;
      state.habitPlan = null;
      state.campaignStatus = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // analyzeTask
      .addCase(analyzeTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(analyzeTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.analysisResult = action.payload;
      })
      .addCase(analyzeTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // planProject
      .addCase(planProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(planProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projectPlan = action.payload;
      })
      .addCase(planProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // planHabit
      .addCase(planHabit.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(planHabit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.habitPlan = action.payload;
      })
      .addCase(planHabit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // generateQuestCampaign
      .addCase(generateQuestCampaign.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(generateQuestCampaign.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campaignStatus = action.payload;
      })
      .addCase(generateQuestCampaign.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalysisResult, clearProjectPlan, clearHabitPlan, clearCampaignStatus, clearAllAiStates } = aiSlice.actions;
export default aiSlice.reducer;
