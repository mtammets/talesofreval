import SocialButton from '../style-components/SocialButton';

function FooterColumnRight({ texts }) {
  const followUsText = texts && texts["follow-us:"] ? texts["follow-us:"].text : '';
  const contactUsText = texts && texts["contact-us:"] ? texts["contact-us:"].text : '';
  const taxAddressText = texts && texts["tax-address"] ? texts["tax-address"].text : '';

  return (
    <div className="footer-column footer-column-right">
      <div className="footer-right-section">
        <h3 className="cardo footer-title">{followUsText}</h3>
        <div className="social-buttons">
          <SocialButton icon="Facebook" text="Facebook" link="https://www.facebook.com/TalesofReval/" />
          <SocialButton icon="Instagram" text="Instagram" link="https://www.instagram.com/talesofreval/" />
          <SocialButton icon="TripAdvisor" text="TripAdvisor" link="https://www.tripadvisor.co.uk/Attraction_Review-g274958-d14768095-Reviews-Tales_of_Reval-Tallinn_Harju_County.html" />
          <SocialButton icon="AirBnB" text="Airbnb" link="https://www.airbnb.co.uk/experiences/1096623" />
        </div>
      </div>
      <div className="footer-right-section footer-contact-section">
        <h3 className="cardo footer-title">{contactUsText}</h3>
        <div className="footer-contact-links">
          <a className="mail" href="mailto:info@talesofreval.ee">info@talesofreval.ee</a>
          <a className="mail" href="tel:+37255604421">+372 5560 4421</a>
        </div>
        <p className="footer-company-meta">
          OÜ Satsang <br />
          Reg no. 14443936 <br />
          {taxAddressText}
        </p>
      </div>
    </div>
  );
}

export default FooterColumnRight;
