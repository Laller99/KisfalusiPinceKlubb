import React, { useState, useContext, useEffect } from "react"; // 🚨 useEffect importálva
import AuthContext from "../contexts/AuthContext";
import "./AuthModal.css";

export default function AuthModal({ show, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useContext(AuthContext);

  // 🔑 ÚJ LOGIKA: Görgetés letiltása a modal megjelenésekor
  useEffect(() => {
    if (show) {
      // Ha a modal látható, hozzáadjuk az osztályt a <body> elemhez
      document.body.classList.add("modal-open");
    } else {
      // Ha a modal nem látható, eltávolítjuk az osztályt
      document.body.classList.remove("modal-open");
    }

    // Tisztító függvény: Ez fut le, mielőtt a komponens megsemmisül, vagy a függőség (show) megváltozik
    return () => {
      // Biztosítjuk, hogy a kilépés után is töröljük az osztályt, ha esetleg a show állapota true maradt volna.
      document.body.classList.remove("modal-open");
    };
  }, [show]); // Csak akkor fut le, ha a 'show' prop megváltozik

  if (!show) return null;

  // form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (flipped) await register(form.email, form.password);
      else await login(form.email, form.password);
      onClose();
      setForm({ email: "", password: "" });
      setError("");
    } catch (err) {
      setError(err.message || "Hiba!");
    }
  };

  // 🛠 Segéd függvény az ikon megnyomására/érintésére
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="modal-bg">
      <div className={`modal-card ${flipped ? "flipped" : ""}`}>
        {/* ----- LOGIN OLDAL (FRONT) ----- */}
        <form className="modal-side front" onSubmit={handleSubmit}>
          {/* ✅ Bezáró gomb a flip animáció miatt a formon belül */}
          <div className="modal-close" onClick={onClose}>
            &times;
          </div>

          <h2>Bejelentkezés</h2>
          <input
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {/* 🛠 Jelszó mező: Konténerbe téve a toggle ikonhoz */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"} // Jelszó típusának váltása
              placeholder="Jelszó"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {/* 🛠 Jelszó toggle ikon */}
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
              onTouchStart={(e) => {
                e.preventDefault(); // Megakadályozza a fókusz elvesztését mobilon
                togglePasswordVisibility();
              }}
              role="button"
              aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó mutatása"}
            >
              {/* Unicode szimbólumok a szem ikonokhoz */}
              {showPassword ? "👁️" : "💤"}
            </span>
          </div>

          <button type="submit">Belépés</button>
          {error && <span className="error">{error}</span>}
          <div className="modal-footer">
            Nincs fiókod?{" "}
            <span
              className="link"
              onClick={() => {
                setFlipped(true);
                setError("");
                setForm({ email: "", password: "" });
                setShowPassword(false); // Állapot visszaállítása
              }}
            >
              Regisztrálj.
            </span>
          </div>
        </form>

        {/* ----- REGISZTRÁCIÓS OLDAL (BACK) ----- */}
        <form className="modal-side back" onSubmit={handleSubmit}>
          {/* ✅ Bezáró gomb a flip animáció miatt a formon belül */}
          <div className="modal-close" onClick={onClose}>
            &times;
          </div>

          <h2>Regisztráció</h2>
          <input
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {/* 🛠 Jelszó mező: Konténerbe téve a toggle ikonhoz */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"} // Jelszó típusának váltása
              placeholder="Jelszó"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {/* 🛠 Jelszó toggle ikon */}
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
              onTouchStart={(e) => {
                e.preventDefault();
                togglePasswordVisibility();
              }}
              role="button"
              aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó mutatása"}
            >
              {showPassword ? "👁️" : "💤"}
            </span>
          </div>

          <button type="submit">Regisztráció</button>
          {error && <span className="error">{error}</span>}
          <div className="modal-footer">
            Már van fiókod?{" "}
            <span
              className="link"
              onClick={() => {
                setFlipped(false);
                setError("");
                setForm({ email: "", password: "" });
                setShowPassword(false); // Állapot visszaállítása
              }}
            >
              Jelentkezz be.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
