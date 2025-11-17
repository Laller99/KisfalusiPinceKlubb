const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Regisztráció normál usernek (default: user)
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validáció: Ellenőrizzük az adatok meglétét
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Az e-mail cím és a jelszó is kötelező." });
    }
    
    // Felhasználó mentése (a Mongoose 'pre' hookja végzi a jelszó hashelését)
    const user = new User({ email, password });
    await user.save();
    
    // Sikeres válasz (ajánlott: token-t is küldeni, de itt csak üzenetet küldünk a Front-end logikája miatt)
    res.status(201).json({ message: "Sikeres regisztráció!" }); 
    
  } catch (err) {
    // E11000 = MongoDB duplikált kulcs hiba (ha az email már foglalt)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Ez az e-mail cím már regisztrálva van." });
    }
    // Általános hiba
    console.error("Hiba történt a regisztráció során:", err);
    res.status(500).json({ error: "Szerverhiba történt a regisztráció során.", details: err.message });
  }
};

---

// Belépés (JAVÍTVA: Hozzáadott try...catch a stabil működésért)
exports.login = async (req, res) => {
  try { 
    const { email, password } = req.body;
    
    // 1. Validáció: Ellenőrizzük az adatok meglétét
    if (!email || !password) {
      return res.status(400).json({ error: "Az e-mail cím és a jelszó is kötelező." });
    }

    // 2. Felhasználó keresése
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Hibás e-mail cím vagy jelszó!" });
    }

    // 3. Jelszó ellenőrzése
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Hibás e-mail cím vagy jelszó!" });
    }

    // 4. Token generálása
    // ⚠️ FONTOS: process.env.JWT_SECRET beállítása szükséges a Renderen!
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    
    // 5. Sikeres válasz (a Front-end ezt várja JSON-ként)
    res.status(200).json({ token }); 

  } catch (err) { 
    // Kritikus hiba elkapása (pl. adatbázis hiba, JWT titok hiánya)
    console.error("Kritikus hiba a login során:", err);
    // Minden esetben érvényes JSON válasz küldése 500-as kóddal
    res.status(500).json({ 
      error: "Szerverhiba történt a bejelentkezés során.", 
      details: err.message 
    });
  }
};