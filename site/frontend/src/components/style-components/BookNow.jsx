import { useState } from 'react';
import mailPigeonIcon from '../../img/book-now-pigeon-mail.png';
import restingPigeonIcon from '../../img/book-now-pigeon-resting.png';

function BookNow({ texts, label = null, onClick = undefined }) {
  const language =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('language') || 'en'
      : 'en';
  const [showRestingPigeon, setShowRestingPigeon] = useState(true);
  const fallbackLabel = language === 'ee' ? 'Broneeri' : 'Book now';
  const bookNowText = label || texts?.["book-now"]?.text || fallbackLabel;
  const activeIcon = showRestingPigeon ? restingPigeonIcon : mailPigeonIcon;
  const iconState = showRestingPigeon ? 'resting-pigeon' : 'mail-pigeon';

  const handleClick = (event) => {
    setShowRestingPigeon((current) => !current);
    onClick?.(event);
  };

  return (
    <button type="button" className="book-now-button" onClick={handleClick}>
      <span className="button-text">{bookNowText}</span>
      <span className="button-icon" data-icon-state={iconState} aria-hidden="true">
        <img src={activeIcon} alt="" />
      </span>
    </button>
  );
}

export default BookNow;
