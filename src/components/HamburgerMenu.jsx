// HamburgerMenu.jsx

// components/HamburgerMenu.jsx

import React, { useState, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import "./HamburgerMenu.css";

// ⚠️ JAVÍTÁS: Fogadja az onOrdersClick propot
export default function HamburgerMenu({
  onProfileClick,
  onAdminClick,
  onUserOrdersClick,
}) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // Segédfüggvény a menü bezárásához és az akció elindításához
  const handleItemClick = (actionFunction) => {
    actionFunction();
    setOpen(false); // Bezárja a menüt
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // Menü elemek role szerint (egyszerűsítve)
  const menuItems =
    user.role === "admin"
      ? [
          // Admin jogosultság esetén csak egy fő Admin Panel link van
          {
            label: "🔧 Admin Panel",
            onClick: onAdminClick,
          },
        ]
      : [
          // A normál felhasználónak a Rendeléseim opciót biztosítjuk
          {
            label: "📦 Rendeléseim",
            onClick: onUserOrdersClick, // ⚠️ MEGHÍVJA A RENDELÉSEIM FUNKCIÓT
          },
        ];

  return (
    <div className="hamburger-menu">
      <button className="icon" onClick={() => setOpen((v) => !v)}>
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="dropdown">
          <div className="user-email">
            {user.email} ({user.role})
          </div>

          {/* 1. PROFIL GOMB */}
          <div className="item" onClick={() => handleItemClick(onProfileClick)}>
            👤 Profilom
          </div>

          {/* 2. TÖBBI MENÜPONT */}
          {menuItems.map((item, i) => (
            <div
              key={i}
              className="item"
              onClick={() => handleItemClick(item.onClick)}
            >
              {item.label}
            </div>
          ))}

          {/* 3. KIJELENTKEZÉS */}
          <div className="logout" onClick={handleLogout}>
            ➡️ Kijelentkezés
          </div>
        </div>
      )}
    </div>
  );
}
