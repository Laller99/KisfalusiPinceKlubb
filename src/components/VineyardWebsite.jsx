import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WebsiteContent from "./WebsiteContent";
import "./VineyardWebsite.css";


const HAS_ENTERED_KEY = "hasEnteredIntro";

function VineyardWebsite() {
  
  const [hasVisited, setHasVisited] = useState(
    sessionStorage.getItem(HAS_ENTERED_KEY) === "true"
  );
  
  const [isEntering, setIsEntering] = useState(false);

  
  const [isContentReady, setIsContentReady] = useState(hasVisited);
  const [leavesFall, setLeavesFall] = useState(hasVisited);

  const location = useLocation();

  
  const handleEnter = () => {
    
    setIsEntering(true);

   
    sessionStorage.setItem(HAS_ENTERED_KEY, "true");

   
    const contentTimer = setTimeout(() => {
      setIsContentReady(true);
      setHasVisited(true); // Ezt a SessionStorage kulcsot kell frissíteni
    }, 2500); // Intro animáció időtartama

    return () => clearTimeout(contentTimer);
  };

  // 3. LEVELEK ANIMÁCIÓJÁNAK KÉSLELTETÉSE
  useEffect(() => {
    if (isEntering && !leavesFall) {
      const leavesTimer = setTimeout(() => {
        setLeavesFall(true);
      }, 2000); // 2 másodperc múlva indítjuk a levelek hullását

      return () => clearTimeout(leavesTimer);
    }
  }, [isEntering, leavesFall]);

  // 4. SCROLL FIX REACT ROUTER NAVIGÁCIÓ UTÁN
  useEffect(() => {
    // Csak akkor görgetünk a tetejére, ha nem horgonyra váltunk (/profile -> /)
    if (hasVisited && location.pathname !== "/" && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, hasVisited, location.hash]);

  // CSS osztályok dinamikus beállítása
  // Ha már látogatta, akkor már alapból átlátszó, de az animációt csak az isEntering kapja
  const overlayClass = `intro-overlay ${isEntering ? "is-transparent" : ""}`;
  const lightClass = `light-source ${isEntering ? "animate-to-sun" : ""}`;

  // A borítás végleges eltüntetése, ha már belépett VAGY lefutott az animáció
  const hideOverlay = hasVisited || isContentReady;

  // Ha már belépett a session-ben, a tartalom azonnal látható
  const shouldShowContent = isContentReady || hasVisited;

  return (
    <div className="app-container">
      {/* 1. LÁTHATÓ TARTALOM: A teljes weboldal */}
      <div className={`page-content ${shouldShowContent ? "is-visible" : ""}`}>
        {shouldShowContent ? (
          <WebsiteContent />
        ) : (
          /* Helykitöltő az animáció alatt */
          <div
            style={{
              height: "100vh",
              background:
                "linear-gradient(180deg, rgba(90, 42, 39, 0.6), rgba(43, 27, 27, 0.8))",
            }}
          ></div>
        )}
      </div>

      {/* 2. HULLÓ LEVELEK ANIMÁCIÓJA */}
      {leavesFall && (
        <div className="leaves-container">
          {/* ... levelek renderelése (változatlan) ... */}
          {[...Array(20)].map((_, i) => (
            <img
              key={i}
              src="Image/leaf.png"
              alt={`Leaf ${i}`}
              className="leaf"
              style={{
                position: "absolute",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 3. INTRO KÉPERNYŐ: CSAK AKKOR JELENIK MEG, HA MÉG NEM LÉPETT BE */}
      {/* Ha már belépett, nem jelenítjük meg, így a router navigációja során sem kerül a tartalom fölé. */}
      {!hideOverlay && (
        <div className={overlayClass}>
          <div className="belépő">
            <img src="Image/PinceLogo.png" alt="" />
          </div>
          {/* A fényforrást szimbolizáló elem */}
          <div className={lightClass}></div>

          {/* A Belépek gomb */}
          {!isEntering && (
            <button className="enter-button" onClick={handleEnter}>
              Belépek
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VineyardWebsite;
