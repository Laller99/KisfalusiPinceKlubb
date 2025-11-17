const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Regisztráció normál usernek (default: user)
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Az e-mail cím és a jelszó is kötelező." });
    }
    const user = new User({ email, password });
    await user.save();
    res.json({ message: "Sikeres regisztráció!" });
  } catch (err) {
    // E11000 = MongoDB duplikált kulcs hiba (ha az email már foglalt)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Ez az e-mail cím már regisztrálva van." });
    }
    res.status(400).json({ error: "Hiba történt: " + err.message });
  }
};

// Belépés
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Nincs ilyen felhasználó!" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Rossz jelszó!" });

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  res.json({ token });
};
