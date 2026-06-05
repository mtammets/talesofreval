import FooterColumnLeft from '../components/footer-components/FooterColumnLeft.jsx';
import FooterColumnRight from '../components/footer-components/FooterColumnRight.jsx';
import SeoHead from '../components/SeoHead';
import { getFallbackTextsForCategory } from '../content/fallbackContent';

function BookingPage({ siteSettings, setShowFreeBookNow }) {
  const language = localStorage.getItem('language') || 'en';
  const footerTexts = getFallbackTextsForCategory('footer', language);
  const title =
    language === 'ee'
      ? 'Tasuta tuuri broneerimine | Tales of Reval'
      : 'Free Tour Booking | Tales of Reval';
  const description =
    language === 'ee'
      ? 'Ava Tales of Revali tasuta tuuri info ja broneerimisvorm mobiilis.'
      : 'Open Tales of Reval free tour details and booking form on mobile.';

  return (
    <main className="footer booking-page">
      <SeoHead
        title={title}
        description={description}
        path="/booking"
        noindex
        themeColor="#202533"
        statusBarStyle="black-translucent"
      />
      <div className="container">
        <div className="footer-columns booking-page__columns">
          <FooterColumnLeft
            texts={footerTexts}
            content={siteSettings?.footer}
            setShowFreeBookNow={setShowFreeBookNow}
          />
          <FooterColumnRight texts={footerTexts} content={siteSettings?.footer} />
        </div>
      </div>
    </main>
  );
}

export default BookingPage;
