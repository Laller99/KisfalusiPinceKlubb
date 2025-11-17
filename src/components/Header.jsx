// Header.jsx
import React, { useContext, useState } from "react";
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
  onUserOrdersClick,
}) {
  const { user, logout } = useContext(AuthContext);
  // Állapot a mobil menü nyitott/zárt állapotához
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Funkció a menü váltásához
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      {/* 1. Logó és H1 */}
      <div className="logo">
        <img src="Image/PinceLogo.png" alt="" />
      </div>

      {/* 👈 ÚJ: Hamburger gomb a fő navigációhoz (csak mobilon látszik a CSS szerint) */}
      <button
        className={`hamburger-toggle ${isMobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="main-nav"
        aria-label="Menü megnyitása/bezárása"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* 2. Fő navigációs menü */}
      <nav
        id="main-nav"
        // Hozzáadjuk a 'mobile-open' osztályt, ha nyitva van. A CSS kezeli a megjelenést.
        className={`nav ${isMobileMenuOpen ? "mobile-open" : ""}`}
        // Ha mobil nézetben linkre kattintanak (ami bezárja a menüt a kattintás után), zárjuk be a menüt
        onClick={() => isMobileMenuOpen && toggleMobileMenu()}
      >
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
