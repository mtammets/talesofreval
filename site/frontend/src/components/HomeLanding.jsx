import PageHero from './PageHero';

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
    <PageHero
      className="home-landing"
      mediaClassName="home-landing-media"
      backgroundImage={backgroundImage}
      isEditable={isEditable}
      onEditBackground={onEditBackground}
      overlay={<div className="home-landing-overlay" style={overlayStyles} />}
    >
      <div className="container home-landing-content">
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
    </PageHero>
  );
}

export default HomeLanding;
