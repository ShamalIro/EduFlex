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

/**
 * Get all pending tutors (awaiting approval)
 */
export const getPendingTutors = async () => {
  try {
    const response = await client.get('/users/pending-tutors');
    return response.data.data.tutors;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pending tutors');
  }
};

/**
 * Approve a tutor account
 */
export const approveTutor = async (userId) => {
  try {
    const response = await client.put(`/users/${userId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve tutor');
  }
};

/**
 * Reject a tutor account
 */
export const rejectTutor = async (userId) => {
  try {
    const response = await client.put(`/users/${userId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject tutor');
  }
 
};