import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [pubkey, setPubkey] = useState('');

  return (
    <AuthContext.Provider value={{ pubkey, setPubkey }}>
      {children}
    </AuthContext.Provider>
  );
};
