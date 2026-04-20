import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowDown } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import Spinner from '../components/Spinner';
import ServicePageCards from '../components/ServicePageCards';
import BookNow from '../components/style-components/BookNow';
import ManagedServicesSection from '../components/ManagedServicesSection';
import HeroImageEditorModal from '../components/HeroImageEditorModal';
import PageHero from '../components/PageHero';
import ServicePageContentEditorModal from '../components/ServicePageContentEditorModal';
import ServicePageSectionEditorModal from '../components/ServicePageSectionEditorModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getService, reset } from '../features/services/serviceSlice';
import { getMiscTexts } from '../features/texts/textSlice';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import {
  FALLBACK_MISC_TEXTS,
  FALLBACK_MISC_TEXTS_EE,
} from '../content/fallbackContent';
import { getFallbackService } from '../content/fallbackServices';
import {
  DEFAULT_SITE_SETTINGS,
  HERO_MEDIA_SIZES,
  createPreviewMediaAsset,
  getLocalizedSiteText,
  resolveSiteImage,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';
import dmc_file from '../img/dmc_file.pdf';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
} from '../utils/prepareImageFilesForUpload';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const createLocalizedValue = (en = '', ee = '') => ({ en, ee });
const createSectionKey = (serviceKey) =>
  `${serviceKey}-section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const SERVICE_PAGE_CARD_IMAGE_KEYS = {
  team: ['serviceTeamSection1', 'serviceTeamSection2', 'serviceTeamSection3'],
  private: ['servicePrivateSection1', 'servicePrivateSection2', 'servicePrivateSection3'],
  quick: ['serviceQuickSection1', 'serviceQuickSection2', 'serviceQuickSection3'],
  destination: [
    'serviceDestinationSection1',
    'serviceDestinationSection2',
    'serviceDestinationSection3',
  ],
  wedding: ['serviceWeddingSection1', 'serviceWeddingSection2', 'serviceWeddingSection3'],
};

const DEFAULT_SECTION_LAYOUTS = ['image-left', 'image-right', 'image-left'];

const mergeLocalizedValue = (base = createLocalizedValue(), override = {}) => ({
  en: override?.en || base?.en || '',
  ee: override?.ee || base?.ee || '',
});

const normalizeServiceSection = (section = {}, index = 0, serviceKey = '', fallbackSection = null) => ({
  key: section.key || fallbackSection?.key || `${serviceKey}-card-${index + 1}`,
  imageKey: section.imageKey || fallbackSection?.imageKey || '',
  image: section.image || fallbackSection?.image || null,
  layout:
    section.layout === 'image-right' || section.layout === 'image-left'
      ? section.layout
      : fallbackSection?.layout || DEFAULT_SECTION_LAYOUTS[index] || 'image-left',
  title: mergeLocalizedValue(fallbackSection?.title, section.title),
  body: mergeLocalizedValue(fallbackSection?.body, section.body),
});

const buildBaseServicePageContent = (serviceKey) => {
  const englishService = getFallbackService(serviceKey, 'en');
  const estonianService = getFallbackService(serviceKey, 'ee');
  const englishCards = Array.isArray(englishService?.texts) ? englishService.texts : [];
  const estonianCards = Array.isArray(estonianService?.texts) ? estonianService.texts : [];
  const imageKeys = SERVICE_PAGE_CARD_IMAGE_KEYS[serviceKey] || [];

  return {
    isCustomized: false,
    title: createLocalizedValue(englishService?.title || '', estonianService?.title || ''),
    intro: createLocalizedValue(englishService?.intro || '', estonianService?.intro || ''),
    cards: englishCards.map((card, index) =>
      normalizeServiceSection(
        {
          key: `${serviceKey}-card-${index + 1}`,
          imageKey: imageKeys[index] || '',
          image: null,
          layout: DEFAULT_SECTION_LAYOUTS[index] || 'image-left',
          title: createLocalizedValue(
            card?.text_title || '',
            estonianCards[index]?.text_title || ''
          ),
          body: createLocalizedValue(
            card?.text_english || '',
            estonianCards[index]?.text_english || ''
          ),
        },
        index,
        serviceKey
      )
    ),
    review: createLocalizedValue(englishService?.review || '', estonianService?.review || ''),
    reviewAuthor: createLocalizedValue(
      englishService?.review_author || '',
      estonianService?.review_author || ''
    ),
    destinationHeading: createLocalizedValue(
      FALLBACK_MISC_TEXTS["have-a-look-at-what's-possible!"]?.text || '',
      FALLBACK_MISC_TEXTS_EE["have-a-look-at-what's-possible!"]?.text || ''
    ),
    destinationDescription: createLocalizedValue(
      FALLBACK_MISC_TEXTS[
        'destination-management-service-description-includes-in-the-following-pdf...'
      ]?.text || '',
      FALLBACK_MISC_TEXTS_EE[
        'destination-management-service-description-includes-in-the-following-pdf...'
      ]?.text || ''
    ),
    destinationButtonLabel: createLocalizedValue(
      FALLBACK_MISC_TEXTS['download-pdf']?.text || '',
      FALLBACK_MISC_TEXTS_EE['download-pdf']?.text || ''
    ),
  };
};

const buildServicePageContent = (serviceKey, storedContent) => {
  const baseContent = buildBaseServicePageContent(serviceKey);

  if (!storedContent?.isCustomized) {
    return baseContent;
  }

  const fallbackCards = Array.isArray(baseContent.cards) ? baseContent.cards : [];
  const storedCards = Array.isArray(storedContent.cards) ? storedContent.cards : [];

  return {
    isCustomized: true,
    title: mergeLocalizedValue(baseContent.title, storedContent.title),
    intro: mergeLocalizedValue(baseContent.intro, storedContent.intro),
    cards: storedCards.map((card, index) =>
      normalizeServiceSection(card, index, serviceKey, fallbackCards[index])
    ),
    review: mergeLocalizedValue(baseContent.review, storedContent.review),
    reviewAuthor: mergeLocalizedValue(
      baseContent.reviewAuthor,
      storedContent.reviewAuthor
    ),
    destinationHeading: mergeLocalizedValue(
      baseContent.destinationHeading,
      storedContent.destinationHeading
    ),
    destinationDescription: mergeLocalizedValue(
      baseContent.destinationDescription,
      storedContent.destinationDescription
    ),
    destinationButtonLabel: mergeLocalizedValue(
      baseContent.destinationButtonLabel,
      storedContent.destinationButtonLabel
    ),
  };
};

const createEmptyServiceSection = (serviceKey) => ({
  key: createSectionKey(serviceKey),
  imageKey: '',
  image: null,
  layout: 'image-left',
  title: createLocalizedValue(),
  body: createLocalizedValue(),
});

const buildServiceContentFormData = (content, imageFiles = {}) => {
  const formData = new FormData();

  formData.append('title', JSON.stringify(content.title));
  formData.append('intro', JSON.stringify(content.intro));
  formData.append('cards', JSON.stringify(content.cards));
  formData.append('review', JSON.stringify(content.review));
  formData.append('reviewAuthor', JSON.stringify(content.reviewAuthor));
  formData.append('destinationHeading', JSON.stringify(content.destinationHeading));
  formData.append(
    'destinationDescription',
    JSON.stringify(content.destinationDescription)
  );
  formData.append(
    'destinationButtonLabel',
    JSON.stringify(content.destinationButtonLabel)
  );

  Object.entries(imageFiles).forEach(([index, file]) => {
    if (file) {
      formData.append(`cardImage_${index}`, file);
    }
  });

  return formData;
};

function ServicePage({
  setShowBookNow,
  adminToken,
  setAdminToken,
  siteSettings = DEFAULT_SITE_SETTINGS,
  setSiteSettings,
  isEditMode = false,
}) {
  const dispatch = useDispatch();
  const { serviceType } = useParams();
  const language = localStorage.getItem('language') || 'en';
  const { service, isLoading, isError, message } = useSelector((state) => state.services);
  const { misc_texts } = useSelector((state) => state.texts);

  const [isHeroEditorOpen, setIsHeroEditorOpen] = useState(false);
  const [serviceHeroImageFile, setServiceHeroImageFile] = useState(null);
  const [serviceHeroPreviewUrl, setServiceHeroPreviewUrl] = useState('');
  const [serviceHeroDraftImage, setServiceHeroDraftImage] = useState(
    cloneValue(siteSettings.servicePageHeroes?.[serviceType]?.image || null)
  );
  const [isPreparingHeroImage, setIsPreparingHeroImage] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [sectionEditorMode, setSectionEditorMode] = useState('create');
  const [editingSectionIndex, setEditingSectionIndex] = useState(-1);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(-1);
  const [sectionForm, setSectionForm] = useState(createEmptyServiceSection(serviceType));
  const [sectionImageFile, setSectionImageFile] = useState(null);
  const [isSavingSection, setIsSavingSection] = useState(false);

  const servicePageContent = useMemo(
    () => buildServicePageContent(serviceType, siteSettings.servicePageContent?.[serviceType]),
    [serviceType, siteSettings.servicePageContent]
  );
  const [serviceContentForm, setServiceContentForm] = useState(() =>
    cloneValue(servicePageContent)
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  useEffect(() => {
    dispatch(getMiscTexts());
    dispatch(getService(serviceType));
  }, [dispatch, serviceType]);

  useEffect(() => {
    setServiceContentForm(cloneValue(servicePageContent));
  }, [servicePageContent]);

  useEffect(() => {
    if (!serviceHeroImageFile) {
      setServiceHeroPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(serviceHeroImageFile);
    setServiceHeroPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [serviceHeroImageFile]);

  useEffect(() => {
    setServiceHeroDraftImage(
      cloneValue(siteSettings.servicePageHeroes?.[serviceType]?.image || null)
    );
  }, [serviceType, siteSettings.servicePageHeroes]);

  const handleAdminAuthError = (error, fallbackMessage = 'Services update failed.') => {
    if (error?.response?.status === 401) {
      setStoredStoryAdminAuth('');
      setAdminToken('');
      toast.error('Admin session expired. Please log in again.');
      return;
    }

    toast.error(error?.response?.data?.message || error?.message || fallbackMessage);
  };

  const closeHeroEditor = () => {
    setIsHeroEditorOpen(false);
    setServiceHeroImageFile(null);
    setServiceHeroDraftImage(
      cloneValue(siteSettings.servicePageHeroes?.[serviceType]?.image || null)
    );
  };

  const closeContentEditor = () => {
    setIsContentEditorOpen(false);
    setServiceContentForm(cloneValue(servicePageContent));
  };

  const closeSectionEditor = () => {
    setIsSectionEditorOpen(false);
    setSectionEditorMode('create');
    setEditingSectionIndex(-1);
    setSectionForm(createEmptyServiceSection(serviceType));
    setSectionImageFile(null);
  };

  const closeDeleteDialog = () => {
    if (isSavingSection) {
      return;
    }

    setPendingDeleteIndex(-1);
  };

  const persistServiceContent = async (
    nextContent,
    imageFiles,
    successMessage
  ) => {
    const formData = buildServiceContentFormData(nextContent, imageFiles);
    const nextSettings = await siteSettingsService.updateServicePageContentSiteSettings(
      serviceType,
      adminToken,
      formData
    );
    setSiteSettings(nextSettings);
    toast.success(successMessage);
  };

  const saveServiceHero = async (event) => {
    event.preventDefault();
    setIsSavingHero(true);

    try {
      const formData = new FormData();
      formData.append('image', JSON.stringify(serviceHeroDraftImage));

      if (serviceHeroImageFile) {
        formData.append('imageFile', serviceHeroImageFile);
      }

      const nextSettings = await siteSettingsService.updateServicePageHeroSiteSettings(
        serviceType,
        adminToken,
        formData
      );
      setSiteSettings(nextSettings);
      setServiceHeroImageFile(null);
      setServiceHeroDraftImage(
        cloneValue(nextSettings.servicePageHeroes?.[serviceType]?.image || null)
      );
      setIsHeroEditorOpen(false);
      toast.success('Service background updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Service background update failed.');
    } finally {
      setIsSavingHero(false);
    }
  };

  const savePageContent = async (event) => {
    event.preventDefault();
    setIsSavingContent(true);

    try {
      await persistServiceContent(
        serviceContentForm,
        {},
        'Service page content updated.'
      );
      setIsContentEditorOpen(false);
    } catch (error) {
      handleAdminAuthError(error, 'Service page content update failed.');
    } finally {
      setIsSavingContent(false);
    }
  };

  const saveSection = async (event) => {
    event.preventDefault();
    setIsSavingSection(true);

    try {
      const nextCards = cloneValue(serviceContentForm.cards);
      const targetIndex =
        sectionEditorMode === 'create' ? nextCards.length : editingSectionIndex;
      const currentCard = targetIndex >= 0 ? nextCards[targetIndex] : null;
      const nextCard = {
        ...currentCard,
        ...sectionForm,
        image: sectionForm.image || currentCard?.image || null,
      };

      if (sectionEditorMode === 'create') {
        nextCards.push(nextCard);
      } else if (editingSectionIndex >= 0) {
        nextCards[editingSectionIndex] = nextCard;
      }

      const nextContent = {
        ...serviceContentForm,
        cards: nextCards,
      };

      await persistServiceContent(
        nextContent,
        sectionImageFile ? { [targetIndex]: sectionImageFile } : {},
        sectionEditorMode === 'create' ? 'Section added.' : 'Section updated.'
      );
      closeSectionEditor();
    } catch (error) {
      handleAdminAuthError(
        error,
        sectionEditorMode === 'create'
          ? 'Section creation failed.'
          : 'Section update failed.'
      );
    } finally {
      setIsSavingSection(false);
    }
  };

  const deleteSection = async (index) => {
    if (index < 0) {
      return;
    }

    setIsSavingSection(true);

    try {
      const nextContent = {
        ...serviceContentForm,
        cards: serviceContentForm.cards.filter((_, cardIndex) => cardIndex !== index),
      };

      await persistServiceContent(
        nextContent,
        {},
        'Section deleted.'
      );
    } catch (error) {
      handleAdminAuthError(error, 'Section delete failed.');
    } finally {
      setIsSavingSection(false);
      setPendingDeleteIndex(-1);
    }
  };

  const openDeleteDialog = (index) => {
    setPendingDeleteIndex(index);
  };

  const openCreateSectionEditor = () => {
    setSectionEditorMode('create');
    setEditingSectionIndex(-1);
    setSectionForm(createEmptyServiceSection(serviceType));
    setSectionImageFile(null);
    setIsSectionEditorOpen(true);
  };

  const openEditSectionEditor = (index) => {
    setSectionEditorMode('edit');
    setEditingSectionIndex(index);
    setSectionForm(cloneValue(serviceContentForm.cards[index]));
    setSectionImageFile(null);
    setIsSectionEditorOpen(true);
  };

  if (isLoading || !service) {
    return <Spinner />;
  }

  const servicePageHero = siteSettings.servicePageHeroes?.[serviceType];
  const backgroundMedia =
    (serviceHeroPreviewUrl
      ? createPreviewMediaAsset(
          serviceHeroPreviewUrl,
          HERO_MEDIA_SIZES,
          serviceHeroDraftImage
        )
      : null) ||
    resolveSiteImageMedia(
      servicePageHero?.image,
      servicePageHero?.imageKey,
      HERO_MEDIA_SIZES
    ) ||
    createPreviewMediaAsset(service?.background_image?.src || '', HERO_MEDIA_SIZES);

  const handleServiceHeroFileSelected = async (file) => {
    if (!file) {
      setServiceHeroImageFile(null);
      return;
    }

    setIsPreparingHeroImage(true);

    try {
      const preparedFile = await prepareImageFileForUpload(
        file,
        HERO_IMAGE_PREPARATION_OPTIONS
      );
      setServiceHeroImageFile(preparedFile);
      setServiceHeroDraftImage((current) => current || { focusX: 50, focusY: 50, zoom: 1 });
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingHeroImage(false);
    }
  };

  const pageTitle = getLocalizedSiteText(serviceContentForm.title, language, service?.title || '');
  const intro = getLocalizedSiteText(serviceContentForm.intro, language, service?.intro || '');
  const review = getLocalizedSiteText(
    serviceContentForm.review,
    language,
    service?.review || ''
  );
  const reviewAuthor = getLocalizedSiteText(
    serviceContentForm.reviewAuthor,
    language,
    service?.review_author || ''
  );
  const haveALookText = getLocalizedSiteText(
    serviceContentForm.destinationHeading,
    language,
    language === 'ee'
      ? FALLBACK_MISC_TEXTS_EE["have-a-look-at-what's-possible!"]?.text || ''
      : FALLBACK_MISC_TEXTS["have-a-look-at-what's-possible!"]?.text || ''
  );
  const destinationManagementDescriptionText = getLocalizedSiteText(
    serviceContentForm.destinationDescription,
    language,
    language === 'ee'
      ? FALLBACK_MISC_TEXTS_EE[
          'destination-management-service-description-includes-in-the-following-pdf...'
        ]?.text || ''
      : FALLBACK_MISC_TEXTS[
          'destination-management-service-description-includes-in-the-following-pdf...'
        ]?.text || ''
  );
  const downloadPdfText = getLocalizedSiteText(
    serviceContentForm.destinationButtonLabel,
    language,
    language === 'ee'
      ? FALLBACK_MISC_TEXTS_EE['download-pdf']?.text || ''
      : FALLBACK_MISC_TEXTS['download-pdf']?.text || ''
  );

  const displayCards = serviceContentForm.cards.map((card, index) => ({
    key: card.key || `${serviceType}-card-${index + 1}`,
    title: getLocalizedSiteText(card.title, language, ''),
    body: getLocalizedSiteText(card.body, language, ''),
    image: card.image,
    imageSrc: resolveSiteImage(card.image, card.imageKey),
    layout: card.layout,
  }));

  const seoData = {
    team: {
      title: 'Team Service - Tales of Reval',
      description:
        'Team building events in Tallinn with Tales of Reval. Enhance teamwork with our interactive and motivational medieval themed events.',
      keywords:
        'Team Building Events Tallinn, Corporate Team Events, Interactive Team Building, Medieval Team Experiences, Custom Team Events, Team Activities Tallinn, Corporate Retreats Tallinn, Team Bonding Experiences, Unique Team Building, Team Building Service Tallinn',
    },
    private: {
      title: 'Private Service - Tales of Reval',
      description:
        'Private medieval tours in Tallinn with Tales of Reval. Enjoy exclusive and immersive historical experiences tailored just for you.',
      keywords:
        'Private Tours Tallinn, Custom Medieval Tours, Exclusive Tallinn Tours, Private Medieval Experiences, Tailored Tallinn Tours, VIP Tour Service, Private Tour Booking, Personalized Tour Guide, Custom Private Events, Private Tour Company',
    },
    destination: {
      title: 'Destination Management Service - Tales of Reval',
      description:
        'Comprehensive destination management services in Tallinn by Tales of Reval. Organize group travels, tours, and events with ease.',
      keywords:
        'Destination Management Tallinn, Group Travel Estonia, Customized Group Tours, Estonia Destination Services, Group Tours Tallinn, Comprehensive Tour Management, Event Planning Estonia, Group Adventure Planning, Full-Service Destination Management, Tallinn Group Activities',
    },
    wedding: {
      title: 'Wedding Service - Tales of Reval',
      description:
        'Experience a fairytale wedding in Tallinn with Tales of Reval. We offer unique medieval themed wedding planning and hosting services.',
      keywords:
        'Medieval Wedding Planner, Tallinn Wedding Services, Unique Wedding Events, Historical Wedding Venues, Wedding Coordination Tallinn, Custom Wedding Planning, Medieval Themed Weddings, Tallinn Wedding Organizer, Authentic Wedding Experiences, Personalized Wedding Services',
    },
    quick: {
      title: 'Quick Service - Tales of Reval',
      description:
        'Quick and immersive tours in Tallinn by Tales of Reval. Perfect for those with limited time who want to experience the medieval charm.',
      keywords:
        'Quick Tallinn Tours, Short Guided Tours, Express Medieval Tours, Quick Historical Tours, 30-Minute Tallinn Tours, Fast Tour Service, Short Medieval Experiences, Quick Visit Tallinn, Express Tour Booking, Short Tour Experiences',
    },
  };

  const {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
  } = seoData[serviceType] || {};

  return (
    <div className="service-page">
      <Helmet>
        <title>{seoTitle || pageTitle} - Tales of Reval</title>
        <meta name="description" content={seoDescription || intro} />
        <meta
          name="keywords"
          content={
            seoKeywords ||
            'Tours in tallinn, Free tours in Tallinn, Private tours in Tallinn, Best tour in Tallinn'
          }
        />
      </Helmet>
      <PageHero
        className="service-page-hero"
        mediaClassName="service-landing"
        backgroundMedia={backgroundMedia}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      >
        <h1>{pageTitle}</h1>
      </PageHero>

      <div className="container">
        <div className="section-inline-action service-page-section-actions">
          {adminToken && isEditMode ? (
            <>
              <button
                type="button"
                className="section-edit-button"
                onClick={() => setIsContentEditorOpen(true)}
              >
                Edit page content
              </button>
              <button
                type="button"
                className="section-edit-button"
                onClick={openCreateSectionEditor}
              >
                Add new section
              </button>
            </>
          ) : null}
        </div>
        <div className="tagline padding-40-top padding-40-bottom">
          <h4 className="cardo">{intro}</h4>
        </div>
        <ServicePageCards
          cards={displayCards}
          isEditable={Boolean(adminToken) && isEditMode}
          onAdd={openCreateSectionEditor}
          onEdit={openEditSectionEditor}
          onDelete={openDeleteDialog}
        />
      </div>

      {serviceType !== 'destination' ? (
        <div className="service-page-review">
          <div className="service-review-container">
            <h4 className="cardo padding-20-bottom">{review}</h4>
            <p className="padding-20-bottom">{reviewAuthor}</p>
            <div
              className="service-page-review-book-now"
              onClick={() => setShowBookNow(true)}
            >
              <BookNow texts={misc_texts} />
            </div>
          </div>
        </div>
      ) : (
        <div className="service-page-review">
          <div className="service-review-container">
            <h4 className="cardo padding-20-bottom">{haveALookText}</h4>
            <p className="padding-20-bottom">{destinationManagementDescriptionText}</p>
            <div className="service-page-review-book-now">
              <a href={dmc_file} download>
                <button className="book-now-button">
                  <span className="button-text">{downloadPdfText}</span>
                  <span className="button-icon"></span>
                  <FaArrowDown />
                </button>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <ManagedServicesSection
          texts={misc_texts}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          adminToken={adminToken}
          isEditMode={isEditMode}
          language={language}
          onAdminAuthError={handleAdminAuthError}
        />
      </div>
      {adminToken && isHeroEditorOpen ? (
        <HeroImageEditorModal
          title="Change background image"
          description="Upload a new background image for this service page."
          currentImage={servicePageHero?.image}
          currentImageUrl={
            resolveSiteImage(servicePageHero?.image, servicePageHero?.imageKey) ||
            service?.background_image?.src ||
            ''
          }
          draftImage={serviceHeroDraftImage}
          onChangeImage={setServiceHeroDraftImage}
          selectedFile={serviceHeroImageFile}
          onSelectFile={handleServiceHeroFileSelected}
          previewUrl={serviceHeroPreviewUrl}
          onSave={saveServiceHero}
          onCancel={closeHeroEditor}
          isSaving={isSavingHero}
          isPreparingImage={isPreparingHeroImage}
        />
      ) : null}
      {adminToken && isContentEditorOpen ? (
        <ServicePageContentEditorModal
          serviceKey={serviceType}
          content={serviceContentForm}
          setContent={setServiceContentForm}
          onSave={savePageContent}
          onCancel={closeContentEditor}
          isSaving={isSavingContent}
        />
      ) : null}
      {adminToken && isSectionEditorOpen ? (
        <ServicePageSectionEditorModal
          mode={sectionEditorMode}
          section={sectionForm}
          setSection={setSectionForm}
          imageFile={sectionImageFile}
          setImageFile={setSectionImageFile}
          onSave={saveSection}
          onCancel={closeSectionEditor}
          isSaving={isSavingSection}
        />
      ) : null}
      <ConfirmDialog
        open={pendingDeleteIndex >= 0}
        title="Delete section"
        message="Are you sure you want to delete this section?"
        confirmLabel="Delete"
        isLoading={isSavingSection}
        onCancel={closeDeleteDialog}
        onConfirm={() => deleteSection(pendingDeleteIndex)}
      />
    </div>
  );
}

export default ServicePage;
