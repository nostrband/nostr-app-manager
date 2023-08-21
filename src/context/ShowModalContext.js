import React, { useState, useContext } from 'react';

const AuthContext = React.createContext();

export function useAuthShowModal() {
  return useContext(AuthContext);
}
export function LoginModalProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const value = {
    showLogin,
    setShowLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
