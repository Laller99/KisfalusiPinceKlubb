// src/components/ScrollToHash.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Figyeli az URL hash részét (pl. #shop) és a megfelelő elemhez görget.
 * Használható a belső horgonyok (pl. <Link to="/#shop">) React Router-rel történő használatához.
 */
const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    // Csak akkor fut le, ha a hash megváltozik (pl. a Link-re kattintáskor)
    if (location.hash) {
      // Megpróbálja megtalálni az elemet a hash alapján (pl. #shop -> elem id="shop")
      const element = document.getElementById(location.hash.substring(1));

      if (element) {
        // Görgetés az elemhez, sima animációval
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Ha nincs hash az URL-ben, vagy az oldal tetejére navigálunk,
      // biztosítjuk a lap tetejére görgetést.
      window.scrollTo(0, 0);
    }
  }, [location.hash]); // Ez a hook akkor fut le, ha a hash változik

  return null; // Ez a komponens nem renderel semmit
};

export default ScrollToHash;
