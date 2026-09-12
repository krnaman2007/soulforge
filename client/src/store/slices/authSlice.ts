import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface User {
  id: string;
  email: string;
  username: string | null;
  name: string;
  isVerified: boolean;
}

export interface Character {
  level: number;
  xp: number;
  coins: number;
  strength?: number;
  intellect?: number;
  discipline?: number;
  health?: number;
  creativity?: number;
  social?: number;
  currentStreak?: number;
  longestStreak?: number;
  avatarId?: string;
  themeId?: string;
  titleId?: string;
}

export interface AuthState {
  user: User | null;
  character: Character | null;
  token: string | null;
  isAuthenticated: boolean;
  needsUsername: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  character: null,
  token: localStorage.getItem('soulforge_token') || null,
  isAuthenticated: !!localStorage.getItem('soulforge_token'),
  needsUsername: false,
  status: 'idle',
  error: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data; // Note: Register doesn't return token immediately in the current API, it sends an email
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('soulforge_token', response.data.data.token);
        return response.data.data;
      }
      return rejectWithValue('Login failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Invalid credentials');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch user');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // API call to invalidate session on backend if supported
      await api.post('/auth/logout').catch(() => {});
      localStorage.removeItem('soulforge_token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      if (response.data.success) {
        localStorage.setItem('soulforge_token', response.data.data.token);
        return response.data.data;
      }
      return rejectWithValue('Verification failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Verification failed');
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to resend verification');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/google',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      if (response.data.success) {
        localStorage.setItem('soulforge_token', response.data.data.token);
        return response.data.data;
      }
      return rejectWithValue('Google login failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Google login failed');
    }
  }
);

export const claimUsername = createAsyncThunk(
  'auth/claimUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/username', { username });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to claim username');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to claim username');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logoutLocally: (state) => {
      localStorage.removeItem('soulforge_token');
      state.token = null;
      state.user = null;
      state.character = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        // After registration, user must check email (based on endpoints.md)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.needsUsername = action.payload.needsUsername || false;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.needsUsername = action.payload.needsUsername || false;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Claim Username
    builder
      .addCase(claimUsername.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(claimUsername.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.needsUsername = false;
      })
      .addCase(claimUsername.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.needsUsername = action.payload.needsUsername || false;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.character = null;
        localStorage.removeItem('soulforge_token');
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.character = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.isAuthenticated = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logoutLocally } = authSlice.actions;

export default authSlice.reducer;
