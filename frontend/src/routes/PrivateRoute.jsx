import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PrivateRoute: ye check karta hai ki user login hai ya nahi.
// Agar login hai => <Outlet /> matlab andar wale pages render karo.
// Agar login nahi hai => user ko /login par bhej do.
export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// RoleRoute: sirf khaas roles wale users ko page khulne deta hai.
// roles ek array hai, jaise ['admin', 'manager'].
export function RoleRoute({ roles, children }) {
  const { isAuthenticated, hasRole } = useAuth();
  // Pehle login check: login nahi to /login par bhej do
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Phir role check: role match nahi karta to dashboard par bhej do
  if (!hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  // Sab check pass ho gaya to jo page dena hai wahi dikhao
  return children;
}