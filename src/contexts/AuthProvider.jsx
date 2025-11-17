// src/contexts/AuthProvider.jsx (HIÁNYTALAN KÓD)
import React, { createContext, useState, useEffect, useContext } from "react";
// ⚠️ KÖNYVTÁR: Bár a parseJwt benne van, ha a jwt-decode-ot használjuk, ide kell importálni:
import { jwtDecode } from "jwt-decode";

// ⚠️ ALAPÉRTELMEZETT KONTEXTUS ÉRTÉK HOZZÁADVA (Javasolt)
const AuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
});

// Segítség: Használjunk környezeti változót, ha a backend külön URL-en fut
const API_URL = process.env.REACT_APP_API_URL || "";

// ✅ VÁLTOZTATÁS: Használjuk a jwtDecode-ot a saját parseJwt helyett, hogy elkerüljük a duplikációt.
// Az előző válaszban szereplő parseJwt már nincs a kódban, de a jwtDecode-ot kell használni helyette.
// Hagyjuk itt a parseJwt logikát, ha nincs telepítve a könyvtár, de a best practice a könyvtár használata.
function safeDecodeToken(token) {
  if (!token) return null;
  try {
    // Ha telepítve van a jwt-decode:
    return jwtDecode(token);
  } catch {
    // Fallback a manuális dekódolásra (Ha nincs telepítve a jwt-decode)
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      console.warn("JWT Payload dekódolási hiba.");
      return null;
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // ÚJ Segédfüggvény: Beállítja a felhasználói állapotot és menti a tokent
  const setAuthUser = (token) => {
    const decoded = safeDecodeToken(token); // ✅ setAuthUser a segédfüggvénnyel
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

  // Belépés
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMsg = "Hibás bejelentkezési adatok";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        errorMsg = `Szerverhiba: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    setAuthUser(data.token);
  };

  // Regisztráció + automatikus login után
  const register = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
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
    if (token) setAuthUser(token);
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
