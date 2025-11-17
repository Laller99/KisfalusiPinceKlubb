import React, { useEffect, useState } from "react";

const LayeredHero = () => {
  const [isCopyVisible, setIsCopyVisible] = useState(false);

  useEffect(() => {
    const boxes = Array.from(document.querySelectorAll(".hs-box"));

    const title = document.querySelector(".hs-title");

    const sub = document.querySelector(".hs-sub");

    const cta = document.querySelector(".hs-cta");

    if (boxes.length === 0 || !title || !sub || !cta) {
      console.warn("LayeredHero: Hiányzó DOM elemek az animációhoz.");

      return;
    }

    const boxStagger = 140; // ms

    const boxAnimDelay = 300; // Kis késleltetés a külső intro után

    const finalDelay = 500; // a boxok után a cím beúszása

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    (async function runLayeredHeroSequence() {
      const belépőElem = document.querySelector(".belépő");
      const lightSource = document.querySelector(".light-source");

      if (lightSource && belépőElem) {
        // 1. ELŐSZÖR: Szerezd be a kezdeti értékeket (csak reflow kényszerítése)
        // Megjegyzés: A "void" használata segít, de a kulcs a következő lépésben van!
        void lightSource.offsetWidth;
        void belépőElem.offsetWidth;

        // 2. MÁSODSZOR: A KLASSZISOK HOZZÁADÁSA egyetlen végrehajtási blokkban
        lightSource.classList.add("animate-to-sun");
        belépőElem.classList.add("belépő-animated");
      }

      const layers = document.querySelector(".hs-layers");

      if (layers) {
        layers.style.opacity = "0";
      }
      await wait(100);
      if (layers) {
        layers.style.opacity = "1"; // Ez indítja a CSS-ben beállított 1.5s átmenetet
      }
      await wait(boxAnimDelay);

      // 1. Boxok rendezése a data-order attribútum szerint (1, 2, 3...)

      boxes.sort((a, b) => {
        const ao = parseInt(a.dataset.order || 0, 10);

        const bo = parseInt(b.dataset.order || 0, 10);

        return ao - bo;
      });

      // 2. Boxok érkezése (staggered)

      for (let i = 0; i < boxes.length; i++) {
        const el = boxes[i];

        // Itt jön az egymásutániság, mivel az await wait(boxStagger)

        // megakadályozza, hogy a for ciklus túl gyorsan lefusson.

        el.classList.add("hs-box--in");

        await wait(boxStagger);
      }

      // 3. VÉGLEGES ÁLLAPOT: Szöveg megjelenítésének indítása

      await wait(finalDelay);

      // Állapot frissítése: Innentől a hs-copy láthatóvá válik

      setIsCopyVisible(true);

      // Ezután a CSS animálja tovább a szöveget (staggered effect)

      title.classList.add("hs-title--in");

      await wait(120);

      sub.classList.add("hs-sub--in");

      await wait(120);

      cta.classList.add("hs-cta--in");
    })();
  }, []);

  // Dinamikus osztály a szöveges tartalom rejtéséhez/megjelenítéséhez

  const copyClasses = `hs-copy ${
    isCopyVisible ? "hs-copy--visible" : "hs-copy--hidden"
  }`;

  return (
    <section className="hs-hero" id="hero" aria-label="Hero: Prémium borok">
      <div className="hs-content">
        <div className="hs-layers">
          {/* ... A borosüvegek HTML-je marad változatlanul ... */}

          <div className="hs-box" data-order="1" style={{ "--z": 5 }}>
            <img
              className="hs-box__image"
              src="Image/Bor.png"
              alt="Hangszóró - Design nézet"
            />
          </div>

          <div className="hs-box" data-order="2" style={{ "--z": 4 }}>
            <img
              className="hs-box__image"
              src="Image/Bor1.png"
              alt="Hangszóró - Közeli kép"
            />
          </div>

          <div className="hs-box" data-order="3" style={{ "--z": 3 }}>
            <img
              className="hs-box__image"
              src="Image/Bor2.png"
              alt="Hangszóró - Teljes nézet"
            />
          </div>
        </div>

        {/* ÚJ: Dinamikus osztály használata a teljes szöveges konténeren */}

        <div className={copyClasses}>
          <h1 className="hs-title">
            Prémium Borok — <br /> Hagyomány & Minőség
          </h1>

          <p className="hs-sub">
            Teljesen új dimenzió a borászatban. Ellegancia + Nyugalom
            találkozása. <br />
            Minden kortyban ott a lélek.
          </p>

          <a className="hs-cta" href="#shop">
            Boraink
          </a>
        </div>
      </div>
    </section>
  );
};

export default LayeredHero;
