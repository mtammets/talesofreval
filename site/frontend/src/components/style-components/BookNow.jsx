import { ArrowRight } from "../../icons/ArrowRight.tsx";

function BookNow({ texts, label = null }) {
  const language =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('language') || 'en'
      : 'en';
  const fallbackLabel = label || (language === 'ee' ? 'Broneeri' : 'Book now');
  const bookNowText = texts?.["book-now"]?.text || fallbackLabel;

  return (
    <button className="book-now-button">
      <span className="button-text">{bookNowText}</span>
      <span className="button-icon" style={{ color: "#202533" }}>
        <ArrowRight />
      </span>
    </button>
  );
}

export default BookNow;
