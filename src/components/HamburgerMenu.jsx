// components/HamburgerMenu.jsx (JAVÍTVA: A menü nyitva marad az akciók után)

import React, { useState, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import "./HamburgerMenu.css";

export default function HamburgerMenu({
  onProfileClick,
  onAdminClick,
  onUserOrdersClick,
}) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // ⚠️ JAVÍTÁS: Eltávolítva a setOpen(false); a menü nyitva tartásához.
  const handleItemClick = (actionFunction, e) => {
    // 💡 FONTOS: Megakadályozzuk, hogy a kattintás tovább buborékoljon a Header.jsx-ben lévő nav-ra.
    // Így elkerüljük, hogy a fő mobil menü bezáródjon.
    e.stopPropagation();
    actionFunction();
    // setOpen(false); <- EZ HIÁNYZIK MOST! A menü NYITVA MARAD.
  };

  const handleLogout = (e) => {
    e.stopPropagation(); // Buborékolás megállítása
    logout();
    setOpen(false); // Kijelentkezéskor bezárjuk a menüt
  };

  // A HamburgerMenu nyitó ikonjának kezelője
  const handleIconClick = (e) => {
    e.stopPropagation(); // Fontos: Megakadályozzuk a fő nav bezárását, ha rákattintunk
    setOpen((v) => !v);
  };

  // Menü elemek role szerint (egyszerűsítve)
  const menuItems =
    user.role === "admin"
      ? [
          {
            label: "🔧 Admin Panel",
            onClick: onAdminClick,
          },
        ]
      : [
          {
            label: "📦 Rendeléseim",
            onClick: onUserOrdersClick,
          },
        ];

  return (
    <div className="hamburger-menu">
      <button className="icon" onClick={handleIconClick}>
        {" "}
        {/* 👈 Az új handler */}
        <span />
        <span />
        <span />
      </button>
      {open && (
        // 💡 JAVÍTÁS: A lenyíló területre is érdemes tenni stopPropagationt,
        // hogy a menü területére kattintás ne zárja be a fő mobil menüt.
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="user-email">
            {user.email} ({user.role})
          </div>

          {/* 1. PROFIL GOMB */}
          <div
            className="item"
            onClick={(e) => handleItemClick(onProfileClick, e)} // 👈 e.stopPropagation() bevezetése
          >
            👤 Profilom
          </div>

          {/* 2. TÖBBI MENÜPONT */}
          {menuItems.map((item, i) => (
            <div
              key={i}
              className="item"
              onClick={(e) => handleItemClick(item.onClick, e)} // 👈 e.stopPropagation() bevezetése
            >
              {item.label}
            </div>
          ))}

          {/* 3. KIJELENTKEZÉS */}
          <div className="logout" onClick={handleLogout}>
            {" "}
            {/* 👈 handleLogout használata */}
            ➡️ Kijelentkezés
          </div>
        </div>
      )}
    </div>
  );
}
