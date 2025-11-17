// userController.js

const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Saját rendelései lekérdezése
exports.getUserOrders = async (req, res, next) => {
  try {
    const userIdString = req.user.id;
    let searchId = userIdString;

    // 🔑 LOG: Ellenőrizzük, milyen ID-t kaptunk a tokentől
    console.log(`[USER ORDERS] Keresett string ID (token): ${userIdString}`);

    // 🛑 KRITIKUS JAVÍTÁS: Kényszerítjük az ObjectId konverziót a kereséshez
    if (mongoose.Types.ObjectId.isValid(userIdString)) {
      searchId = new mongoose.Types.ObjectId(userIdString);
      console.log(`[USER ORDERS] Konvertálva ObjectId-re a kereséshez.`);
    }

    // A Mongoose most már a konvertált ObjectId-val keres
    // 🛑 KRITIKUS JAVÍTÁS: searchId használata req.user.id helyett!
    const orders = await Order.find({ customerId: searchId }).sort({
      createdAt: -1,
    });

    console.log(
      `[USER ORDERS] Találatok száma az adatbázisban: ${orders.length}`
    );

    if (orders.length === 0) {
      return res
        .status(200)
        .json({ message: "Még nincsenek leadott rendeléseid.", orders: [] });
    }

    // Tiszta objektummá konvertálás (a korábbi javítás)
    const cleanOrders = orders.map((order) => order.toObject());
    res.json(cleanOrders);
  } catch (err) {
    // 🛑 KIHAGYOTT RÉSZ JAVÍTVA: Hiba logolása
    console.error(
      "❌ [USER ORDERS] KRITIKUS HIBA a rendelés lekérdezéskor:",
      err
    );
    next(err);
  }
};

// Saját profil lekérdezése
exports.getProfile = async (req, res, next) => {
  // 🔑 next hozzáadva
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ error: "Felhasználó nem található" });
    res.json(user);
  } catch (err) {
    // 🛑 next() hívása a globális hibakezelőnek
    next(err);
  }
};

// Saját profil frissítése
exports.updateProfile = async (req, res, next) => {
  // 🔑 next hozzáadva
  try {
    const { email } = req.body;

    // Opcionális: Ellenőrizd, hogy az email cím nem foglalt-e már
    // const existingUser = await User.findOne({ email });
    // if (existingUser && existingUser._id.toString() !== req.user.id) {
    //   return res.status(400).json({ error: "Ez az e-mail cím már foglalt." });
    // }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true, runValidators: true } // runValidators biztosítja a Mongoose validációt
    ).select("-password");

    res.json(user);
  } catch (err) {
    // 🛑 next() hívása a globális hibakezelőnek
    next(err);
  }
};

// Jelszó módosítás
exports.changePassword = async (req, res, next) => {
  // 🔑 next hozzáadva
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ error: "Felhasználó nem található" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(403).json({ error: "Hibás régi jelszó" });

    // 🛑 JAVÍTVA: Az új jelszó hashelése a mentés előtt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // A User modellben kell lennie egy pre-save hook-nak, ami hasheli a jelszót,
    // de a direkt beállítás és mentés itt is hasheli az új Mongoose hookok nélkül is.
    await user.save();

    res.json({ message: "Jelszó módosítva!" });
  } catch (err) {
    // 🛑 next() hívása a globális hibakezelőnek
    next(err);
  }
};
