import { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

// AuthContext: ek 'context' object jo login-related info ko
// har component me bhejne ke kaam aata hai (bina props pass kiye).
const AuthContext = createContext(null);

// AuthProvider: iske andar jo bhi component hoga usko
// token, user, isAuthenticated wagera mil jayega.
export function AuthProvider({ children }) {
  // Redux store se auth wala hissa uthao (token, user, loading, error)
  const { token, user, loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  // hasRole: check karta hai ki current user ka role given roles me hai ya nahi
  // Jaise hasRole('admin', 'manager') => true/false
  const hasRole = (...roles) => !!user && roles.includes(user.role);
  // isAdmin: kya user admin hai? (sirf admin role wale ke liye true)
  const isAdmin = hasRole('admin');

  // Ye value har component ko milegi jo useAuth() use karega
  // isAuthenticated = token hai ya nahi (agar token hai to login hai user)
  const value = { token, user, loading, error, isAuthenticated: !!token, isAdmin, hasRole, logout: () => dispatch(logout()) };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth: kisi bhi component me ye function call karo to
// upar wali value mil jayegi. Isi se har jagah login state check hoti hai.
export const useAuth = () => useContext(AuthContext);