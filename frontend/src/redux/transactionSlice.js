import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionAPI } from '../services';

// fetchTransactions: transactions ki list API se lata hai (params = page, limit, filters)
export const fetchTransactions = createAsyncThunk('transactions/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await transactionAPI.list(params || {}); // GET /api/transactions
    return res.data.data; // { items, total }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load transactions');
  }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: { list: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items; // transactions list save
        state.total = action.payload.total; // total count save
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;