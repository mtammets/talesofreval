import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import PaymentMethodButton from '../components/PaymentMethodButton';
import Spinner from '../components/Spinner';
import { DEFAULT_PAYMENT_CARD_COPY } from '../content/paymentCardDefaults';
import {
  DEFAULT_SITE_SETTINGS,
  getLocalizedSiteText,
  resolveSiteImage,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';
import {
  findGuideByTipId,
  getActiveGuidePaymentLinks,
  getGuideDisplayName,
} from '../utils/guideTips';
import SeoHead from '../components/SeoHead';

const GUIDE_TIP_MEDIA_SIZES = '(max-width: 768px) calc(100vw - 48px), 440px';
const GUIDE_TIP_THEME_COLOR = '#202533';

function GuideTipPage({
  siteSettings = DEFAULT_SITE_SETTINGS,
  isSiteSettingsReady = false,
}) {
  const { guideId = '' } = useParams();
  const language = localStorage.getItem('language') || 'en';
  const guideLabel = language === 'ee' ? 'Sinu giid täna' : 'Your guide today';
  const backLabel = language === 'ee' ? 'Tagasi kodulehele' : 'Back to the main site';
  const emptyLabel =
    language === 'ee'
      ? 'Selle giidi tipilehte ei leitud.'
      : 'We could not find a tip page for this guide.';
  const noPaymentsLabel =
    language === 'ee'
      ? 'Sellel giidil ei ole praegu aktiivseid makselinke.'
      : 'This guide does not have any active payment links right now.';

  const teamMembers = useMemo(() => {
    const sharedMembers = siteSettings.contactPage?.teamMembers?.length
      ? siteSettings.contactPage.teamMembers
      : siteSettings.homeTeam?.members;

    return Array.isArray(sharedMembers) ? sharedMembers : [];
  }, [siteSettings.contactPage?.teamMembers, siteSettings.homeTeam?.members]);

  const guide = useMemo(
    () => findGuideByTipId(teamMembers, guideId),
    [guideId, teamMembers]
  );

  const paymentCardCopy =
    siteSettings.contactPage?.paymentCard ||
    siteSettings.homeTeam?.paymentCard ||
    DEFAULT_PAYMENT_CARD_COPY;
  const titleText = getLocalizedSiteText(
    paymentCardCopy?.title,
    language,
    getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.title, language)
  );
  const introText = getLocalizedSiteText(
    paymentCardCopy?.intro,
    language,
    getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.intro, language)
  );
  const guideName = getGuideDisplayName(guide);
  const activePaymentLinks = useMemo(() => getActiveGuidePaymentLinks(guide), [guide]);
  const responsiveMedia = resolveSiteImageMedia(
    guide?.image,
    guide?.imageKey,
    GUIDE_TIP_MEDIA_SIZES
  );
  const guideImageSrc = responsiveMedia?.src || resolveSiteImage(guide?.image, guide?.imageKey);
  const imagePosition = responsiveMedia?.objectPosition || '50% 50%';
  const imageScale = responsiveMedia?.zoom || 1;
  const guideTipTitle = guide
    ? `${titleText} - ${guideName} | Tales of Reval`
    : 'Guide tip page | Tales of Reval';
  const guideTipDescription = guide
    ? `${titleText} ${guideName}. ${introText}`
    : 'Direct tip page for Tales of Reval guides.';

  if (!isSiteSettingsReady) {
    return (
      <div className="guide-tip-page guide-tip-page--loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="guide-tip-page">
      <SeoHead
        title={guideTipTitle}
        description={guideTipDescription}
        path={`/tip/${guideId}`}
        image={guideImageSrc}
        imageAlt={guideName || 'Tales of Reval'}
        language={language}
        noindex
        themeColor={GUIDE_TIP_THEME_COLOR}
        statusBarStyle="black-translucent"
      />

      <div
        className="guide-tip-page__backdrop"
        style={guideImageSrc ? { backgroundImage: `url(${guideImageSrc})` } : undefined}
        aria-hidden="true"
      />

      <main className="guide-tip-page__shell">
        <Link to="/" className="guide-tip-page__brand">
          Tales of Reval
        </Link>

        <section
          className={`guide-tip-page__card${guide ? '' : ' guide-tip-page__card--empty'}`}
        >
          {guide ? (
            <>
              <div className="guide-tip-page__media-panel">
                <span className="guide-tip-page__eyebrow">{guideLabel}</span>
                <div className="guide-tip-page__portrait-frame">
                  {guideImageSrc ? (
                    <img
                      className="guide-tip-page__portrait"
                      src={guideImageSrc}
                      srcSet={responsiveMedia?.srcSet || undefined}
                      sizes={responsiveMedia?.sizes || undefined}
                      alt={guideName}
                      style={{
                        objectPosition: imagePosition,
                        transform: `scale(${imageScale})`,
                        transformOrigin: imagePosition,
                      }}
                    />
                  ) : (
                    <div className="guide-tip-page__portrait-placeholder" />
                  )}
                </div>
                <h1 className="guide-tip-page__guide-name">{guideName}</h1>
              </div>

              <div className="guide-tip-page__content">
                <h2 className="guide-tip-page__title">{titleText}</h2>
                <p className="guide-tip-page__intro">{introText}</p>

                {activePaymentLinks.length ? (
                  <div className="guide-tip-page__payments">
                    {activePaymentLinks.map((method) => (
                      <PaymentMethodButton
                        key={method.name}
                        name={method.name}
                        link={method.link}
                        className="payment-card__method guide-tip-page__payment-method"
                        openInNewTab={false}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="guide-tip-page__empty-copy">{noPaymentsLabel}</p>
                )}

                <Link to="/" className="guide-tip-page__back-link">
                  {backLabel}
                </Link>
              </div>
            </>
          ) : (
            <div className="guide-tip-page__empty-state">
              <h1 className="guide-tip-page__title">{emptyLabel}</h1>
              <Link to="/" className="guide-tip-page__back-link">
                {backLabel}
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default GuideTipPage;
