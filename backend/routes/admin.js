const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Minden admin route védve van az alábbi middleware-rel
router.use(authMiddleware, adminOnly);

/* Rendelések kezelése */
router.get("/orders", adminController.getAllOrders); // Összes rendelés listázása
router.put("/orders/:id/status", adminController.updateOrderStatus); // Rendelés státusz módosítása

/* Termékek kezelése */
router.get("/products", adminController.getAllProducts); // Termék lista
router.post("/products", adminController.createProduct); // Új termék létrehozása
router.put("/products/:id", adminController.updateProduct); // Termék szerkesztése
router.delete("/products/:id", adminController.deleteProduct); // Termék törlése

/* Felhasználók kezelése */
router.get("/users", adminController.getAllUsers); // Felhasználók listázása
router.put("/users/:id", adminController.updateUser); // Felhasználó adatainak szerkesztése
router.delete("/users/:id", adminController.deleteUser); // Felhasználó törlése

module.exports = router;
