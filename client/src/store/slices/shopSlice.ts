import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Reward {
  id: string;
  name: string;
  brand: string | null;
  description: string;
  category: 'FOOD' | 'SHOPPING' | 'GAMING' | 'LEARNING' | 'ENTERTAINMENT' | 'TRAVEL' | 'TECH';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  xpCost: number;
  discountValue: string | null;
  totalStock: number | null;
  remainingStock: number | null;
  isFlash: boolean;
  expiresAt: string | null;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  couponCode: string;
  redeemedAt: string;
  expiresAt: string | null;
  isUsed: boolean;
  reward: Reward;
}

interface ShopState {
  rewards: Reward[];
  redemptions: RedeemedReward[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  redemptionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  redemptionError: string | null;
  lastRedeemedCoupon: string | null;
}

const initialState: ShopState = {
  rewards: [],
  redemptions: [],
  status: 'idle',
  error: null,
  redemptionStatus: 'idle',
  redemptionError: null,
  lastRedeemedCoupon: null,
};

export const fetchRewards = createAsyncThunk(
  'shop/fetchRewards',
  async (filters: Record<string, string> = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/shop/rewards?${params}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch rewards');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch rewards');
    }
  }
);

export const fetchRedemptions = createAsyncThunk(
  'shop/fetchRedemptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/shop/redemptions');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch redemptions');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch redemptions');
    }
  }
);

export const redeemReward = createAsyncThunk(
  'shop/redeemReward',
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/shop/rewards/${rewardId}/redeem`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Redemption failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Redemption failed');
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearRedemptionState: (state) => {
      state.redemptionStatus = 'idle';
      state.redemptionError = null;
      state.lastRedeemedCoupon = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rewards = action.payload;
        state.error = null;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.redemptions = action.payload;
      })
      .addCase(redeemReward.pending, (state) => {
        state.redemptionStatus = 'loading';
        state.redemptionError = null;
        state.lastRedeemedCoupon = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.redemptionStatus = 'succeeded';
        state.redemptionError = null;
        state.lastRedeemedCoupon = action.payload.couponCode;
        state.redemptions = [action.payload, ...state.redemptions];
        
        // Update reward remaining stock locally to be responsive
        const reward = state.rewards.find(r => r.id === action.payload.rewardId);
        if (reward && reward.remainingStock !== null) {
          reward.remainingStock = Math.max(0, reward.remainingStock - 1);
        }
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.redemptionStatus = 'failed';
        state.redemptionError = action.payload as string;
      });
  },
});

export const { clearRedemptionState } = shopSlice.actions;
export default shopSlice.reducer;
