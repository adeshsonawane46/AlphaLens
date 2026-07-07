import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const savedUser = localStorage.getItem('alphalens_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const defaultUser = { id: 1, email: 'guest@alphalens.ai', fullName: 'Guest User', role: 'Guest Access' };
      setUser(defaultUser);
      localStorage.setItem('alphalens_user', JSON.stringify(defaultUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('alphalens_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alphalens_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
