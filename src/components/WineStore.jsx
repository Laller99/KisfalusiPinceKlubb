import React, { useState, useMemo, useEffect, useContext } from "react";
import { ShoppingCart, X } from "lucide-react";
import AuthContext from "../contexts/AuthContext";
import "./HarvestSimulation.css";

const SHIPPING_OPTIONS = [
  { value: "futarszolgalat", label: "Futárszolgálat (1500 Ft)" },
  { value: "posta", label: "PostaPont / Csomagautomata (990 Ft)" },
  { value: "szemelyes", label: "Személyes átvétel (ingyenes)" },
];

// --- 1. WINE LIST CARD KOMPONENS (JAVÍTVA: vintage és _id) ---
const WineListCard = ({ wine, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="wine-cards">
      <div className="wine-image-container">
        {wine.image && (
          <img src={wine.image} alt={wine.name} className="wine-image" />
        )}
      </div>

      <div className="wine-details">
        <h3 className="wine-name">{wine.name}</h3>

        <p className="wine-description">{wine.description}</p>

        <div className="price-section">
          <span className="wine-price">{wine.price} Ft</span>
        </div>
      </div>

      <div className="card-actions">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          min="1"
          className="quantity-input"
          aria-label="Mennyiség"
        />

        <button
          className="add-to-cart-button"
          // ⚠️ JAVÍTÁS: wine.id helyett wine._id-t használunk
          onClick={() => onAddToCart(wine._id, quantity)}
        >
          <ShoppingCart className="icon-tiny" /> Kosárba
        </button>
      </div>
    </div>
  );
};

