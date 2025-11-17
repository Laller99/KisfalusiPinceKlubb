// server.js

// 1. Függőségek és környezeti változók betöltése
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { MongoClient, ObjectId } = require("mongodb");
const paypal = require("paypal-rest-sdk");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const { authMiddleware: protect } = require("./middleware/authMiddleware");
// ---------------------------------------------------------------------

// 2. Környezeti változók beolvasása
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  OWNER_EMAIL,
  MONGO_URI,
  MONGO_DB_NAME,
  PAYPAL_MODE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  API_PORT,
  FRONTEND_URL,
} = process.env;
const SHOP_NAME = "Kisfalusi Pince Klubb";
// --- PayPal konfiguráció ---
paypal.configure({
  mode: PAYPAL_MODE,
  client_id: PAYPAL_CLIENT_ID,
  client_secret: PAYPAL_SECRET,
});

// --- MongoDB kapcsolat beállítása (Natív Driver - Rendelésekhez) ---
const client = new MongoClient(MONGO_URI);
let db;

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(MONGO_DB_NAME);
    console.log("✅ Sikeresen csatlakoztunk a natív MongoDB-hez!");
  } catch (error) {
    console.error("❌ Hiba a MongoDB csatlakozáskor:", error);
    process.exit(1);
  }
}
connectToMongo();

// Mongoose kapcsolat beállítása a User, Product, Order modellekhez
mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log("✅ Sikeresen csatlakoztunk a Mongoose-hoz! (Autentikáció)")
  )
  .catch((err) => console.error("❌ Hiba a Mongoose csatlakozáskor:", err));

// --- Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// ---------------------------------------------------------------------
// --- SEGÉDFÜGGVÉNYEK ---
// ---------------------------------------------------------------------
function createOrderEmailContent(data) {
  const customerName = data.customer ? data.customer.name : "Ismeretlen vevő";

  const totalPrice = data.totalPrice || data.total || 0;

  return `
        <h1>Új rendelés érkezett!</h1>
        <p><strong>Vevő neve:</strong> ${customerName}</p>
        <p>
            <strong>Végösszeg:</strong> 
            ${totalPrice.toLocaleString("hu-HU", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} Ft
        </p>
        <p>Kérjük ellenőrizze az adatbázist a részletekért!</p>
    `;
}

function createCustomerEmailContent(order) {
  const { customer, items, total, shippingFee } = order;

  return `
        <h1>Köszönjük a rendelésedet, ${customer.name}!</h1>
        <p>A rendelésed sikeresen beérkezett és feldolgozás alatt áll.</p>
        
        <h2>Rendelés részletei:</h2>
        <ul>
            ${items
              .map(
                (item) =>
                  `<li>${item.qty} x ${item.name} (${item.price} Ft/db)</li>`
              )
              .join("")}
        </ul>

        <p><strong>Szállítási díj:</strong> ${shippingFee.toLocaleString(
          "hu-HU"
        )} Ft</p>
        <h3>Végösszeg: ${total.toLocaleString("hu-HU")} Ft</h3>
        
        <p>Hamarosan értesítünk, amint a csomag útnak indul.</p>
    `;
}

/**
 * Segédfüggvény: Értesítő email küldése a webshop tulajdonosának.
 */
async function sendNotificationEmail(orderData, subjectPrefix) {
  const mailOptions = {
    from: EMAIL_USER,
    to: OWNER_EMAIL,
    subject: `${subjectPrefix} - Vevő: ${
      orderData.customer.name || "Ismeretlen vevő"
    }`,
    html: createOrderEmailContent(orderData),
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Hiba az értesítő email küldésekor:", error);
  }
}

// ---------------------------------------------------------------------
// --- Express Szerver beállítása ---
// ---------------------------------------------------------------------
const app = express();
app.use(express.json());
// Engedélyezzük a frontendnek a kommunikációt
app.use(cors({ origin: FRONTEND_URL }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));

app.get("/api/products", async (req, res) => {
  try {
    // A Mongoose Product modell használata, ami a products gyűjteményt keresi
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ Hiba a publikus termék lekérdezéskor:", err);
    res.status(500).json({ error: "Nem lehet lekérni a termékeket!" });
  }
});

