import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grape,
  ShoppingBasket,
  Droplet,
  Wine,
  Sparkles,
  Info,
} from "lucide-react";
import "./HarvestSimulation.css";

// A Step leírások változatlanok maradnak
const stepDescriptions = {
  1: {
    title: "Szüretelés",
    description:
      "A szőlőszüret az első és legfontosabb lépés. A szőlőt kézzel szedjük le a tőkéről, amikor elérte az optimális érettséget. A cukor- és savtartalom egyensúlya most tökéletes.",
    instruction: "Fogd meg a szőlőfürtöt és húzd le a kosárba!",
  },
  2: {
    title: "Kosárból a dézsába",
    description:
      "A szedett szőlőt a kosárból a présház dézsájába öntjük. Itt fog megtörténni a szőlő zúzása és préselése, ami a borkészítés következő lépése.",
    instruction: "Húzd a teli kosarat a bal alsó sarokba, a dézsába!",
  },
  3: {
    title: "Tiprás és mustolás",
    description:
      "A dézsában a szőlőszemeket összetapodjuk vagy préseljük, hogy kiengedjük a levet - a mustot. Ez a folyamat szabadítja fel a szőlő ízét és aromáit. Régen lábbal taposták, ma géppel préselik.",
    instruction:
      "Kattints többször a dézsára a szőlő tiprásához! ({crushClicks}/20 kattintás)", // Dinamikus jelölő
  },
  4: {
    title: "Érlelés hordóban",
    description:
      "A must fahordókban érik, ahol lassan borrá alakul. Az érlelés során a fa átereszti a levegőt, és különleges aromákat ad a bornak. Ez a folyamat hónapokig vagy évekig is tarthat.",
    instruction:
      "Kattints a hordókra, hogy ellenőrizd az érlelési folyamatot! ({barrelChecks}/15 ellenőrzés)", // Dinamikus jelölő
  },
  5: {
    title: "Palackozás",
    description:
      "A kész bort palackokba töltjük és dugóval lezárjuk. A palackozott bor tovább érhet, és végül az asztalokra kerül. Egy hosszú és gondos munka eredménye!",
    instruction:
      "Kattints minden palackra egyesével a palackozás befejezéséhez!",
  },
};

