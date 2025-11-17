import React, { useEffect, useRef, useState } from "react";
import "./VineyardWebsite.css";

const AboutUs = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`about-section ${visible ? "visible" : ""}`}
    >
      <div id="rolunk" className="about-text">
        <h2>Kisfalusi Pince Klubb</h2>
        <p>
          A Tradíció és Minőség Birtoka. <br /> A Kisfalusi Pince Klubb egy több
          évtizedes múltra visszatekintő családi borászat, amely apáról fiúra
          öröklődve őrzi a hagyományokat és a minőséget. <br /> A birtok 1000 hektáros
          ültetvénnyel rendelkezik, ahol többféle szőlőt termesztenek, hogy
          változatos, karakteres borokat állíthassanak elő. <br /> A pince maga 300
          négyzetméteres, modern felszereltségű, ugyanakkor megőrzi a régi
          borászati hagyományok hangulatát. <br /> A borokat rendszeresen versenyekre
          viszik, ahol mindig kiemelkedő eredményeket érnek el. <br /> A Kisfalusi
          Pince Klubb a Duna partján található, így a termőhely különleges
          mikroklímája hozzájárul a borok jellegzetes ízvilágához. <br /> Jelenleg a
          birtokot Horváth Sándor vezeti, aki büszkén folytatja a család
          generációkon átívelő örökségét. <br /> A Kisfalusi Pince Klubb a minőség, a
          tradíció és a természetes ízek találkozása – ahol minden korty egy
          történetet mesél.
        </p>
      </div>

      <div className="about-image">
        <img src="Image/ültetvény.jpg" alt="Borászat Képe" />
      </div>
    </section>
  );
};

export default AboutUs;
