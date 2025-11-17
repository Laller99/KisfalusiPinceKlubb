import React, { useEffect } from "react";
import "./VineyardWebsite.css";

const AwardWinesSection = () => {
  useEffect(() => {
    // 1. Az Intersection Observer beállításai
    const observerOptions = {
      root: null, // A viewport (böngésző nézet) lesz a gyökér
      rootMargin: "0px",
      threshold: 0.2, // Akkor aktiválódjon, ha a szekció 20%-a látható
    };

    // 2. A visszahívási (callback) függvény
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // A szekció látható!

          // Kiválasztjuk az összes kártyát
          const cards = entry.target.querySelectorAll(".wine-card");

          // Hozzáadjuk az indító osztályt minden kártyához
          cards.forEach((card) => {
            card.classList.add("is-visible");
          });

          // Megszüntetjük a figyelést (hogy csak egyszer fusson le)
          observer.unobserve(entry.target);
        }
      });
    };

    // 3. Létrehozzuk és elindítjuk az Obszervátort
    const awardWinesSection = document.getElementById("award-wines");

    if (awardWinesSection) {
      const observer = new IntersectionObserver(
        observerCallback,
        observerOptions
      );
      observer.observe(awardWinesSection);
    }

    // Cleanup függvény (React környezetben fontos)
    return () => {
      if (awardWinesSection) {
        // A hook eltávolításakor szüntessük meg a figyelést
        // (Ezt a fenti unobserve már megtette, de jó szokás)
        // observer.unobserve(awardWinesSection);
      }
    };
  }, []);

  // ... (A komponensed JSX-e) ...
  return (
    <section id="award-wines" className="award-wines">
      <h2>Díjnyertes boraink</h2>
      <div className="wine-grid">
        <div className="wine-card">
          <img src="Image/SzürkeAlkony.png" alt="Szürke Alkony" />
          <h3>
            <span>Szürke Alkony 2019</span>
          </h3>
          <p>
            <span>
              Intenzív illatvilág, gyümölcsös jegyekkel és eleganciával.
            </span>
          </p>
        </div>
        <div className="wine-card">
          <img src="Image/DémonVér.png" alt="Démon Vér" />
          <h3>
            <span>Démon Vér 2020</span>
          </h3>
          <p>
            {" "}
            <span>Kiegyensúlyozott, bársonyos vörösbor, díjnyertes tétel.</span>
          </p>
        </div>
        <div className="wine-card">
          <img src="Image/ÉszakSzíve.png" alt="Észak Szíve" />
          <div>
            <h3>
              <span>Észak Szíve 2021</span>
            </h3>
            <p>
              <span>
                Friss, ropogós, ásványos jégbor, Norvégia fjordjai mellől.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardWinesSection;
