import api from './api';

// Ye file auth (login/user) se related API functions rakhti hai.
// Note: same functions services/index.js me bhi hain — components wahan se import karte hain.
// Yeh file backup/alternative import ke liye hai.

export const authAPI = {
  login: (data) => api.post('/auth/login', data),              // user login (email + password)
  register: (data) => api.post('/auth/register', data),        // naya user register (employee add)
  changePassword: (data) => api.put('/auth/change-password', data), // current password + new password
  profile: () => api.get('/auth/profile'),                     // logged-in user ki info
  listUsers: () => api.get('/auth/users'),                     // saare users ki list
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),// user ko update karo (active toggle)
  deleteUser: (id) => api.delete(`/auth/users/${id}`),         // user delete
  demoUsers: () => api.get('/auth/demo-users'),                // demo users ki list (dev/testing ke liye)
};