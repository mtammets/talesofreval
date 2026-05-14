import PageHero from './PageHero';
import { parseBracketLinkText } from '../utils/parseBracketLinkText';

function HomeLanding({
  texts,
  backgroundMediaItems = [],
  initialImageIndex = 0,
  isEditable = false,
  onEditBackground,
}) {
  if (!texts) {
    return null;
  }

  const storytellingText = texts["storytelling"] ? texts["storytelling"].text : null;
  const reinventedText = texts["reinvented"] ? texts["reinvented"].text : null;
  const imaginationVoiceText = texts["imagination-voice"] ? texts["imagination-voice"].text : null;
  const { before, linkText, after } = parseBracketLinkText(imaginationVoiceText);

  return (
    <PageHero
      className="home-landing"
      mediaClassName="home-landing-media"
      backgroundMediaItems={backgroundMediaItems}
      initialImageIndex={initialImageIndex}
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
            {linkText ? (
              <>
                {before}
                <a className="home-landing-link" href="#footer-booking">
                  {linkText}
                </a>
                {after}
              </>
            ) : (
              imaginationVoiceText
            )}
          </p>
        </div>
      </div>
    </PageHero>
  );
}

export default HomeLanding;
