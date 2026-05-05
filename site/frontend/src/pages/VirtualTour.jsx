import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import virtualBg from '../img/virtual-bg.webp';
import phonesImage from '../img/phones-transparent-background.png';
import checkIcon from '../img/check-icon.svg';
import googleStore from '../img/google-store.png';
import appleStore from '../img/apple-store.png';
import VirtualTourPageEditorModal from '../components/VirtualTourPageEditorModal';
import { initiateStripe } from '../features/tour/tourSlice';
import {
  DEFAULT_SITE_SETTINGS,
  getLocalizedSiteText,
} from '../content/siteSettingsDefaults';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import { ArrowRight } from '../icons/ArrowRight.tsx';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const normalizeFeatureItems = (items = []) => {
  const fallbackItems = DEFAULT_SITE_SETTINGS.virtualTourPage.featureItems;
  const sourceItems = Array.isArray(items) && items.length ? items : fallbackItems;

  return fallbackItems.map((fallbackItem, index) => ({
    en: sourceItems[index]?.en || fallbackItem.en,
    ee: sourceItems[index]?.ee || fallbackItem.ee,
  }));
};

function SectionEditButton({ onClick, label = 'Edit' }) {
  return (
    <button type="button" className="section-edit-button" onClick={onClick}>
      {label}
    </button>
  );
}

function createDraftContent(siteSettings) {
  const baseContent = siteSettings.virtualTourPage || DEFAULT_SITE_SETTINGS.virtualTourPage;

  return {
    ...cloneValue(baseContent),
    featureItems: normalizeFeatureItems(baseContent.featureItems),
  };
}

