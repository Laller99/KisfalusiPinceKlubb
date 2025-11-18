const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Összes rendelés listázása
exports.getAllOrders = async (req, res) => {
  try {
    // 🔑 MÓDOSÍTÁS: Szűrés, ahol a státusz NEM "Teljesítve"
    const orders = await Order.find({ status: { $ne: "Teljesítve" } })
      .populate("userId", "email")
      .sort({ createdAt: -1 }); // Legújabb felül
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Nem lehet lekérni a rendeléseket!" });
  }
};

// Rendelés státusz módosítása
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Státusz frissítése hiba." });
  }
};

// Termékek kezelése
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Termék lekérési hiba." });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Termék létrehozási hiba." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Termék szerkesztési hiba." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Termék törölve." });
  } catch (err) {
    res.status(500).json({ error: "Termék törlési hiba." });
  }
};

// Felhasználók kezelése
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Felhasználók lekérési hiba." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Felhasználó frissítési hiba." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Felhasználó törölve." });
  } catch (err) {
    res.status(500).json({ error: "Felhasználó törlési hiba." });
  }
};
