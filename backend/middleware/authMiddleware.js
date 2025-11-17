const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // 🔑 DEBUG: Ellenőrizzük, hogy a kérés eléri-e a middleware-t
  console.log("DEBUG: --- Autentikációs Middleware futása ---");

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("DEBUG: Nincs token, 401 hiba visszaküldve.");
    // ✅ JAVÍTVA: Return, ha válaszoltunk a kliensnek.
    return res.status(401).json({ message: "Bejelentkezés szükséges." });
  }

  // 🔑 DEBUG: Logoljuk a token meglétét
  console.log("DEBUG: Token található.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // 🔑 DEBUG: Sikeres dekódolás
    console.log("DEBUG: Token dekódolva, req.user ID:", decoded.id);

    next();
  } catch (err) {
    // 🔑 DEBUG: Érvénytelen token hiba
    console.log("DEBUG: Érvénytelen token, 401 hiba visszaküldve.");
    // ✅ JAVÍTVA: Return, ha válaszoltunk a kliensnek.
    return res.status(401).json({ message: "Érvénytelen token." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Nincs jogosultság." });
  next();
}

module.exports = { authMiddleware, adminOnly };
