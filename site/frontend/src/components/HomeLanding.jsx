import homebg from '../img/home-bg.webp';

function HomeLanding({ texts, backgroundImage, isEditable = false, onEditBackground }) {
  const overlayStyles = {
    '--hero-overlay-left': '0',
    '--hero-overlay-middle': '0',
    '--hero-overlay-right': '0',
    '--hero-overlay-flat': '0',
  };

  if (!texts) {
    return null;
  }

  const storytellingText = texts["storytelling"] ? texts["storytelling"].text : null;
  const reinventedText = texts["reinvented"] ? texts["reinvented"].text : null;
  const imaginationVoiceText = texts["imagination-voice"] ? texts["imagination-voice"].text : null;

  return (
    <div className="home-landing">
      <div
        className="home-landing-media"
        style={{ backgroundImage: `url(${backgroundImage || homebg})` }}
      >
        <div className="home-landing-overlay" style={overlayStyles} />
        <div className="container home-landing-content">
          {isEditable ? (
            <div className="home-landing-admin-actions">
              <button type="button" onClick={onEditBackground}>
                Edit
              </button>
            </div>
          ) : null}
          <div className="home-landing-copy">
            <h1 className="home-landing-title">
              {storytellingText} <br />
              {reinventedText}
            </h1>
            <p className="home-landing-text">
              {imaginationVoiceText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLanding;
