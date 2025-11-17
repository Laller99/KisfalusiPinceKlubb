// Header.jsx
import React, { useContext } from "react";
// Importáljuk a Link komponenst, hogy a horgony-navigáció működjön (ScrollToHash.jsx-szel)
import { Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import HamburgerMenu from "./HamburgerMenu";
import "./Header.css";
import "./AuthModal.css";
import "./HamburgerMenu.css";

export default function Header({
  onLoginClick,
  onProfileClick,
  onAdminClick,
  // ⚠️ MEGTARTVA: onOrdersClick fogadása a Rendelések modálhoz
  onUserOrdersClick,
}) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      {/* 1. Logó és H1 */}
      <div className="logo">
        <img src="Image/PinceLogo.png" alt="" />
      </div>

      {/* 2. Fő navigációs menü */}
      <nav className="nav">
        {/* HASZNÁLD A <Link> KOMPONENSEKET a ScrollToHash-sal való együttműködéshez */}
        <Link to="/#hero">Kezdőlap</Link>
        <Link to="/#award-wines">Díjnyertes borok</Link>
        <Link to="/#rolunk">Rólunk</Link>
        <Link to="/#shop">Borok</Link>
        <Link to="/#footer">Kapcsolat</Link>

        {/* 3. Autentikációs elemek */}
        {!user && <button onClick={onLoginClick}>Log in</button>}

        {/* ⚠️ FONTOS: onOrdersClick prop továbbítása */}
        {!!user && (
          <HamburgerMenu
            onProfileClick={onProfileClick}
            onAdminClick={onAdminClick}
            onUserOrdersClick={onUserOrdersClick} // Ezt hívja a "Rendeléseim" menüpont
          />
        )}
      </nav>
    </header>
  );
}
