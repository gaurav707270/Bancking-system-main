import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services';

// createAsyncThunk: ek async action banata hai jo API call karta hai.
// login action call karne par ye backend se token + user le aayega.
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(credentials); // POST /api/auth/login
    // Token aur user ko browser ke localStorage me save karo
    // taaki page refresh hone par bhi login yaad rahe
    localStorage.setItem('token', res.data.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
    return res.data.data; // ye data action.payload me milega
  } catch (err) {
    // Error aaye to rejectWithValue me message bhejo (toast me dikhane ke liye)
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

// Page load par pehle se saved user ko padho (agar localStorage me hai to)
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

const authSlice = createSlice({
  name: 'auth',
  // Initial state: token aur user localStorage se, baaki empty
  initialState: {
    token: localStorage.getItem('token') || null,
    user: storedUser,
    loading: false,
    error: null,
  },
  reducers: {
    // logout: user ko empty karo aur localStorage se bhi hata do
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // clearError: error message saaf karo
    clearError: (state) => {
      state.error = null;
    },
  },
  // extraReducers: async action (login) ke teen stages handle karta hai:
  // pending (shuru), fulfilled (success), rejected (fail)
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;   // loading spinner dikhao
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token; // login ho gaya
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // error message store me rakho
      });
  },
});

// Ye actions ko export karo taaki components dispatch kar sake
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;