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
  errorCode: string | null;
  unverifiedEmail: string | null;
  resendStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resendMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  character: null,
  token: localStorage.getItem('soulforge_token') || null,
  isAuthenticated: !!localStorage.getItem('soulforge_token'),
  needsUsername: false,
  status: 'idle',
  error: null,
  errorCode: null,
  unverifiedEmail: null,
  resendStatus: 'idle',
  resendMessage: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { ...response.data, email: userData.email };
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
      return rejectWithValue({ message: 'Login failed', code: 'LOGIN_FAILED' });
    } catch (error: any) {
      const errData = error.response?.data?.error;
      const code = errData?.code || 'INVALID_CREDENTIALS';
      const message = errData?.message || 'Invalid email or password';
      const email = errData?.details?.email || credentials.email;
      return rejectWithValue({ message, code, email });
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
      state.errorCode = null;
      state.unverifiedEmail = null;
    },
    setUnverifiedEmail: (state, action: { payload: string | null }) => {
      state.unverifiedEmail = action.payload;
    },
    resetResendStatus: (state) => {
      state.resendStatus = 'idle';
      state.resendMessage = null;
    },
    logoutLocally: (state) => {
      localStorage.removeItem('soulforge_token');
      state.token = null;
      state.user = null;
      state.character = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.unverifiedEmail = null;
      state.errorCode = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(registerUser.fulfilled, (state, action: any) => {
        state.status = 'succeeded';
        state.unverifiedEmail = action.payload?.email || null;
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
        state.errorCode = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.needsUsername = action.payload.needsUsername || false;
        state.isAuthenticated = true;
        state.unverifiedEmail = null;
        state.errorCode = null;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.status = 'failed';
        if (action.payload && typeof action.payload === 'object') {
          state.error = action.payload.message;
          state.errorCode = action.payload.code;
          if (action.payload.code === 'ACCOUNT_NOT_VERIFIED') {
            state.unverifiedEmail = action.payload.email || null;
          }
        } else {
          state.error = (action.payload as string) || 'Login failed';
          state.errorCode = null;
        }
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
        state.unverifiedEmail = null;
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
        state.unverifiedEmail = null;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.character = action.payload.character;
        state.isAuthenticated = true;
        state.unverifiedEmail = null;
        state.errorCode = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Resend Verification
    builder
      .addCase(resendVerification.pending, (state) => {
        state.resendStatus = 'loading';
        state.resendMessage = null;
      })
      .addCase(resendVerification.fulfilled, (state, action: any) => {
        state.resendStatus = 'succeeded';
        state.resendMessage = action.payload?.data?.message || action.payload?.message || 'Verification link has been resent to your email.';
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.resendStatus = 'failed';
        state.resendMessage = (action.payload as string) || 'Failed to resend verification link.';
      });
  },
});

export const { clearError, setUnverifiedEmail, resetResendStatus, logoutLocally } = authSlice.actions;

export default authSlice.reducer;
