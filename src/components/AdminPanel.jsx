// components/AdminPanel.jsx
import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import "./AdminPanel.css";

const API_ADMIN_URL = "https://kisfalusipinceklubb.onrender.com/api/admin";

// --- Segéd Komponens: Termék Létrehozó/Szerkesztő Modál ---
const ProductFormModal = ({ product, onClose, onSuccess, token }) => {
  const [form, setForm] = useState(
    product || { name: "", price: 0, stock: 0, description: "", image: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = product ? "PUT" : "POST";
    const url = product
      ? `${API_ADMIN_URL}/products/${product._id}`
      : `${API_ADMIN_URL}/products`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
        cache: "no-cache",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Hiba a termék ${product ? "szerkesztésekor" : "létrehozásakor"}.`
        );
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-modal-bg">
      <div className="product-modal-card">
        <h3>{product ? "Termék Szerkesztése" : "Új Termék Létrehozása"}</h3>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Név"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Ár (Ft)"
            required
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Készlet (db)"
            required
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
          />
          <textarea
            placeholder="Leírás"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Kép URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Mentés..." : "Mentés"}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Mégse
          </button>
        </form>
      </div>
    </div>
  );
};

// --- FŐ KOMPONENS: ADMIN PANEL ---
export default function AdminPanel({ onClose }) {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState("products"); // products | orders | users
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  // 🔑 ÚJ ÁLLAPOT: Felhasználók tárolására
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // 🔑 ÚJ LOGIKA: Görgetés letiltása és visszaállítása
  useEffect(() => {
    // Ha a felhasználó admin és a panel látható
    if (user && user.role === "admin") {
      document.body.classList.add("modal-open");
    }

    // Tisztító függvény: Ez fut le, mielőtt a komponens eltűnik (unmount)
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [user]); // Futáskor és eltűnéskor, a user meglétét/admin szerepét használjuk triggerként

  // ----------------------------------------------------
  // API HÍVÁSOK
  // ----------------------------------------------------

  const fetchData = async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        view === "products"
          ? "products"
          : view === "orders"
          ? "orders"
          : "users"; // 🔑 ÚJ: Felhasználók endpoint

      const res = await fetch(`${API_ADMIN_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        cache: "no-cache",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${endpoint} lekérési hiba.`);

      if (view === "products") {
        setProducts(data);
      } else if (view === "orders") {
        setOrders(data);
      } else if (view === "users") {
        // 🔑 ÚJ: Felhasználók beállítása
        setUsers(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Termék törlése (DELETE /api/admin/products/:id)
  const deleteProduct = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a terméket?")) return;
    try {
      const res = await fetch(`${API_ADMIN_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
        cache: "no-cache",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Törlési hiba.");
      }
    } catch (err) {
      console.error("Törlési hiba:", err);
    }
  };

  // Rendelés státusz módosítása (PUT /api/admin/orders/:id/status)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_ADMIN_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
        cache: "no-cache",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Státusz frissítési hiba.");
      }
    } catch (err) {
      console.error("Státusz frissítési hiba:", err);
    }
  };

  // 🔑 ÚJ: Felhasználó szerepkörének módosítása
  const updateUserRole = async (userId, newRole) => {
    // Admin nem módosíthatja saját szerepkörét
    if (userId === user.id) {
      alert("Nem módosíthatod saját szerepkörödet.");
      return;
    }
    try {
      const res = await fetch(`${API_ADMIN_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ role: newRole }), // Csak a role-t küldjük
        cache: "no-cache",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Szerepkör frissítési hiba.");
      }
    } catch (err) {
      console.error("Szerepkör frissítési hiba:", err);
    }
  };

  // 🔑 ÚJ: Felhasználó törlése
  const deleteUser = async (userId) => {
    if (userId === user.id) {
      alert("Nem törölheted saját magadat!");
      return;
    }
    if (!window.confirm("Biztosan törölni szeretnéd ezt a felhasználót?"))
      return;

    try {
      const res = await fetch(`${API_ADMIN_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
        cache: "no-cache",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Felhasználó törlési hiba.");
      }
    } catch (err) {
      console.error("Felhasználó törlési hiba:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view, user.token]);

  // Modal kezelők (Változatlanul hagyva)
  const openCreateModal = () => {
    setCurrentProduct(null);
    setIsProductModalOpen(true);
  };
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsProductModalOpen(true);
  };
  const handleModalSuccess = () => {
    setIsProductModalOpen(false);
    fetchData();
  };
  const handleModalClose = () => {
    setIsProductModalOpen(false);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-bg">
        <div className="admin-card">
          <div className="admin-close" onClick={onClose}>
            &times;
          </div>
          <p className="error">❌ Nincs jogosultságod az admin panelhez.</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDERELÉS
  // ----------------------------------------------------

  return (
    <div className="admin-bg">
      <div className="admin-card">
        <div className="admin-close" onClick={onClose}>
          &times;
        </div>
        <h2>🔧 Admin Panel</h2>

        {error && <p className="error">{error}</p>}

        <div className="admin-nav">
          <button
            className={view === "products" ? "active" : ""}
            onClick={() => setView("products")}
          >
            Termékek ({products.length})
          </button>
          <button
            className={view === "orders" ? "active" : ""}
            onClick={() => setView("orders")}
          >
            Rendelések ({orders.length})
          </button>
          {/* 🔑 ÚJ NAVIGÁCIÓS GOMB */}
          <button
            className={view === "users" ? "active" : ""}
            onClick={() => setView("users")}
          >
            Felhasználók ({users.length})
          </button>
        </div>

        <div className="view-content">
          {loading && <p>Betöltés...</p>}

          {/* --- 1. TERMÉKEK NÉZET --- */}
          {view === "products" && (
            <div className="product-management">
              <h3>Termékek kezelése</h3>
              <button onClick={openCreateModal}>+ Új Termék Létrehozása</button>

              {products.length === 0 && !loading && !error && (
                <p>Nincsenek megjeleníthető termékek.</p>
              )}

              {products.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Név:</th>
                      <th>Ár:</th>
                      <th>Készlet:</th>
                      <th>Módosítás:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{(p.price || 0).toLocaleString("hu-HU")} Ft</td>
                        <td>{p.stock} db</td>
                        <td>
                          <button onClick={() => openEditModal(p)}>
                            Szerkesztés
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteProduct(p._id)}
                          >
                            Törlés
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* --- 2. RENDELÉSEK NÉZET --- */}
          {view === "orders" && (
            <div className="order-management">
              <h3>Folyamatban lévő Rendelések </h3>
              {orders.length === 0 && !loading && !error && (
                <p>Nincsenek folyamatban lévő rendelések.</p>
              )}

              {orders.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>ID:</th>
                      <th>Vásárló Email:</th>
                      <th>Összeg:</th>
                      <th>Státusz:</th>
                      <th>Módosítás:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td>{o._id.substring(0, 5)}...</td>
                        <td>{o.customer?.email || "Ismeretlen"}</td>
                        <td>
                          {(o.totalPrice || 0).toLocaleString("hu-HU")} Ft
                        </td>
                        <td>{o.status}</td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(o._id, e.target.value)
                            }
                          >
                            <option value="Várakozás fizetésre">
                              Várakozás fizetésre
                            </option>
                            <option value="Rendelés feldolgozás alatt">
                              Folyamatban
                            </option>
                            <option value="Fizetve">Fizetve</option>
                            <option value="Teljesítve">Teljesítve</option>
                            <option value="Sztornózva">Sztornózva</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* --- 3. FELHASZNÁLÓK NÉZET --- */}
          {view === "users" && (
            <div className="user-management">
              <h3>Felhasználók kezelése</h3>
              {users.length === 0 && !loading && !error && (
                <p>Nincsenek regisztrált felhasználók.</p>
              )}

              {users.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>ID:</th>
                      <th>E-mail:</th>
                      <th>Szerepkör:</th>
                      <th>Műveletek:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u._id.substring(0, 5)}...</td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            // 🔑 MÓDOSÍTÁS: Szerepkör frissítése
                            onChange={(e) =>
                              updateUserRole(u._id, e.target.value)
                            }
                            // Az admin nem módosíthatja saját szerepkörét
                            disabled={u._id === user.id}
                          >
                            <option value="user">Vásárló</option>
                            <option value="admin">Adminisztrátor</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="delete"
                            // 🔑 MÓDOSÍTÁS: Törlés
                            onClick={() => deleteUser(u._id)}
                            // Az admin nem törölheti magát
                            disabled={u._id === user.id}
                          >
                            Törlés
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Termék szerkesztő/létrehozó modál megjelenítése */}
      {isProductModalOpen && (
        <ProductFormModal
          product={currentProduct}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          token={user.token}
        />
      )}
    </div>
  );
}
