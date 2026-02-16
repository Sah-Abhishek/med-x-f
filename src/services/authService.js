import api from './api';

/**
 * Login with username and password
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email: email,
    password
  });
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Get current user information
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

/**
 * Create new user (admin only)
 */
export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

/**
 * Update user (admin only)
 */
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};
