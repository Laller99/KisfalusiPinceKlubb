// Header.jsx (JAVÍTOTT VÁLTOZAT)
import React, { useContext, useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Ez a funkció most már csak a normál Linkekre kattintáskor engedi a menü bezárását,
   * de megakadályozza, hogy a belső gombok, mint a HamburgerMenu menüje, bezárják a headert.
   *
   * @param {React.MouseEvent<HTMLElement>} e
   */
  const handleNavClick = (e) => {
    // 1. Ha a mobil menü zárva van, ne tegyen semmit.
    if (!isMobileMenuOpen) return;

    // 2. Ellenőrizzük, hogy a kattintás egy <Link>-re történt-e.
    // Ezt úgy tesszük, hogy megvizsgáljuk, a kattintott elem <A> tag-e, vagy annak gyermeke.
    const clickedElement = e.target;
    const isLink =
      clickedElement.tagName === "A" || clickedElement.closest("a");

    // 3. Ellenőrizzük, hogy a kattintás a HamburgerMenu komponensre történt-e.
    // Feltételezzük, hogy a HamburgerMenu nem egy Link.
    // A legegyszerűbb, ha megakadályozzuk, hogy a HamburgerMenu ikon/gomb bezárja a menüt.

    // Annak a biztosítása, hogy a menü bezáródjon a fő navigációs Linkekre kattintva:
    if (isLink) {
      // Ha <Link>-re vagy annak tartalmára kattintottunk, akkor zárjuk be a menüt.
      toggleMobileMenu();
    }

    // FIGYELEM: A HamburgerMenu-nek (ami a profilt nyitja) a saját kódjában kell
    // megakadályoznia az eseménybuborékolást (e.stopPropagation())!
    // Ha nem teszi meg, akkor ez a kezelő is lefuthat. A legbiztosabb a 'HamburgerMenu' komponensen belüli javítás.
  };

  return (
    <header className="header">
      {/* 1. Logó és H1 */}
      <div className="logo">
        <img src="Image/PinceLogo.png" alt="" />
      </div>

      {/* 👈 Hamburger gomb (A Fő menü nyitása/zárása) */}
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
        // FELTÉTELES KATTINTÁS KEZELÉS: csak akkor fut le, ha a menü nyitva van.
        // A handleNavClick felel a linkek és egyéb elemek megkülönböztetéséért.
        className={`nav ${isMobileMenuOpen ? "mobile-open" : ""}`}
        onClick={handleNavClick} // 👈 Az új handler
      >
        {/* HASZNÁLD A <Link> KOMPONENSEKET */}
        <Link to="/#hero">Kezdőlap</Link>
        <Link to="/#award-wines">Díjnyertes borok</Link>
        <Link to="/#rolunk">Rólunk</Link>
        <Link to="/#shop">Borok</Link>
        <Link to="/#footer">Kapcsolat</Link>

        {/* 3. Autentikációs elemek */}
        {!user && <button onClick={onLoginClick}>Log in</button>}

        {/* ⚠️ FONTOS: HamburgerMenu komponens: 
           Ha a HamburgerMenu egy lenyitható menü, annak a NYITÓ GOMBJÁN 
           BELÜL KELL E.STOPPROPAGATION()-t használni, hogy ne érje el a nav-ot!
        */}
        {!!user && (
          <HamburgerMenu
            onProfileClick={onProfileClick}
            onAdminClick={onAdminClick}
            onUserOrdersClick={onUserOrdersClick}
            // 💡 Javasolt: A HamburgerMenu-t magát is be kell zárni, miután kiválasztottak egy opciót!
            // Az opció kiválasztása után zárni kell a fő mobil menüt is (toggleMobileMenu hívása).
            // Ezt jelenleg nem teszi meg, de a Linkek sem teszik meg (mivel a Link a handleNavClick-en keresztül zár).
          />
        )}
      </nav>
    </header>
  );
}
