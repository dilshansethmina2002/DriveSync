// =============================================================
//  Session helpers
//  Member 1's Login page saves:
//    localStorage.token = "<JWT>"
//    localStorage.user  = '{"id":"...","name":"...","email":"...","role":"Customer|Admin"}'
// =============================================================

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

export const isAdmin = (user = getUser()) => String(user?.role || '').toLowerCase() === 'admin';

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/** Read the payload of a JWT (no verification - the backend verifies it) */
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/** true when there is no token or it has expired */
export const isSessionExpired = () => {
  const token = getToken();
  if (!token) return true;
  const payload = decodeToken(token);
  return !payload || (payload.exp && payload.exp * 1000 < Date.now());
};
