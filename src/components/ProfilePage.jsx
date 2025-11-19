// components/ProfilePage.jsx

import React, { useContext, useState, useEffect } from "react"; // 🚨 useEffect importálva
import AuthContext from "../contexts/AuthContext";
import "./ProfilePage.css";

const API_USER_URL = "https://kisfalusipinceklubb.onrender.com/api/user";

// 🔑 JAVÍTVA: Hozzáadtuk az onViewOrders propot a nézetváltáshoz
export default function ProfilePage({ onClose, onViewOrders }) {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Siker üzenet

  // --- ÁLLAPOTOK A SZERKESZTÉSHEZ ---
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  // Profil adatainak lekérése
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${API_USER_URL}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nem sikerült lekérni a profilt.");
      }

      setProfileData(data);
      setEditForm({ email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // --- PROFIL FRISSÍTÉS LOGIKA (E-MAIL) ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_USER_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ email: editForm.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Hiba az adatok frissítésekor.");
      }

      setProfileData(data);
      setIsEditing(false);
      setMessage("✅ Profil sikeresen frissítve!");
    } catch (err) {
      setError(err.message);
    }
  };

  // --- JELSZÓ MÓDOSÍTÁS LOGIKA ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (passwordForm.newPassword.length < 6) {
      setError("Az új jelszó legalább 6 karakter kell legyen.");
      return;
    }

    try {
      const response = await fetch(`${API_USER_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Hiba a jelszó módosításkor.");
      }

      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setMessage(
        "✅ Jelszó sikeresen módosítva! Kérjük, jelentkezzen be újra."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-bg">
      <div className="profile-card">
        <div className="profile-close" onClick={onClose}>
          &times;
        </div>

        <h2>Profilom</h2>

        {message && <p className="success-message">{message}</p>}
        {loading && <p>Betöltés...</p>}
        {error && <p className="error">{error}</p>}

        {/* JELSZÓ VÁLTÁS FORM (Feltételesen jelenik meg) */}
        {isChangingPassword && (
          <form className="password-form" onSubmit={handleChangePassword}>
            <h3>Jelszó módosítása</h3>
            <input
              type="password"
              placeholder="Régi jelszó"
              required
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  oldPassword: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="Új jelszó (min. 6 karakter)"
              required
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
            <button type="submit">Jelszó frissítése</button>
            <button type="button" onClick={() => setIsChangingPassword(false)}>
              Mégse
            </button>
          </form>
        )}

        {/* PROFIL SZERKESZTÉS FORM (Feltételesen jelenik meg) */}
        {isEditing && !isChangingPassword && profileData && (
          <form className="edit-form" onSubmit={handleUpdateProfile}>
            <h3>Adatok szerkesztése</h3>
            <input
              type="email"
              placeholder="Új E-mail"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ email: e.target.value })}
            />
            <button type="submit">Mentés</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Mégse
            </button>
          </form>
        )}

        {/* NÉZET MÓD (Alap megjelenítés) */}
        {!isEditing && !isChangingPassword && profileData && (
          <div className="profile-content">
            <div className="avatar">
              <img src="Image/Avatar2.png" alt="" />
            </div>
            <p>
              <strong>E-mail:</strong> {profileData.email}
            </p>
            <p>
              <strong>Szerepkör:</strong>{" "}
              {profileData.role === "admin" ? "Adminisztrátor" : "Vásárló"}
            </p>

            <h3>Beállítások</h3>
            <button
              onClick={() => {
                setIsEditing(true);
                setMessage(null);
                setError(null);
              }}
            >
              Adatok szerkesztése
            </button>
            <button
              onClick={() => {
                setIsChangingPassword(true);
                setMessage(null);
                setError(null);
              }}
            >
              Jelszó módosítása
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
