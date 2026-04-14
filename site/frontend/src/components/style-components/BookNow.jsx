import { ArrowRight } from "../../icons/ArrowRight.tsx";

function BookNow({ texts }) {
  const bookNowText = texts?.["book-now"]?.text || null;

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