// --- 2. MODAL KOMPONENS (JAVÍTVA: Görgetés letiltása) ---
const Modal = ({ isOpen, onClose, children }) => {
  // 🔑 ÚJ LOGIKA: Görgetés letiltása a modal megjelenésekor
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    }

    // Tisztító függvény: Ez fut le, mielőtt a komponens eltűnik, vagy az isOpen változik.
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]); // Csak akkor fut le, ha az 'isOpen' prop megváltozik

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <X />
        </button>
        {children}
      </div>
    </div>
  );
};
// --- 3. ORDER FORM KOMPONENS (KIEGÉSZÍTVE) ---
const OrderForm = ({ cart, total, onOrderSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    zip: "",
    shipping: SHIPPING_OPTIONS[0].value, // Alapértelmezett szállítási mód
    payment: "card", // Alapértelmezett fizetési mód
  });
  const [shippingFee, setShippingFee] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState(null);

  // Szállítási díj és teljes összeg frissítése
  useEffect(() => {
    const selectedOption = SHIPPING_OPTIONS.find(
      (opt) => opt.value === formData.shipping
    );
    const fee =
      selectedOption.value === "futarszolgalat"
        ? 1500
        : selectedOption.value === "posta"
        ? 990
        : 0;
    setShippingFee(fee);
  }, [formData.shipping]);

  const finalTotal = total + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Nagyon egyszerű validáció (csak a név és az email ellenőrzése)
    if (
      !formData.name ||
      !formData.email ||
      (formData.shipping !== "szemelyes" &&
        (!formData.city || !formData.address || !formData.zip))
    ) {
      return false;
    }
    // További e-mail validáció
    if (!formData.email.includes("@")) {
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setOrderMessage({
        type: "error",
        text: "Kérjük, töltse ki az összes kötelező mezőt!",
      });
      return;
    }

    setLoading(true);
    setOrderMessage(null);

    const orderDetails = {
      customer: formData,
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      total: finalTotal,
      shippingFee: shippingFee,
      paymentMethod: formData.payment,
      totalPrice: finalTotal, // 🔑 PÓTOLVA: Fontos a teljes összeg a backendnek
    };

    onOrderSubmit(orderDetails)
      .then((res) => {
        if (res && res.message) {
          setOrderMessage({ type: "success", text: res.message });
        }
      })
      .catch((error) => {
        setOrderMessage({ type: "error", text: error.message });
        console.error("Rendelés leadása sikertelen:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isAddressRequired = formData.shipping !== "szemelyes";
  const isFormValid = validateForm();

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <h3>1. Szállítási és kapcsolattartási adatok</h3>
      <div className="form-group-grid">
        <input
          type="text"
          name="name"
          placeholder="Teljes név *"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefonszám"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <input
        type="email"
        name="email"
        placeholder="E-mail cím *"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <h3 style={{ marginTop: 25 }}>2. Szállítási mód és cím</h3>
      <select
        name="shipping"
        value={formData.shipping}
        onChange={handleChange}
        style={{ marginBottom: 15 }}
      >
        {SHIPPING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {isAddressRequired && (
        <>
          <div className="form-group-grid">
            <input
              type="text"
              name="zip"
              placeholder="Irányítószám *"
              value={formData.zip}
              onChange={handleChange}
              required={isAddressRequired}
            />
            <input
              type="text"
              name="city"
              placeholder="Város *"
              value={formData.city}
              onChange={handleChange}
              required={isAddressRequired}
            />
          </div>
          <input
            type="text"
            name="address"
            placeholder="Utca, házszám *"
            value={formData.address}
            onChange={handleChange}
            required={isAddressRequired}
          />
        </>
      )}

      <h3 style={{ marginTop: 25 }}>3. Fizetési mód</h3>
      <div className="radio-group" style={{ marginBottom: 15 }}>
        <label>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={formData.payment === "card"}
            onChange={handleChange}
          />
          Bankkártyás fizetés (átirányítás)
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="transfer"
            checked={formData.payment === "transfer"}
            onChange={handleChange}
          />
          Előre utalás
        </label>
      </div>

      <div className="divider"></div>

      <div className="order-summary">
        <div className="order-summary-table-wrapper">
          <table className="order-summary-table">
            <thead>
              <tr>
                <th>Termék</th>
                <th>Menny.</th>
                <th>Ár</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.qty} db</td>
                  <td>{item.price} Ft</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="final-summary">
          <h4>
            Termékek összege:
            <span className="highlight-price">{total} Ft</span>
          </h4>
          <h4>
            Szállítási díj:
            <span className="highlight-price">{shippingFee} Ft</span>
          </h4>
          <h4
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 10,
            }}
          >
            Fizetendő összesen:
            <span className="highlight-price">{finalTotal} Ft</span>
          </h4>
        </div>
      </div>

      {orderMessage && (
        <p
          className="order-message"
          style={{
            color:
              orderMessage.type === "error"
                ? "var(--color-error)"
                : "var(--color-accent-gold)",
          }}
        >
          {orderMessage.text}
        </p>
      )}

      <button
        type="submit"
        className="submit-order-button"
        disabled={!isFormValid || loading}
      >
        {loading
          ? "Rendelés feldolgozása..."
          : `Rendelés elküldése (${finalTotal} Ft)`}
      </button>
    </form>
  );
};
// --- 4. KOSÁR KOMPONENS (VÁLTOZATLAN) ---
function Cart({ cart = [], setCart, onOpenOrderForm }) {
  const total = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0),
    0
  );

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="kosar">
      <h2>Kosár tartalma ({cart.length} tétel)</h2>

      {cart.length === 0 ? (
        <div id="cart">A kosarad üres.</div>
      ) : (
        <div id="cart">
          {cart.map((item, index) => (
            <div key={item.id ?? index} className="cart-item">
              <span>{item.qty}x</span>
              <span style={{ marginLeft: 8 }}>{item.name}</span>
              <span style={{ marginLeft: 8, fontWeight: "bold" }}>
                - {(Number(item.price) || 0) * (item.qty || 0)} Ft
              </span>
              <button
                style={{ marginLeft: 8 }}
                onClick={() =>
                  setCart((prevCart) =>
                    prevCart.filter((i) => i.id !== item.id)
                  )
                }
                className="remove-item-button"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="vegosszeg">
        <strong>Végösszeg:</strong>{" "}
        <span className="total-amount">{total} Ft</span>
      </div>

      <div className="cart-actions-bottom">
        {cart.length > 0 && (
          <button className="clear-cart-button" onClick={clearCart}>
            Kosár kiürítése
          </button>
        )}
        {cart.length > 0 && (
          <button
            className="continue-to-order-button"
            onClick={onOpenOrderForm}
          >
            Tovább a rendelésre
          </button>
        )}
      </div>
    </div>
  );
}

// --- 5. WINE STORE (Fő Applikáció Komponens - FRISSÍTVE) ---
const WineStore = () => {
  const [products, setProducts] = useState([]); // ÚJ: Dinamikus terméklista
  const [loading, setLoading] = useState(true); // ÚJ: Betöltési állapot
  const [error, setError] = useState(null); // ÚJ: Hibaüzenet
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext); // 🔑 HELYESEN HASZNÁLVA
  const API_URL = "https://kisfalusipinceklubb.onrender.com"; // Fő Backend URL (feltételezve)

  // 1. Termékek betöltése a Backendről
  useEffect(() => {
    fetch(`${API_URL}/api/products`) // Hívjuk az új végpontot
      .then((res) => {
        if (!res.ok) throw new Error("A szerver nem válaszolt termékekkel.");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Teljes összeg számítása
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0),
      0
    );
  }, [cart]);

  const handleAddToCart = (productId, quantity) => {
    // ⚠️ JAVÍTÁS: Keresés a dinamikus listában, _id használatával
    const productToAdd = products.find((product) => product._id === productId);

    if (!productToAdd) {
      console.error(`Termék azonosító: ${productId} nem található.`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + quantity } : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: productId, // Fontos: a DB azonosítóját (string) használjuk
            name: productToAdd.name,
            price: productToAdd.price,
            qty: quantity,
          },
        ];
      }
    });
  };

  const handleOrderSubmit = (orderData) => {
    // 🔑 ÚJ KÓD: Token kiolvasása a user objektumból
    const token = user?.token || localStorage.getItem("token");

    // 🔑 ÚJ KÓD: Ha nincs token, megakadályozzuk a hívást és hibát dobunk
    if (!token) {
      return Promise.reject(
        new Error("Bejelentkezés szükséges a rendeléshez.")
      );
    }

    return fetch(`${API_URL}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔑 PÓTOLVA: Ezt a fejlécet küldi a backendnek
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            // A backend hibáját adjuk vissza, ami most már: "Bejelentkezés szükséges." (ha a token érvénytelen)
            throw new Error(
              errorData.message || errorData.error || "Ismeretlen szerverhiba"
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.action === "redirect" && data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }

        setCart([]);
        return data;
      });
  };

  return (
    <div id="shop" className="wine-shop-layout">
      <div className="product-section">
        <h1>Jelenleg elérhető boraink:</h1>
        {loading && <p>Termékek betöltése...</p>}
        {error && (
          <p className="error">❌ Hiba a termékek betöltésekor: {error}</p>
        )}

        {/* ⚠️ Hibaüzenet, ha a lista üres és már betöltött */}
        {!loading && !error && products.length === 0 && (
          <p>
            Jelenleg nincsenek elérhető termékek. Kérjük, vigye fel őket az
            Admin Panel segítségével.
          </p>
        )}

        <section className="wine-list-grid">
          {products.map((wine) => (
            <WineListCard
              key={wine._id} // ⚠️ JAVÍTÁS: wine._id használata
              wine={wine}
              onAddToCart={handleAddToCart}
            />
          ))}
        </section>
      </div>

      <div className="cart-section">
        <Cart
          cart={cart}
          setCart={setCart}
          onOpenOrderForm={() => {
            // 🔑 ÚJ KÓD: Ellenőrizzük, hogy be van-e jelentkezve a továbblépés előtt
            if (!user) {
              alert("Kérjük, jelentkezzen be a rendelés leadásához!");
              return;
            }
            setIsModalOpen(true);
          }}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Rendelési adatok megadása</h2>
        <OrderForm
          cart={cart}
          total={total}
          onOrderSubmit={handleOrderSubmit}
        />
      </Modal>
    </div>
  );
};

export default WineStore;
