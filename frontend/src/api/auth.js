const MOCK_USERS = [
  {
    id: '1',
    name: 'Alex Student',
    email: 'student@edu.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Sarah Tutor',
    email: 'tutor@edu.com',
    role: 'tutor',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@edu.com',
    role: 'admin',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: import('../types').User}>}
 */
export const login = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find((u) => u.email === email);

  if (user && password === 'password') {
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem('eduflex_token', token);
    localStorage.setItem('eduflex_user', JSON.stringify(user));
    return { token, user };
  }

  throw new Error('Invalid credentials');
};

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {'student'|'tutor'} role
 * @returns {Promise<{token: string, user: import('../types').User}>}
 */
export const register = async (name, email, password, role) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    role,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  };

  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  localStorage.setItem('eduflex_token', token);
  localStorage.setItem('eduflex_user', JSON.stringify(newUser));

  return { token, user: newUser };
};

/**
 * @returns {Promise<void>}
 */
export const logout = async () => {
  localStorage.removeItem('eduflex_token');
  localStorage.removeItem('eduflex_user');
};
