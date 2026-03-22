import client from './client';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await client.get('/users/all', { params });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch users';
    throw new Error(message);
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (userId, is_active) => {
  try {
    const response = await client.put(`/users/${userId}/status`, { is_active });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update user status';
    throw new Error(message);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await client.put(`/users/${userId}/role`, { role });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update user role';
    throw new Error(message);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await client.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete user';
    throw new Error(message);
  }
};