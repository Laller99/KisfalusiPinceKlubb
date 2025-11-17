// src/contexts/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

// Egyszerű JWT dekódoló (nem biztonságos, csak információkhoz)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Belépés
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Hibás bejelentkezési adatok");
    const data = await res.json();
    const decoded = parseJwt(data.token);
    setUser({ email: decoded.email, role: decoded.role, token: data.token });
    localStorage.setItem("token", data.token);
  };

  // Regisztráció + automatikus login után
  const register = async (email, password) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Regisztráció sikertelen");
    await login(email, password);
  };

  // Kijelentkezés
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // Oldalfrissítéskor token-ből állapot helyreállítás
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) setUser({ email: decoded.email, role: decoded.role, token });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Egyszerű hook a kontextus használatához
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
