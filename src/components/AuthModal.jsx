import React, { useState, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import "./AuthModal.css";

export default function AuthModal({ show, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, register } = useContext(AuthContext);

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

  return (
    <div className="modal-bg">
      <div className={`modal-card ${flipped ? "flipped" : ""}`}>
        {/* ----- LOGIN OLDAL ----- */}
        <form className="modal-side front" onSubmit={handleSubmit}>
          <h2>Bejelentkezés</h2>
          <input
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Jelszó"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit">Belépés</button>
          {error && <span className="error">{error}</span>}
          <div className="modal-footer">
            Nincs fiókod?{" "}
            <span
              className="link"
              onClick={() => {
                setFlipped(true);
                setError("");
                setForm({ email: "", password: "" }); // Javítás: Törli a form adatokat
              }}
            >
              Regisztrálj.
            </span>
          </div>
        </form>
        {/* ----- REGISZTRÁCIÓS OLDAL ----- */}{" "}
        <form className="modal-side back" onSubmit={handleSubmit}>
          <h2>Regisztráció</h2>
          <input
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Jelszó"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit">Regisztráció</button>
          {error && <span className="error">{error}</span>}
          <div className="modal-footer">
            Már van fiókod?{" "}
            <span
              className="link"
              onClick={() => {
                setFlipped(false);
                setError("");
                setForm({ email: "", password: "" }); // Javítás: Törli a form adatokat
              }}
            >
              Jelentkezz be.
            </span>
          </div>
        </form>
      </div>
      <div className="modal-close" onClick={onClose}>
        &times;
      </div>
    </div>
  );
}
