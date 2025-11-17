import React, { useState } from "react";
// Importáljuk a CSS-t a stílusokhoz (feltételezve, hogy a CSS-t FeedbackSystem.css néven mented el)
import "./FeedbackSystem.css";

// --- Fiktív Visszajelzési Adatok (Változatlan) ---
const initialFeedbackData = [
  {
    id: 1,
    name: "Kiss Anna",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    text: "Nagyon elégedett vagyok a szolgáltatással, gyors és profi volt minden.",
    rating: 5,
  },

  {
    id: 2,
    name: "Nagy Zoltán",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    text: "Az egyetlen hátrány az volt, hogy a felület néha lassú, de a tartalom kiváló.",
    rating: 4,
  },
  {
    id: 3,
    name: "Kovács Béla",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    text: "A termék teljesen megfelelt az elvárásaimnak. Örülök, hogy rátaláltam!",
    rating: 5,
  },
  {
    id: 4,
    name: "Tóth Bálint",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    text: "Egyszerűen imádom! A felület intuitív, a funkciók pont elegendőek.",
    rating: 5,
  },
  {
    id: 5,
    name: "Horváth Réka",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    text: "Apróbb hibák voltak, de az ügyfélszolgálat gyorsan megoldotta. Elégedett vagyok.",
    rating: 3,
  },
  {
    id: 6,
    name: "Szabó Dávid",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
    text: "Remek élmény! Bátran ajánlom másoknak is. Köszönöm a munkát!",
    rating: 4,
  },
];

// --- StarDisplay Komponens (Osztályneveket kap a stílusoktól) ---
const StarDisplay = ({ rating }) => {
  const totalStars = 5;

  return (
    <div className="rating">
      {" "}
      {/* A rating osztály a csillagok színét állítja be */}
      {Array.from({ length: totalStars }, (_, index) => {
        const ratingValue = index + 1;
        // Az "active" osztály fogja beállítani a kitöltött csillagok arany színét
        const starClassName = ratingValue <= rating ? "active" : "";
        return (
          <span key={index} className={`star-icon ${starClassName}`}>
            ★
          </span>
        );
      })}
    </div>
  );
};

const FeedbackCard = ({ feedback }) => {
  return (
    <div className="testimonial-card">
      {" "}
      <div className="user-info">
        <img
          src={feedback.avatarUrl}
          alt={`${feedback.name} avatárja`}
          className="user-avatar"
        />
        <span className="user-name">{feedback.name}</span>
      </div>
      <StarDisplay rating={feedback.rating} />
      <p className="review-text">{feedback.text}</p>
    </div>
  );
};

const FeedbackGrid = ({ feedbackData }) => {
  return (
    <div className="testimonials-grid">
      {" "}
      {feedbackData.map((feedback) => (
        <FeedbackCard key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
};

const UserRatingSection = () => {
  const totalStars = 5;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });

  const currentRating = hoverRating || rating;

  const handleSubmit = () => {
    if (rating === 0) {
      setSubmitMessage({
        text: "Kérlek, válassz egy értéket az elküldés előtt!",
        type: "error",
      });
      return;
    }

    setSubmitMessage({
      text: `Köszönjük a(z) ${rating}/5 csillagos értékelésedet!`,
      type: "success",
    });

    setTimeout(() => {
      setRating(0);
      setSubmitMessage({ text: "", type: "" });
    }, 3000);
  };

  return (
    <div className="user-rating-section">
      <h2 className="section-title">Oszd meg a véleményed!</h2>
      <p className="section-subtitle">
        Kattints a csillagokra, hogy megadd, mennyire vagy elégedett.
      </p>

      <div className="star-selection-container">
        {Array.from({ length: totalStars }, (_, index) => {
          const ratingValue = index + 1;
          const starClassName = ratingValue <= currentRating ? "active" : "";

          return (
            <span
              key={index}
              className={`star-selection-icon ${starClassName}`}
              onClick={() => setRating(ratingValue)}
              onMouseEnter={() => setHoverRating(ratingValue)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Értékelés: ${ratingValue} csillag`}
            >
              ★
            </span>
          );
        })}
      </div>

      <p className="current-rating-display">
        Aktuális értékelés:{" "}
        <span className="rating-value">
          {currentRating}/{totalStars}
        </span>
      </p>

      <div className="cta-container">
        <button className="submit-button" onClick={handleSubmit}>
          Értékelés Elküldése
        </button>
      </div>

      {submitMessage.text && (
        <div className={`submit-message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}
    </div>
  );
};

const FeedbackSystem = () => {
  return (
    <div className="testimonials-section">
      {" "}
      {/* A fő konténer stílusosztálya */}
      <h1 className="section-title">Ügyfél Visszajelzések</h1>
      {/* Ez a hely ahol megjelenhet az 'overall-rating' szöveg */}
      <p className="overall-rating">
        Összes értékelés: 4.3 / 5 (6 vélemény alapján)
      </p>
      <FeedbackGrid feedbackData={initialFeedbackData} />
      <UserRatingSection />
    </div>
  );
};

export default FeedbackSystem;
