import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  difficulty: string;
  status: string;
  xpReward: number;
  coinReward: number;
  dueDate: string | null;
  projectId: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface TaskState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  status: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: { title: string; description?: string; dueDate?: string; projectId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (data: { id: string; title?: string; description?: string; dueDate?: string }, { rejectWithValue }) => {
    try {
      const { id, ...updates } = data;
      const response = await api.patch(`/tasks/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${id}/complete`);
      return response.data.data; // Contains task, rewards, character, levelUp, streak, achievementsUnlocked
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to complete task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
      })
      // completeTask
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload.task };
        }
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export default taskSlice.reducer;
