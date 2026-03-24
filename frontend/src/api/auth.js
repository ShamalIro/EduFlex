import client from './client';

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (email, password) => {
  try {
    const response = await client.post('/users/login', {
      email,
      password
    });

    const { token, user } = response.data.data;

    // Store token and user in localStorage
    localStorage.setItem('eduflex_token', token);
    localStorage.setItem('eduflex_user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

/**
 * Register new user (student or tutor)
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 * @param {'student'|'tutor'} role
 * @returns {Promise<{token: string, user: object}>}
 */
export const register = async (firstName, lastName, email, password, role) => {
  try {
    const response = await client.post('/users/register', {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role
    });

    const { token, user } = response.data.data;

    // Store token and user in localStorage
    localStorage.setItem('eduflex_token', token);
    localStorage.setItem('eduflex_user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  localStorage.removeItem('eduflex_token');
  localStorage.removeItem('eduflex_user');
};
