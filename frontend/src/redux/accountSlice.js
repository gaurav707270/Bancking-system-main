import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountAPI } from '../services';

// fetchAccounts: accounts ki list API se lata hai (params = page, limit, search, type)
export const fetchAccounts = createAsyncThunk('accounts/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await accountAPI.list(params || {}); // GET /api/accounts
    return res.data.data; // { items, total }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load accounts');
  }
});

// fetchAccount: ek single account ki detail (id ke hisaab se)
export const fetchAccount = createAsyncThunk('accounts/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await accountAPI.get(id); // GET /api/accounts/:id
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load account');
  }
});

const accountSlice = createSlice({
  name: 'accounts',
  initialState: { list: [], total: 0, current: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.loading = true; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items; // list save
        state.total = action.payload.total; // total save
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.current = action.payload; // detail wala account
      });
  },
});

export default accountSlice.reducer;