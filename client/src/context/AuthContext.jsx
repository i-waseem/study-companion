import React from 'react';

const AuthContext = React.createContext();
AuthContext.displayName = 'AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = React.useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Default export for compatibility
export default AuthContext;
