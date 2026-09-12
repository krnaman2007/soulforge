import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  createdAt?: string;
  level: number;
  xp?: number;
  currentStreak: number;
  longestStreak?: number;
  avatarId?: string;
  themeId?: string;
  titleId?: string;
  rankTitle?: string;
  tier?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing: boolean;
  followedAt?: string;
}

export interface SocialState {
  searchResults: { users: PublicProfile[]; pagination: any };
  publicProfile: PublicProfile | null;
  followers: { users: PublicProfile[]; pagination: any };
  following: { users: PublicProfile[]; pagination: any };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SocialState = {
  searchResults: { users: [], pagination: {} },
  publicProfile: null,
  followers: { users: [], pagination: {} },
  following: { users: [], pagination: {} },
  status: 'idle',
  error: null,
};

export const searchUsers = createAsyncThunk(
  'social/searchUsers',
  async (params: { q: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/search', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to search users');
    }
  }
);

export const fetchPublicProfile = createAsyncThunk(
  'social/fetchPublicProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch public profile');
    }
  }
);

export const followUser = createAsyncThunk(
  'social/followUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      return { userId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'social/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/follow`);
      return { userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to unfollow user');
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'social/fetchFollowers',
  async ({ userId, page = 1, limit = 20 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/followers`, { params: { page, limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch followers');
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'social/fetchFollowing',
  async ({ userId, page = 1, limit = 20 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/following`, { params: { page, limit } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch following');
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearPublicProfile: (state) => {
      state.publicProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchPublicProfile
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.publicProfile = action.payload;
      })
      // followUser
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.publicProfile && state.publicProfile.id === action.payload.userId) {
          state.publicProfile.isFollowing = true;
          if (state.publicProfile.followersCount !== undefined) {
            state.publicProfile.followersCount += 1;
          }
        }
        // Update in search results if present
        const searchUser = state.searchResults.users.find(u => u.id === action.payload.userId);
        if (searchUser) searchUser.isFollowing = true;
        
        // Update in followers/following lists if present
        const followerUser = state.followers.users.find(u => u.id === action.payload.userId);
        if (followerUser) followerUser.isFollowing = true;
        
        const followingUser = state.following.users.find(u => u.id === action.payload.userId);
        if (followingUser) followingUser.isFollowing = true;
      })
      // unfollowUser
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.publicProfile && state.publicProfile.id === action.payload.userId) {
          state.publicProfile.isFollowing = false;
          if (state.publicProfile.followersCount !== undefined) {
            state.publicProfile.followersCount = Math.max(0, state.publicProfile.followersCount - 1);
          }
        }
        // Update in search results if present
        const searchUser = state.searchResults.users.find(u => u.id === action.payload.userId);
        if (searchUser) searchUser.isFollowing = false;
        
        // Update in followers/following lists if present
        const followerUser = state.followers.users.find(u => u.id === action.payload.userId);
        if (followerUser) followerUser.isFollowing = false;
        
        const followingUser = state.following.users.find(u => u.id === action.payload.userId);
        if (followingUser) followingUser.isFollowing = false;
      })
      // fetchFollowers
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      // fetchFollowing
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
      });
  },
});

export const { clearPublicProfile } = socialSlice.actions;
export default socialSlice.reducer;
