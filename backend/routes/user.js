const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Minden route védve van authMiddleware-rel
router.use(authMiddleware);

/* Saját rendelések */
router.get("/orders", userController.getUserOrders); // Saját rendelései lekérdezése

/* Saját profil */
router.get("/profile", userController.getProfile); // Saját profil/adatok lekérdezése
router.put("/profile", userController.updateProfile); // Adatok frissítése
router.put("/change-password", userController.changePassword); // Jelszó módosítás

module.exports = router;
