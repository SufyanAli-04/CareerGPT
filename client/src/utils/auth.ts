export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  localStorage.removeItem('careergpt_token');
};

export const clearSessionStorage = (preserveKeys: string[] = []) => {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('careergpt_') || key === 'just_signed_up')) {
      if (preserveKeys.includes(key)) continue;
      sessionStorage.removeItem(key);
    }
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('careergpt_token');
  localStorage.removeItem('careergpt_user');
  clearSessionStorage();
};