const HarvestSimulation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [grapeInBasket, setGrapeInBasket] = useState(false);
  const [grapeInVat, setGrapeInVat] = useState(false);
  const [crushClicks, setCrushClicks] = useState(0);
  const [barrelChecks, setBarrelChecks] = useState(0);
  const [bottledCount, setBottledCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // A Framer Motion onDragEnd kezeli a touchmove/touchend eseményeket, így azok rendben vannak.
  const handleGrapeToBasket = () => {
    setGrapeInBasket(true);
    setTimeout(() => setCurrentStep(2), 800);
  };

  const handleBasketToVat = () => {
    setGrapeInVat(true);
    setTimeout(() => setCurrentStep(3), 800);
  };

  // JAVÍTÁS: CSAK onClick-et kezelünk.
  const handleCrushClick = () => {
    if (currentStep === 3 && crushClicks < 20) {
      setCrushClicks((prevCount) => {
        const newClicks = prevCount + 1;
        if (newClicks >= 20) {
          setTimeout(() => setCurrentStep(4), 800);
          return 20;
        }
        return newClicks;
      });
    }
  };

  // JAVÍTÁS: CSAK onClick-et kezelünk.
  const handleBarrelCheck = () => {
    if (currentStep === 4 && barrelChecks < 15) {
      setBarrelChecks((prevChecks) => {
        const newChecks = prevChecks + 1;
        if (newChecks >= 15) {
          setTimeout(() => setCurrentStep(5), 800);
          return 15;
        }
        return newChecks;
      });
    }
  };

  // 🛠 JAVÍTÁS: Visszaállítottuk a clicket és hozzáadtuk az e.preventDefault-et
  const handleBottleClick = (bottleIndex, e) => {
    // ❗️ JAVÍTÁS: Megakadályozza, hogy mobilon a touch után click is elsüljön.
    if (e && e.type === "touchstart") e.preventDefault();
    if (e) e.stopPropagation();

    if (currentStep === 5 && bottledCount === bottleIndex && bottledCount < 3) {
      setBottledCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount >= 3) {
          setTimeout(() => setShowCelebration(true), 500);
          return 3; // Maximum értékre korlátozás
        }
        return newCount;
      });
    }
  };

  const getStepPosition = (step) => {
    const positions = [
      { top: "15%", left: "15%" },
      { top: "25%", left: "70%" },
      { top: "45%", left: "25%" },
      { top: "65%", left: "65%" },
      { top: "80%", left: "30%" },
    ];
    return positions[step - 1];
  };

  const PathLine = ({ from, to, active }) => {
    const fromPos = getStepPosition(from);
    const toPos = getStepPosition(to);

    return (
      <motion.svg
        className="path-line" // CSS osztály
        style={{ zIndex: 0 }}
      >
        <motion.path
          d={`M ${fromPos.left} ${fromPos.top} Q ${
            parseFloat(fromPos.left) +
            (parseFloat(toPos.left) - parseFloat(fromPos.left)) / 2
          }% ${
            parseFloat(fromPos.top) +
            (parseFloat(toPos.top) - parseFloat(fromPos.top)) / 2 -
            5
          }% ${toPos.left} ${toPos.top}`}
          stroke="var(--wine-red)" // CSS változó
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.8 : 0.3 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </motion.svg>
    );
  };

  const resetSimulation = () => {
    setCurrentStep(1);
    setGrapeInBasket(false);
    setGrapeInVat(false);
    setCrushClicks(0);
    setBarrelChecks(0);
    setBottledCount(0);
    setShowCelebration(false);
  };

  // 🛠 JAVÍTÁS: Az info-panel instruction-text tartalmát külön számoljuk
  const renderInstructionText = () => {
    const instruction = stepDescriptions[currentStep].instruction;
    switch (currentStep) {
      case 3:
        return instruction.replace(/\{crushClicks\}/, crushClicks);
      case 4:
        return instruction.replace(/\{barrelChecks\}/, barrelChecks);
      default:
        return instruction;
    }
  };

  return (
    <div className="harvest-simulation">
      {/* Background Pattern */}
      <div className="background-pattern">
        <div className="inner-pattern" />
      </div>

      {/* Info Panel */}
      <motion.div
        className="info-panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="card info-card">
          <div className="info-header">
            <Info className="icon info-icon" />
            <div>
              <h2 className="info-title">
                {currentStep}. {stepDescriptions[currentStep].title}
              </h2>
              <p className="info-description">
                {stepDescriptions[currentStep].description}
              </p>
              <div className="instruction-box">
                <p className="instruction-text">{renderInstructionText()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Path Lines */}
      {[1, 2, 3, 4].map((step) => (
        <PathLine
          key={step}
          from={step}
          to={step + 1}
          active={currentStep > step}
        />
      ))}

      {/* Step 1: Grape Picking */}
      <motion.div
        className="step-item"
        style={getStepPosition(1)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <motion.div
            drag={currentStep === 1}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                handleGrapeToBasket();
              }
            }}
            className={`card step-grape ${
              currentStep === 1 ? "draggable" : "disabled"
            }`}
            whileHover={currentStep === 1 ? { scale: 1.05 } : {}}
          >
            <Grape className="icon large-icon wine-red-text" />
          </motion.div>
          {currentStep === 1 && (
            <motion.p
              className="step-label wine-red-text"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
              }}
            >
              Húzd le a szőlőt a kosárba! ↓
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Basket (Step 1 target) */}
      {currentStep >= 1 && (
        <motion.div
          className="step-item"
          style={{ top: "35%", left: "15%" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <div
              className={`card step-basket ${
                grapeInBasket ? "filled-border" : "empty-border"
              }`}
            >
              <ShoppingBasket className="icon medium-icon secondary-text" />
              {grapeInBasket && (
                <motion.div
                  className="grape-in-basket"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 360] }}
                >
                  <Grape className="icon small-icon wine-red-text" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Vat (Step 2 target) */}
      {currentStep >= 2 && (
        <motion.div
          className="step-item"
          style={{ top: "55%", left: "25%" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <div
              className={`card step-vat ${
                grapeInVat ? "filled-vat-border" : "empty-border"
              }`}
            >
              <Droplet className="icon medium-icon light-wine-text" />
              {grapeInVat && (
                <motion.div
                  className="grape-in-vat"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 360] }}
                >
                  <Grape className="icon small-icon wine-red-text" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Basket to Vat */}
      {currentStep >= 2 && (
        <motion.div
          className="step-item"
          style={getStepPosition(2)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            drag={currentStep === 2}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (info.offset.x < -150 && info.offset.y > 80) {
                handleBasketToVat();
              }
            }}
            className={`card step-basket-drag ${
              currentStep === 2 ? "draggable" : "disabled"
            }`}
            whileHover={currentStep === 2 ? { scale: 1.05 } : {}}
          >
            <ShoppingBasket className="icon large-icon secondary-text" />
            <Grape className="icon small-icon wine-red-text basket-grape-icon" />
          </motion.div>
          {currentStep === 2 && (
            <motion.p
              className="step-label secondary-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
              }}
            >
              Húzd a kosarat a dézsába! ↙
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Step 3: Vat and Must Preparation */}
      {currentStep >= 3 && (
        <motion.div
          className="step-item"
          style={getStepPosition(3)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className={`card step-vat-crush ${
              currentStep === 3 ? "clickable crush-active" : "disabled"
            }`}
            // ✅ Visszaállítva a click a desktop működéshez
            onClick={handleCrushClick}
            // ✅ Megtartva a touchstart a mobil működéshez (a prevDefault védi a duplázástól)
            onTouchStart={handleCrushClick}
            whileHover={currentStep === 3 ? { scale: 1.05 } : {}}
            whileTap={currentStep === 3 ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={
                currentStep === 3 && crushClicks > 0
                  ? {
                      rotate: [0, -5, 5, -5, 5, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <Droplet className="icon large-icon light-wine-text mb-4" />
            </motion.div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill crush-progress"
                initial={{ width: 0 }}
                animate={{ width: `${(crushClicks / 20) * 100}%` }}
              />
            </div>
            <p className="progress-text">Tiprás: {crushClicks}/20</p>
          </motion.div>
          {currentStep === 3 && (
            <motion.p
              className="step-label light-wine-text step-label-multiline"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
              }}
            >
              Kattints ide többször! ☝️
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Step 4: Barrel Aging */}
      {currentStep >= 4 && (
        <motion.div
          className="step-item"
          style={getStepPosition(4)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className={`card step-barrel ${
              currentStep === 4 ? "clickable barrel-active" : "disabled"
            }`}
            // ✅ Visszaállítva a click a desktop működéshez
            onClick={handleBarrelCheck}
            // ✅ Megtartva a touchstart a mobil működéshez
            onTouchStart={handleBarrelCheck}
            whileHover={currentStep === 4 ? { scale: 1.05 } : {}}
            whileTap={currentStep === 4 ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={
                currentStep === 4 && barrelChecks > 0
                  ? {
                      y: [0, -5, 0],
                      rotate: [0, 3, -3, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <Wine className="icon large-icon brown-text mb-4" />
            </motion.div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill barrel-progress"
                initial={{ width: 0 }}
                animate={{ width: `${(barrelChecks / 15) * 100}%` }}
              />
            </div>
            <p className="progress-text">Ellenőrzés: {barrelChecks}/15</p>
          </motion.div>
          {currentStep === 4 && (
            <motion.p
              className="step-label brown-text step-label-multiline"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
              }}
            >
              Kattints a hordóra! ☝️
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Step 5: Bottling */}
      {currentStep >= 5 && (
        <motion.div
          className="step-item"
          style={getStepPosition(5)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="card step-bottling active-border">
            <div className="bottles-container">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  // ✅ Visszaállítva a click a desktop működéshez
                  onClick={(e) => handleBottleClick(i, e)}
                  // ✅ Megtartva a touchstart a mobil működéshez
                  onTouchStart={(e) => handleBottleClick(i, e)}
                  className={`bottle-item ${
                    currentStep === 5 && bottledCount === i ? "clickable" : ""
                  }`}
                  whileHover={
                    currentStep === 5 && bottledCount === i
                      ? { scale: 1.15, rotate: [0, -5, 5, 0] }
                      : {}
                  }
                  whileTap={
                    currentStep === 5 && bottledCount === i
                      ? { scale: 0.9 }
                      : {}
                  }
                >
                  <Wine
                    className={`icon medium-icon ${
                      bottledCount > i ? "accent-text" : "muted-text"
                    }`}
                  />
                  {bottledCount > i && (
                    <motion.div
                      className="bottled-sparkle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Sparkles className="icon tiny-icon accent-foreground-text" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="bottling-progress-text accent-text">
              Palackozás: {bottledCount}/3
            </p>
          </div>
          {currentStep === 5 && bottledCount < 3 && (
            <motion.p
              className="step-label accent-text step-label-multiline"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
              }}
            >
              Kattints a palackokra sorban! ☝️
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-content"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="icon huge-icon gold-text mb-6" />
              </motion.div>
              <h1 className="celebration-title">Gratulálunk!</h1>
              <p className="celebration-subtitle gold-text">
                Elkészült a bor! 🍷
              </p>
              <motion.button
                className="reset-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetSimulation}
              >
                Új szüret kezdése
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        {[1, 2, 3, 4, 5].map((step) => (
          <motion.div
            key={step}
            className={`progress-step ${
              currentStep >= step ? "active-step" : "inactive-step"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: step * 0.1 }}
          >
            {step}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HarvestSimulation;
