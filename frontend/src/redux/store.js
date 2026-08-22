import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import customerReducer from './customerSlice';
import accountReducer from './accountSlice';
import transactionReducer from './transactionSlice';

// Redux Store = app ka central data ka dabba.
// Har slice ek hissa rakhti hai: auth, customers, accounts, transactions.
export const store = configureStore({
  reducer: {
    auth: authReducer,           // login state (token, user)
    customers: customerReducer,  // customer list data
    accounts: accountReducer,    // account list data
    transactions: transactionReducer, // transaction list data
  },
});