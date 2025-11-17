// src/contexts/AuthProvider.jsx (ÁTSZERKESZTVE)
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

// Segítség: Használjunk környezeti változót, ha a backend külön URL-en fut
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

// Egyszerű JWT dekódoló (nem biztonságos, csak információkhoz)
function parseJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    console.warn("JWT Payload dekódolási hiba.");
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ÚJ Segédfüggvény: Beállítja a felhasználói állapotot és menti a tokent
  const setAuthUser = (token) => {
    const decoded = parseJwt(token);
    if (decoded && token) {
      const userData = {
        email: decoded.email,
        role: decoded.role,
        token: token,
      };
      setUser(userData);
      localStorage.setItem("token", token);
    } else {
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // Belépés
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      // 👈 API_BASE_URL használat
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Megpróbáljuk kiolvasni a hibaüzenetet, ha van.
      let errorMsg = "Hibás bejelentkezési adatok";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Szerver nem küldött érvényes JSON-t hiba esetén
        errorMsg = `Szerverhiba: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    setAuthUser(data.token); // 👈 setAuthUser használata
  };

  // Regisztráció + automatikus login után
  const register = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      // 👈 API_BASE_URL használat
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMsg = "Regisztráció sikertelen";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    // Sikeres regisztráció után automatikusan belépünk
    await login(email, password);
  };

  // Oldalfrissítéskor token-ből állapot helyreállítás
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthUser(token); // 👈 setAuthUser használata
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
