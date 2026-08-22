import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';

// ReactDOM ka 'createRoot' ek naya React root banata hai
// aur usko HTML ke 'root' element se jodta hai (index.html me <div id="root">)
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: development me extra checks chalata hai (safe hai production me bhi)
  <React.StrictMode>
    {/* Provider: Redux ka store poori app ko deta hai, taaki koi bhi component use kar sake */}
    <Provider store={store}>
      {/* BrowserRouter: URL based routing enable karta hai (localhost:5173/dashboard wagera) */}
      <BrowserRouter>
        {/* AuthProvider: login/logout state aur user info har component ko provide karta hai */}
        <AuthProvider>
          {/* App = main routing setup (routes/AppRoutes.jsx) */}
          <App />
          {/* ToastContainer: success/error wale popup notifications yahan render hote hain */}
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);