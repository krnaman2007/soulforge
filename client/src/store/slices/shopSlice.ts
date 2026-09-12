import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface ShopItem {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  price: number;
  metadata: any;
  isOwned?: boolean;
  isEquipped?: boolean;
  canAfford?: boolean;
}

export interface InventoryItem {
  inventoryId: string;
  itemId: string;
  code: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  equipped: boolean;
  metadata: any;
  purchasedAt: string;
}

export interface ShopState {
  catalog: { items: ShopItem[]; coins: number; total: number } | null;
  inventory: { items: InventoryItem[]; coins: number; total: number; loadout: any } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ShopState = {
  catalog: null,
  inventory: null,
  status: 'idle',
  error: null,
};

export const fetchShopCatalog = createAsyncThunk(
  'shop/fetchCatalog',
  async (params: { type?: string; rarity?: string; minPrice?: number; maxPrice?: number; search?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/shop', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch shop catalog');
    }
  }
);

export const purchaseItem = createAsyncThunk(
  'shop/purchaseItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/shop/${itemId}/purchase`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to purchase item');
    }
  }
);

export const fetchInventory = createAsyncThunk(
  'shop/fetchInventory',
  async (params: { type?: string; equipped?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch inventory');
    }
  }
);

export const equipItem = createAsyncThunk(
  'shop/equipItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/${itemId}/equip`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to equip item');
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchShopCatalog
      .addCase(fetchShopCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShopCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.catalog = action.payload;
      })
      .addCase(fetchShopCatalog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchInventory
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // purchaseItem
      .addCase(purchaseItem.fulfilled, (state, action) => {
        if (state.catalog) {
          state.catalog.coins = action.payload.remainingCoins;
          const itemInCatalog = state.catalog.items.find(i => i.id === action.payload.item.id || i.code === action.payload.item.code);
          if (itemInCatalog) {
            itemInCatalog.isOwned = true;
          }
        }
      })
      // equipItem
      .addCase(equipItem.fulfilled, (state, action) => {
        if (state.inventory) {
          state.inventory.loadout = action.payload.loadout;
          
          // Update equipped status in inventory list
          const itemType = action.payload.item.type;
          state.inventory.items.forEach(item => {
            if (item.type === itemType) {
              item.equipped = (item.itemId === action.payload.item.id || item.code === action.payload.item.code);
            }
          });
        }
        
        if (state.catalog) {
          const itemType = action.payload.item.type;
          state.catalog.items.forEach(item => {
            if (item.type === itemType) {
              item.isEquipped = (item.id === action.payload.item.id || item.code === action.payload.item.code);
            }
          });
        }
      });
  },
});

export default shopSlice.reducer;
