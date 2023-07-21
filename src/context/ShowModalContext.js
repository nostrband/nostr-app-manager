import React, { useState, useContext } from 'react';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const value = {
    showLogin,
    setShowLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
