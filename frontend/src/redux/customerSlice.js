import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerAPI } from '../services';

// fetchCustomers: list wali API call karta hai (page, limit, search params ke saath)
export const fetchCustomers = createAsyncThunk('customers/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await customerAPI.list(params || {}); // GET /api/customers
    return res.data.data; // { items, total }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load customers');
  }
});

// fetchCustomer: ek single customer ki detail lata hai (id ke hisaab se)
export const fetchCustomer = createAsyncThunk('customers/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await customerAPI.get(id); // GET /api/customers/:id
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load customer');
  }
});

const customerSlice = createSlice({
  name: 'customers',
  // State me list, total count, current (detail wala), loading aur error rakhte hain
  initialState: { list: [], total: 0, current: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items; // list save karo
        state.total = action.payload.total; // total count save karo
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.current = action.payload; // detail page wala customer
      });
  },
});

export default customerSlice.reducer;