app.post("/api/order", protect, async (req, res, next) => {
  const orderData = req.body;

  // 1. Állapot beállítása
  orderData.status =
    orderData.paymentMethod === "Előreutalás"
      ? "Várakozás fizetésre"
      : "Rendelés feldolgozás alatt";
  orderData.createdAt = new Date();
  orderData.customer = orderData.customer || {};

  // 🔑 KORÁBBI HIBA JAVÍTVA: A 'protect' futása után a req.user már létezik
  try {
    const userIdString = req.user.id;
    // Konvertáljuk ObjectId-re, mivel a felhasználók is így vannak tárolva az auth rendszerben
    orderData.customerId = new ObjectId(userIdString);
  } catch (err) {
    console.error(
      "❌ Hiba az ObjectId konvertálásakor a rendelés mentésekor:",
      err
    );
    return res
      .status(500)
      .json({ message: "Szerverhiba az azonosító mentésekor." });
  }

  if (!db) {
    return res
      .status(503) // 503 Service Unavailable, ha a DB nem érhető el
      .json({ message: "Szerverhiba: Az adatbázis nem elérhető." });
  }

  try {
    // 2. Rendelés mentése a MongoDB-be
    const result = await db.collection("orders").insertOne(orderData);
    const orderId = result.insertedId.toString();

    // 3. Email küldés előkészítése
    const customerEmail = orderData.customer.email;
    const customerEmailContent = createCustomerEmailContent(orderData);

    if (orderData.paymentMethod === "Előreutalás") {
      // --- PAYPAL FIZETÉS KEZDEMÉNYEZÉSE ---
      const create_payment_json = {
        // ... (PayPal JSON változatlan)
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: `${FRONTEND_URL}/success?orderId=${orderId}`,
          cancel_url: `${FRONTEND_URL}/cancel?orderId=${orderId}`,
        },
        transactions: [
          {
            item_list: {
              items: orderData.items.map((item) => ({
                name: item.productName,
                sku: item.productName,
                price: item.unitPrice.toFixed(2),
                currency: "HUF",
                quantity: item.quantity,
              })),
            },
            amount: {
              currency: "HUF",
              total: orderData.totalPrice.toFixed(2),
            },
            description: `Webshop rendelés: ${orderId}`,
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.error("PayPal hiba:", error.response);
          // Tulajdonos értesítése PayPal hiba esetén is
          sendNotificationEmail(orderData, "PayPal kezdeményezés sikertelen");
          return res.status(500).json({
            message: "Hiba a PayPal fizetés kezdeményezésekor.",
            error: error.response,
          });
        } else {
          // PayPal átirányítás
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              return res.status(202).json({
                message: "Rendelés mentve, átirányítás PayPal-ra.",
                action: "redirect",
                redirectUrl: payment.links[i].href,
              });
            }
          }
        }
      });
    } else {
      // --- BANKKÁRTYA / UTÁNVÉT (Nincs külső fizetés) ---

      // 1. Email küldése a tulajdonosnak
      await sendNotificationEmail(
        orderData,
        `Új rendelés (${orderData.paymentMethod})`
      );

      // 2. Email küldése a VÁSÁRLÓNAK
      try {
        await transporter.sendMail({
          from: `"${SHOP_NAME}" <${EMAIL_USER}>`,
          to: customerEmail,
          subject: "Rendelés visszaigazolása",
          html: customerEmailContent,
        });
        console.log(
          `Visszaigazoló e-mail elküldve a vásárlónak: ${customerEmail}`
        );
      } catch (emailError) {
        console.error(
          "❌ Hiba a vásárlói visszaigazoló email küldésekor:",
          emailError
        );
        // Logoljuk, de nem akadályozza meg a sikeres választ a frontendnek
      }

      // 3. Sikeres válasz a frontendnek
      return res.status(200).json({
        message: "Rendelés mentve, visszaigazoló email elküldve.",
        action: "success",
        orderId: orderId, // Visszaküldjük az ID-t
      });
    }
  } catch (error) {
    console.error("Szerver hiba a rendelés feldolgozásakor:", error);
    // 🛑 JAVÍTVA: Hiba továbbítása a globális hibakezelőnek
    next(error);
  }
});

/**
 * GET /api/paypal/execute
 */
app.get("/api/paypal/execute", async (req, res, next) => {
  const { paymentId, PayerID, orderId } = req.query;

  if (!paymentId || !PayerID || !orderId) {
    return res.redirect(`${FRONTEND_URL}/cancel?message=Hiányzó adatok.`);
  }

  // 🔑 Lekérdezzük a teljes rendelést a valós összegért
  let orderData;
  try {
    orderData = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(orderId) });
  } catch (err) {
    console.error(
      "❌ Hiba az order adatok lekérésekor a PayPal execute-ban:",
      err
    );
    // Hiba továbbítása
    next(err);
    return;
  }

  if (!orderData) {
    return res.redirect(
      `${FRONTEND_URL}/cancel?message=A rendelés nem található.`
    );
  }

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        // 🔑 JAVÍTÁS: A valós összeget használjuk a PayPal végrehajtásához
        amount: { currency: "HUF", total: orderData.totalPrice.toFixed(2) },
      },
    ],
  };

  // A PayPal végrehajtja a fizetést
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      // 🔑 callback függvény async-gé téve
      if (error) {
        console.error("PayPal execute hiba:", error.response);

        // Állapot frissítése hibás fizetésre
        await db
          .collection("orders")
          .updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status: "Fizetés sikertelen", paymentDetails: payment } }
          );
        return res.redirect(
          `${FRONTEND_URL}/cancel?orderId=${orderId}&message=Fizetési hiba.`
        );
      } else {
        // Sikeres fizetés!

        // Állapot frissítése MongoDB-ben
        await db
          .collection("orders")
          .updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status: "Fizetve", paymentDetails: payment } }
          );

        // 1. Email küldése a tulajdonosnak
        await sendNotificationEmail(orderData, "Sikeres PayPal fizetés!");

        // 2. Email küldése a VÁSÁRLÓNAK
        const customerEmailContent = createCustomerEmailContent(orderData);
        const customerEmail = orderData.customer.email;
        try {
          await transporter.sendMail({
            from: `"${SHOP_NAME}" <${EMAIL_USER}>`,
            to: customerEmail,
            subject: "Rendelés visszaigazolása (Fizetve)",
            html: customerEmailContent,
          });
        } catch (emailError) {
          console.error(
            "❌ Hiba a sikeres fizetés utáni vásárlói email küldésekor:",
            emailError
          );
        }

        // Vissza a frontend siker oldalára
        return res.redirect(`${FRONTEND_URL}/success?orderId=${orderId}`);
      }
    }
  );
});

// ---------------------------------------------------------------------
// --- GLOBÁLIS HIBAKEZELŐ (4 paraméteres middleware) ---
// ---------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("🚨 GLOBÁLIS HIBAKEZELŐ ELKAPOTT HIBA:", err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: "Szerverhiba történt, kérjük próbálja újra később.",
    error: err.message || "Ismeretlen hiba.",
  });
});

// ---------------------------------------------------------------------
// --- Szerver Indítása ---
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 3001; // Render vagy lokális fallback
app.listen(PORT, () => {
  console.log(`🚀 A backend fut a http://localhost:${PORT} címen`);
});