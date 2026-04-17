import SocialButton from '../style-components/SocialButton';
import { getLocalizedSiteText } from '../../content/siteSettingsDefaults';

function FooterColumnRight({ texts, content = null }) {
  const language = localStorage.getItem('language') || 'en';
  const followUsText = content?.followUsHeading
    ? getLocalizedSiteText(content.followUsHeading, language)
    : texts && texts["follow-us:"] ? texts["follow-us:"].text : '';
  const contactUsText = content?.contactHeading
    ? getLocalizedSiteText(content.contactHeading, language)
    : texts && texts["contact-us:"] ? texts["contact-us:"].text : '';
  const taxAddressText = content?.address
    ? getLocalizedSiteText(content.address, language)
    : texts && texts["tax-address"] ? texts["tax-address"].text : '';

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
      <div className="footer-right-section footer-contact-section">
        <h3 className="cardo footer-title">{contactUsText}</h3>
        <div className="footer-contact-links">
          <a className="mail" href={`mailto:${content?.email || "info@talesofreval.ee"}`}>{content?.email || "info@talesofreval.ee"}</a>
          <a className="phone" href={`tel:${content?.phone || "+37255604421"}`}>{content?.phone || "+372 5560 4421"}</a>
        </div>
        <p className="footer-company-meta">
          {content?.companyName || 'OÜ Satsang'} <br />
          {content?.companyReg || 'Reg no. 14443936'} <br />
          {taxAddressText}
        </p>
      </div>
    </div>
  );
}

export default FooterColumnRight;
