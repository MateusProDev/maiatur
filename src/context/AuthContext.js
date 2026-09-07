// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (!isAdminRoute) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
