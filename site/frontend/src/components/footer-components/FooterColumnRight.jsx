import SocialButton from '../style-components/SocialButton';
import { getLocalizedSiteText } from '../../content/siteSettingsDefaults';
import FooterContactDetails from './FooterContactDetails.jsx';

function FooterColumnRight({ texts, content = null }) {
  const language = localStorage.getItem('language') || 'en';
  const followUsText = content?.followUsHeading
    ? getLocalizedSiteText(content.followUsHeading, language)
    : texts && texts["follow-us:"] ? texts["follow-us:"].text : '';

  return (
    <div className="footer-column footer-column-right">
      <div className="footer-right-section">
        <h3 className="cardo footer-title">{followUsText}</h3>
        <div className="social-buttons">
          <SocialButton icon="Facebook" text="Facebook" link={content?.socialLinks?.facebook || "https://www.facebook.com/TalesofReval/"} />
          <SocialButton icon="Instagram" text="Instagram" link={content?.socialLinks?.instagram || "https://www.instagram.com/talesofreval/"} />
          <SocialButton icon="TripAdvisor" text="TripAdvisor" link={content?.socialLinks?.tripadvisor || "https://www.tripadvisor.co.uk/Attraction_Review-g274958-d14768095-Reviews-Tales_of_Reval-Tallinn_Harju_County.html"} />
          <SocialButton icon="AirBnB" text="Airbnb" link={content?.socialLinks?.airbnb || "https://www.airbnb.co.uk/experiences/1096623"} />
        </div>
      </div>
      <FooterContactDetails
        texts={texts}
        content={content}
        className="footer-contact-section-mobile-only"
      />
    </div>
  );
}

export default FooterColumnRight;