function VirtualTour({
  setAdminToken = () => {},
  siteSettings = DEFAULT_SITE_SETTINGS,
  setSiteSettings = () => {},
  isEditMode = false,
}) {
  const dispatch = useDispatch();
  const language = localStorage.getItem('language') || 'en';
  const virtualTourPageSettings =
    siteSettings.virtualTourPage || DEFAULT_SITE_SETTINGS.virtualTourPage;

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pageContent, setPageContent] = useState(() => createDraftContent(siteSettings));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPageContent(createDraftContent(siteSettings));
  }, [siteSettings]);

  const handleAdminAuthError = (error, fallbackMessage) => {
    if (error?.response?.status === 401) {
      setStoredStoryAdminAuth('');
      setAdminToken('');
      toast.error('Admin session expired. Please log in again.');
      return;
    }

    toast.error(error?.response?.data?.message || error?.message || fallbackMessage);
  };

  const titleLine1 = getLocalizedSiteText(
    virtualTourPageSettings.titleLine1,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.titleLine1.en
  );
  const titleLine2 = getLocalizedSiteText(
    virtualTourPageSettings.titleLine2,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.titleLine2.en
  );
  const subtitle = getLocalizedSiteText(
    virtualTourPageSettings.subtitle,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.subtitle.en
  );
  const contentTitle = getLocalizedSiteText(
    virtualTourPageSettings.contentTitle,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.contentTitle.en
  );
  const featureItems = normalizeFeatureItems(virtualTourPageSettings.featureItems)
    .map((item, index) => ({
      id: `feature-${index + 1}`,
      text: getLocalizedSiteText(item, language, item.en),
    }))
    .filter((item) => item.text);
  const priceLabel =
    virtualTourPageSettings.priceLabel || DEFAULT_SITE_SETTINGS.virtualTourPage.priceLabel;
  const payNowText = getLocalizedSiteText(
    virtualTourPageSettings.payNowLabel,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.payNowLabel.en
  );
  const googlePlayUrl =
    virtualTourPageSettings.googlePlayUrl ||
    DEFAULT_SITE_SETTINGS.virtualTourPage.googlePlayUrl;
  const appStoreUrl =
    virtualTourPageSettings.appStoreUrl || DEFAULT_SITE_SETTINGS.virtualTourPage.appStoreUrl;
  const aboutTitle = getLocalizedSiteText(
    virtualTourPageSettings.aboutTitle,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.aboutTitle.en
  );
  const aboutCopy = getLocalizedSiteText(
    virtualTourPageSettings.aboutCopy,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.aboutCopy.en
  );
  const readMoreText = getLocalizedSiteText(
    virtualTourPageSettings.readMoreLabel,
    language,
    DEFAULT_SITE_SETTINGS.virtualTourPage.readMoreLabel.en
  );
  const readMoreUrl =
    virtualTourPageSettings.readMoreUrl || DEFAULT_SITE_SETTINGS.virtualTourPage.readMoreUrl;
  const pageTitle = `${titleLine1} ${titleLine2}`.trim();
  const pageDescription = `${contentTitle}. ${subtitle}`;
  const phonesAlt =
    language === 'ee'
      ? 'LePlace mobiilse kogemuse eelvaated'
      : 'LePlace mobile experience previews';
  const googlePlayAlt =
    language === 'ee' ? 'Hangi Google Playst' : 'Get it on Google Play';
  const appStoreAlt =
    language === 'ee' ? "Laadi alla App Store'ist" : 'Download on the App Store';

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const savedSettings = await siteSettingsService.updateVirtualTourPageSiteSettings({
        ...pageContent,
        featureItems: normalizeFeatureItems(pageContent.featureItems),
      });

      setSiteSettings(savedSettings);
      setPageContent(createDraftContent(savedSettings));
      setIsEditorOpen(false);
      toast.success('Virtual tour page updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Unable to update the virtual tour page.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPageContent(createDraftContent(siteSettings));
    setIsEditorOpen(false);
  };

  return (
    <>
      <main className="virtual-tour-page">
        <Helmet>
          <title>{pageTitle} - Tales of Reval</title>
          <meta name="description" content={pageDescription} />
        </Helmet>
        <section
          className="virtual-tour-page__hero"
          style={{ backgroundImage: `url(${virtualBg})` }}
        >
          <div className="virtual-tour-page__frame">
            {isEditMode ? (
              <div className="virtual-tour-page__editor-action">
                <SectionEditButton onClick={() => setIsEditorOpen(true)} />
              </div>
            ) : null}

            <div className="virtual-tour-page__intro">
              <h1 className="virtual-tour-page__title cardo">
                <span>{titleLine1}</span>
                <span>{titleLine2}</span>
              </h1>
              <p className="virtual-tour-page__subtitle cardo">{subtitle}</p>
            </div>

            <div className="virtual-tour-page__hero-body">
              <div className="virtual-tour-page__phones">
                <img src={phonesImage} alt={phonesAlt} />
              </div>

              <div className="virtual-tour-page__content">
                <h2 className="virtual-tour-page__content-title">{contentTitle}</h2>

                <ul className="virtual-tour-page__feature-list">
                  {featureItems.map((item) => (
                    <li key={item.id} className="virtual-tour-page__feature-item">
                      <img
                        className="virtual-tour-page__feature-icon"
                        src={checkIcon}
                        alt=""
                        aria-hidden="true"
                      />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="virtual-tour-page__pay-button"
                  onClick={() => dispatch(initiateStripe())}
                >
                  <span className="virtual-tour-page__pay-price">{priceLabel}</span>
                  <span>{payNowText}</span>
                  <ArrowRight size="1.35rem" />
                </button>

                <div className="virtual-tour-page__stores">
                  <a
                    className="virtual-tour-page__store virtual-tour-page__store--google"
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={googleStore} alt={googlePlayAlt} />
                  </a>
                  <a
                    className="virtual-tour-page__store virtual-tour-page__store--apple"
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={appleStore} alt={appStoreAlt} />
                  </a>
                </div>
              </div>
            </div>

            <div className="virtual-tour-page__about">
              <h2 className="virtual-tour-page__about-title">{aboutTitle}</h2>
              <p>{aboutCopy}</p>
              <a href={readMoreUrl} target="_blank" rel="noopener noreferrer">
                {readMoreText}
              </a>
            </div>
          </div>
        </section>
      </main>

      {isEditorOpen ? (
        <VirtualTourPageEditorModal
          content={pageContent}
          setContent={setPageContent}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      ) : null}
    </>
  );
}

export default VirtualTour;
