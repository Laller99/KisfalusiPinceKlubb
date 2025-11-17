import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Segédfüggvény a JWT payload manuális dekódolásához
// (A Backend által generált tokent dekódolja)
const decodeToken = (token) => {
  if (!token) return null;
  try {
    // JWT token 3 részből áll: header.payload.signature
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    // Visszaadjuk a felhasználói adatokat és a tokent
    return {
      email: decoded.email,
      id: decoded.id || decoded._id,
      role: decoded.role,
      token: token,
    };
  } catch (error) {
    console.error("Token dekódolási hiba:", error);
    // Hibás token esetén töröljük a localStorage-ból
    localStorage.removeItem("token");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⚠️ ÚJ: Betöltési állapot

  // 1. ⚠️ JAVÍTÁS: Automatikus bejelentkezés (Betöltés a localStorage-ból)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      if (decodedUser) {
        setUser(decodedUser);
      }
    }
    setLoading(false); // Befejeződött a token ellenőrzése
  }, []); // Csak egyszer fut le, a komponens mount-olásakor

  // Token alapú bejelentkezés API-hoz kötve
  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Hibás belépési adatok");
    }

    const data = await res.json();
    const decodedUser = decodeToken(data.token); // ⚠️ JAVÍTÁS: decodeToken segédfüggvény használata

    if (decodedUser) {
      setUser(decodedUser);
      localStorage.setItem("token", data.token); // Mentés a localStorage-ba
    } else {
      throw new Error("Sikeres belépés, de hibás token érkezett a szervertől!");
    }
  }

  async function register(email, password) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Nem sikerült a regisztráció");
    }

    // Sikeres regisztráció után automatikusan belépünk
    await login(email, password);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("token");
  }

  // 2. ⚠️ JAVÍTÁS: Betöltőképernyő, amíg az autentikációt ellenőrizzük
  if (loading) {
    // Megakadályozza a villogást, amíg a token ellenőrzése zajlik
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Autentikáció betöltése...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
