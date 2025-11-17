// VineyardWebsite.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VineyardWebsite.css";
import LayeredHero from "./LayeredHero";
import AwardWinesSection from "./AwardWinesSection";
import AboutUs from "./AboutUs";
import FeedbackSystem from "./FeedbacckSystem";
import HarvestSimulation from "./HarvestSimulation";
import WineStore from "./WineStore";
import Footer from "./Footer";
import Header from "./Header";
import AuthModal from "./AuthModal";
import ProfilePage from "./ProfilePage";
import AdminPanel from "./AdminPanel";
import { AuthProvider } from "../contexts/AuthContext";
import ScrollToHash from "./ScrollToHash";
import UserOrdersPage from "./UserOrdersPage";

import "./HarvestSimulation.css";
import "./Borok.css";

const MainView = () => (
  <>
    {/* ... MainView tartalom változatlan ... */}
    <LayeredHero />
    <AwardWinesSection />
    <AboutUs />
    <HarvestSimulation />
    <WineStore />
    <FeedbackSystem />
    <Footer />
  </>
);

const WebsiteContent = () => {
  // --- ÁLLAPOTKEZELÉS ---
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showOrders, setShowOrders] = useState(false); // Rendelések modál állapota
  const navigate = useNavigate();

  // --- ESEMÉNYKEZELŐK ---

  const handleProfileClick = () => {
    setAuthModalOpen(false);
    setShowProfile(true);
    navigate("/profile");
  };

  const handleAdminClick = () => {
    setAuthModalOpen(false);
    setShowAdminPanel(true);
    navigate("/admin");
  };

  // 🔑 JAVÍTVA: Megnyitja a Rendelések modált (amikor a Headerből kattintanak)
  const handleOrdersClick = () => {
    setAuthModalOpen(false);
    setShowOrders(true); // 👈 Modál megjelenítése
    navigate("/orders");
  };

  // 🔑 PÓTOLVA: Függvény a Rendelések modál bezárásához
  const handleCloseOrders = () => {
    setShowOrders(false);
    navigate("/");
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    navigate("/");
  };

  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
    navigate("/");
  };

  // --- EFFECT a Scroll letiltására ---
  useEffect(() => {
    const isAnyOverlayOpen =
      showProfile || showAdminPanel || showOrders || authModalOpen;

    if (isAnyOverlayOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [showProfile, showAdminPanel, showOrders, authModalOpen]);

  // --- RENDERELÉS ---

  return (
    <AuthProvider>
      <ScrollToHash />
      <Header
        onLoginClick={() => setAuthModalOpen(true)}
        onProfileClick={handleProfileClick}
        onAdminClick={handleAdminClick}
        onUserOrdersClick={handleOrdersClick} // Használja a javított funkciót
      />

      <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* FŐ TARTALOM (MINDIG RENDERELVE) */}
      <MainView />

      {/* MODÁLOK/OVERLAY-EK (FELTÉTELES RENDERELÉS) */}

      {/* 🔑 JAVÍTVA: Átadjuk a propot a Rendelések nézet megnyitásához */}
      {showProfile && (
        <ProfilePage
          onClose={handleCloseProfile}
          onViewOrders={() => {
            setShowProfile(false); // Lezárja a ProfilePage-et
            setShowOrders(true); // Megnyitja a Rendelések oldalt
            navigate("/orders"); // Frissíti az URL-t
          }}
        />
      )}

      {showAdminPanel && <AdminPanel onClose={handleCloseAdmin} />}

      {/* Rendelések modál megjelenítése (most már a state nyitja meg) */}
      {showOrders && <UserOrdersPage onClose={handleCloseOrders} />}
    </AuthProvider>
  );
};

export default WebsiteContent;
