const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
  stock: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", ProductSchema, "products");
