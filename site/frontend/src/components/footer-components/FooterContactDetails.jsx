import { getLocalizedSiteText } from '../../content/siteSettingsDefaults';

function FooterContactDetails({ texts, content = null, className = '' }) {
  const language = localStorage.getItem('language') || 'en';
  const contactUsText = content?.contactHeading
    ? getLocalizedSiteText(content.contactHeading, language)
    : texts && texts["contact-us:"] ? texts["contact-us:"].text : 'Contact us';
  const taxAddressText = content?.address
    ? getLocalizedSiteText(content.address, language)
    : texts && texts["tax-address"] ? texts["tax-address"].text : '';
  const sectionClassName = ['footer-right-section', 'footer-contact-section', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sectionClassName}>
      <h3 className="cardo footer-title">{contactUsText}</h3>
      <div className="footer-contact-links">
        <a className="mail" href={`mailto:${content?.email || "info@talesofreval.ee"}`}>
          {content?.email || "info@talesofreval.ee"}
        </a>
        <a className="phone" href={`tel:${content?.phone || "+37255604421"}`}>
          {content?.phone || "+372 5560 4421"}
        </a>
      </div>
      <p className="footer-company-meta">
        {content?.companyName || 'OÜ Satsang'} <br />
        {content?.companyReg || 'Reg no. 14443936'} <br />
        {taxAddressText}
      </p>
    </div>
  );
}

export default FooterContactDetails;
