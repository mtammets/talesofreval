import PageHero from './PageHero';

function HomeLanding({
  texts,
  backgroundMediaItems = [],
  isEditable = false,
  onEditBackground,
}) {
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
      backgroundMediaItems={backgroundMediaItems}
      isEditable={isEditable}
      onEditBackground={onEditBackground}
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
