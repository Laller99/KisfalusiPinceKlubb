// components/UserOrdersPage.jsx

import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import "./ProfilePage.css"; // Használhatod a ProfilePage stílusait

const API_ORDERS_URL =
  "https://kisfalusipinceklubb.onrender.com/api/user/orders";

export default function UserOrdersPage({ onClose }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        // Backend útvonal: GET /api/user/orders
        const response = await fetch(API_ORDERS_URL, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // 🛠️ JAVÍTVA: Pontosabb hibaüzenet keresés: message, error, vagy default.
          const errorMessage =
            data.message ||
            data.error ||
            "Nem sikerült lekérni a rendeléseket.";
          throw new Error(errorMessage);
        }

        // 🛠️ JAVÍTVA: A backend 200-as státusszal vagy tömböt, vagy üres tömböt küld.
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);
  console.log("USER OBJECT:", user);
  // A profil stílusát használjuk a kerethez
  return (
    <div className="profile-bg">
      <div className="profile-card" style={{ maxWidth: "800px" }}>
        <div className="profile-close" onClick={onClose}>
          &times;
        </div>

        <h2>📦 Rendeléseim ({orders.length})</h2>

        {loading && <p>Betöltés...</p>}
        {error && <p className="error">{error}</p>}

        {orders.length === 0 && !loading && !error && (
          <p>Még nem adtál le rendelést.</p>
        )}

        {orders.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Dátum</th>
                <th>Összeg</th>
                <th>Státusz</th>
                {/* <th>Részletek</th> */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.totalPrice.toLocaleString("hu-HU")} Ft</td>
                  <td>{order.status}</td>
                  {/* <td><button>Részletek</button></td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
