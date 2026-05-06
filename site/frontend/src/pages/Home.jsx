import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import HomeLanding from '../components/HomeLanding';
import HomeHeroEditorModal from '../components/HomeHeroEditorModal';
import HomeExploreBanner from '../components/HomeExploreBanner';
import HomeExploreBannerEditorModal from '../components/HomeExploreBannerEditorModal';
import HomeReviewEditorModal from '../components/HomeReviewEditorModal';
import HomeTeamEditorModal from '../components/HomeTeamEditorModal';
import ManagedServicesSection from '../components/ManagedServicesSection';
import OurTeam from '../components/OurTeam';
import Reviews from '../components/Reviews';
import { getHomeTexts, getMiscTexts, reset } from '../features/texts/textSlice';
import {
  getFallbackText,
  getFallbackTextsForCategory,
  hasTextEntries,
} from '../content/fallbackContent';
import {
  DEFAULT_SITE_SETTINGS,
  HERO_MEDIA_SIZES,
  createPreviewMediaAsset,
  getLocalizedSiteText,
  resolveSiteImage,
  resolveSiteImageMedia,
  resolveSiteImageMediaList,
} from '../content/siteSettingsDefaults';
import { DEFAULT_PAYMENT_CARD_COPY } from '../content/paymentCardDefaults';
import { normalizePaymentLinks } from '../content/paymentMethods';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFilesForUpload,
} from '../utils/prepareImageFilesForUpload';
import {
  createHomeHeroDraftImageId,
  getInitialHomeHeroDefaultDraftKey,
  getRetainedHomeHeroDraftKey,
  getSelectedHomeHeroDraftKey,
} from '../utils/homeHeroDraftSelection';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const MAX_HOME_HERO_IMAGES = 6;
const normalizeTeamMember = (member) => ({
  ...member,
  payment_links: normalizePaymentLinks(member?.payment_links),
});

function SectionEditButton({ onClick, label = 'Edit' }) {
  return (
    <button type="button" className="section-edit-button" onClick={onClick}>
      {label}
    </button>
  );
}

function Home({
  adminToken,
  setAdminToken,
  siteSettings = DEFAULT_SITE_SETTINGS,
  setSiteSettings,
  isEditMode = false,
}) {
  const dispatch = useDispatch();
  const language = localStorage.getItem('language') || 'en';
  const { home_texts, isError, message } = useSelector((state) => state.texts);
  const { misc_texts } = useSelector((state) => state.texts);

  const [isHeroEditorOpen, setIsHeroEditorOpen] = useState(false);
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  const [isReviewEditorOpen, setIsReviewEditorOpen] = useState(false);
  const [isExploreBannerEditorOpen, setIsExploreBannerEditorOpen] = useState(false);

  const [heroImageFiles, setHeroImageFiles] = useState([]);
  const [heroNewImages, setHeroNewImages] = useState([]);
  const [heroPreviewUrls, setHeroPreviewUrls] = useState([]);
  const [retainedHeroImages, setRetainedHeroImages] = useState(
    cloneValue(siteSettings.homeHero.images || [])
  );
  const [heroDefaultImageKey, setHeroDefaultImageKey] = useState(
    getInitialHomeHeroDefaultDraftKey(
      siteSettings.homeHero.images || [],
      siteSettings.homeHero.defaultImageSrc
    )
  );
  const [isPreparingHeroImages, setIsPreparingHeroImages] = useState(false);
  const [teamHeading, setTeamHeading] = useState(cloneValue(siteSettings.homeTeam.heading));
  const [teamPaymentCard, setTeamPaymentCard] = useState(
    cloneValue(siteSettings.homeTeam.paymentCard || DEFAULT_PAYMENT_CARD_COPY)
  );
  const [teamMembers, setTeamMembers] = useState(
    cloneValue(siteSettings.homeTeam.members.map(normalizeTeamMember))
  );
  const [teamImageFiles, setTeamImageFiles] = useState({});
  const [reviewHeading, setReviewHeading] = useState(cloneValue(siteSettings.homeReview.heading));
  const [reviewText, setReviewText] = useState(cloneValue(siteSettings.homeReview.text));
  const [reviewer, setReviewer] = useState(cloneValue(siteSettings.homeReview.reviewer));
  const [exploreBannerContent, setExploreBannerContent] = useState(
    cloneValue(siteSettings.homeExploreBanner)
  );
  const [isSavingSection, setIsSavingSection] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState(cloneValue(siteSettings.homeHero.titleLine1));
  const [heroTitleLine2, setHeroTitleLine2] = useState(cloneValue(siteSettings.homeHero.titleLine2));
  const [heroSubtitle, setHeroSubtitle] = useState(cloneValue(siteSettings.homeHero.subtitle));

  useEffect(() => {
    if (localStorage.getItem('language') === null) {
      localStorage.setItem('language', 'en');
    }

    dispatch(getHomeTexts());
    dispatch(getMiscTexts());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Home texts fallback active:', message);
    }
  }, [isError, message]);

  useEffect(() => {
    setTeamHeading(cloneValue(siteSettings.homeTeam.heading));
    setTeamPaymentCard(cloneValue(siteSettings.homeTeam.paymentCard || DEFAULT_PAYMENT_CARD_COPY));
    setTeamMembers(cloneValue(siteSettings.homeTeam.members.map(normalizeTeamMember)));
    setReviewHeading(cloneValue(siteSettings.homeReview.heading));
    setReviewText(cloneValue(siteSettings.homeReview.text));
    setReviewer(cloneValue(siteSettings.homeReview.reviewer));
    setExploreBannerContent(cloneValue(siteSettings.homeExploreBanner));
    setHeroTitleLine1(cloneValue(siteSettings.homeHero.titleLine1));
    setHeroTitleLine2(cloneValue(siteSettings.homeHero.titleLine2));
    setHeroSubtitle(cloneValue(siteSettings.homeHero.subtitle));
    setRetainedHeroImages(cloneValue(siteSettings.homeHero.images || []));
    setHeroDefaultImageKey(
      getInitialHomeHeroDefaultDraftKey(
        siteSettings.homeHero.images || [],
        siteSettings.homeHero.defaultImageSrc
      )
    );
  }, [siteSettings]);

  useEffect(() => {
    if (!heroImageFiles.length) {
      setHeroPreviewUrls([]);
      return;
    }

    const objectUrls = heroImageFiles.map((file) => window.URL.createObjectURL(file));
    setHeroPreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((objectUrl) => window.URL.revokeObjectURL(objectUrl));
    };
  }, [heroImageFiles]);

  const handleAdminAuthError = (error, fallbackMessage) => {
    if (error?.response?.status === 401) {
      setStoredStoryAdminAuth('');
      setAdminToken('');
      toast.error('Admin session expired. Please log in again.');
      return;
    }

    toast.error(error?.response?.data?.message || error?.message || fallbackMessage);
  };

  const resolvedHomeTexts = hasTextEntries(home_texts)
    ? home_texts
    : getFallbackTextsForCategory('home-page', language);
  const resolvedMiscTexts = hasTextEntries(misc_texts)
    ? misc_texts
    : getFallbackTextsForCategory('misc', language);
  const homeMetaTitle = getFallbackText('header', 'home', language, 'Home');
  const homeMetaDescription =
    language === 'ee'
      ? 'Koge Tallinna ehedamaid keskaegseid tuure. Avastage Tales of Revaliga ainulaadsed live-elamused ja ajaloolised seiklused.'
      : 'Experience the most authentic medieval tours in Tallinn. Discover unique live experiences and historical adventures with Tales of Reval.';

  const heroTexts = useMemo(
    () => ({
      storytelling: { text: getLocalizedSiteText(siteSettings.homeHero.titleLine1, language) || resolvedHomeTexts.storytelling?.text || '' },
      reinvented: { text: getLocalizedSiteText(siteSettings.homeHero.titleLine2, language) || resolvedHomeTexts.reinvented?.text || '' },
      'imagination-voice': { text: getLocalizedSiteText(siteSettings.homeHero.subtitle, language) || resolvedHomeTexts['imagination-voice']?.text || '' },
    }),
    [language, resolvedHomeTexts, siteSettings.homeHero]
  );

  const persistedHeroImages = useMemo(
    () =>
      resolveSiteImageMediaList(
        siteSettings.homeHero.images,
        siteSettings.homeHero.image,
        siteSettings.homeHero.imageKey,
        HERO_MEDIA_SIZES
      ),
    [siteSettings.homeHero]
  );

  const retainedHeroMediaItems = useMemo(
    () =>
      retainedHeroImages
        .map((image) => resolveSiteImageMedia(image, '', HERO_MEDIA_SIZES))
        .filter(Boolean),
    [retainedHeroImages]
  );
  const retainedHeroImageUrls = useMemo(
    () => retainedHeroMediaItems.map((image) => image.src).filter(Boolean),
    [retainedHeroMediaItems]
  );
  const previewHeroMediaItems = useMemo(
    () =>
      heroPreviewUrls
        .map((url, index) =>
          createPreviewMediaAsset(url, HERO_MEDIA_SIZES, heroNewImages[index])
        )
        .filter(Boolean),
    [heroNewImages, heroPreviewUrls]
  );
  const heroDraftItems = useMemo(
    () => [
      ...heroNewImages.map((image, index) => ({
        key: getSelectedHomeHeroDraftKey(image, index),
        source: 'new',
        index,
      })),
      ...retainedHeroImages.map((image, index) => ({
        key: getRetainedHomeHeroDraftKey(image, index),
        source: 'retained',
        index,
      })),
    ],
    [heroNewImages, retainedHeroImages]
  );
  const persistedHeroInitialIndex = useMemo(() => {
    if (!persistedHeroImages.length) {
      return 0;
    }

    const selectedIndex = persistedHeroImages.findIndex(
      (image) => image?.src === siteSettings.homeHero.defaultImageSrc
    );

    return selectedIndex >= 0 ? selectedIndex : 0;
  }, [persistedHeroImages, siteSettings.homeHero.defaultImageSrc]);
  const draftHeroInitialIndex = useMemo(() => {
    const selectedIndex = heroDraftItems.findIndex((item) => item.key === heroDefaultImageKey);
    return selectedIndex >= 0 ? selectedIndex : 0;
  }, [heroDefaultImageKey, heroDraftItems]);

  const activeHeroMediaItems = useMemo(() => {
    if (!isHeroEditorOpen) {
      return persistedHeroImages;
    }

    const draftImages = [...previewHeroMediaItems, ...retainedHeroMediaItems].filter(Boolean);
    return draftImages.length
      ? draftImages
      : [createPreviewMediaAsset(resolveSiteImage(null, siteSettings.homeHero.imageKey), HERO_MEDIA_SIZES)].filter(Boolean);
  }, [
    isHeroEditorOpen,
    persistedHeroImages,
    previewHeroMediaItems,
    retainedHeroMediaItems,
    siteSettings.homeHero.imageKey,
  ]);
  useEffect(() => {
    if (!heroDraftItems.length) {
      if (heroDefaultImageKey) {
        setHeroDefaultImageKey('');
      }
      return;
    }

    if (!heroDraftItems.some((item) => item.key === heroDefaultImageKey)) {
      setHeroDefaultImageKey(heroDraftItems[0].key);
    }
  }, [heroDefaultImageKey, heroDraftItems]);

  const activeHeroInitialIndex = isHeroEditorOpen
    ? draftHeroInitialIndex
    : persistedHeroInitialIndex;
  const preloadHeroMedia =
    activeHeroMediaItems[activeHeroInitialIndex] || activeHeroMediaItems[0] || null;

  const handleHeroFilesSelected = async (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    const availableSlots = Math.max(
      0,
      MAX_HOME_HERO_IMAGES - retainedHeroImages.length - heroImageFiles.length
    );

    if (!availableSlots) {
      toast.error(`Homepage hero supports up to ${MAX_HOME_HERO_IMAGES} images.`);
      return;
    }

    const filesToPrepare = files.slice(0, availableSlots);

    if (files.length > filesToPrepare.length) {
      toast.error(`Homepage hero supports up to ${MAX_HOME_HERO_IMAGES} images.`);
    }

    setIsPreparingHeroImages(true);

    try {
      const preparedFiles = await prepareImageFilesForUpload(
        filesToPrepare,
        HERO_IMAGE_PREPARATION_OPTIONS
      );
      setHeroImageFiles((current) => [...preparedFiles, ...current]);
      setHeroNewImages((current) => [
        ...preparedFiles.map((file) => ({
          draftId: createHomeHeroDraftImageId(),
          name: file.name,
          focusX: 50,
          focusY: 50,
          zoom: 1,
          mobileFocusX: 50,
          mobileFocusY: 50,
          mobileZoom: 1,
        })),
        ...current,
      ]);
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingHeroImages(false);
    }
  };

  const closeHeroEditor = () => {
    setIsHeroEditorOpen(false);
    setHeroImageFiles([]);
    setHeroNewImages([]);
    setHeroTitleLine1(cloneValue(siteSettings.homeHero.titleLine1));
    setHeroTitleLine2(cloneValue(siteSettings.homeHero.titleLine2));
    setHeroSubtitle(cloneValue(siteSettings.homeHero.subtitle));
    setRetainedHeroImages(cloneValue(siteSettings.homeHero.images || []));
    setHeroDefaultImageKey(
      getInitialHomeHeroDefaultDraftKey(
        siteSettings.homeHero.images || [],
        siteSettings.homeHero.defaultImageSrc
      )
    );
  };

  const saveHero = async (event) => {
    event.preventDefault();
    setIsSavingSection('hero');

    try {
      const formData = new FormData();
      formData.append('titleLine1', JSON.stringify(heroTitleLine1));
      formData.append('titleLine2', JSON.stringify(heroTitleLine2));
      formData.append('subtitle', JSON.stringify(heroSubtitle));
      formData.append('retainedImages', JSON.stringify(retainedHeroImages));
      formData.append('newImages', JSON.stringify(heroNewImages));
      const selectedDefaultItem =
        heroDraftItems.find((item) => item.key === heroDefaultImageKey) || heroDraftItems[0] || null;
      if (selectedDefaultItem) {
        formData.append('defaultImageGroup', selectedDefaultItem.source);
        formData.append('defaultImageIndex', String(selectedDefaultItem.index));
        if (selectedDefaultItem.source === 'retained') {
          formData.append(
            'defaultImageSrc',
            retainedHeroImages[selectedDefaultItem.index]?.src || ''
          );
        }
      }
      heroImageFiles.forEach((file) => {
        formData.append('imageFile', file);
      });

      const nextSettings = await siteSettingsService.updateHeroSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      closeHeroEditor();
      toast.success('Homepage hero updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Hero update failed.');
    } finally {
      setIsSavingSection('');
    }
  };

  const saveTeam = async (event) => {
    event.preventDefault();
    setIsSavingSection('team');

    try {
      const formData = new FormData();
      formData.append('heading', JSON.stringify(teamHeading));
      formData.append('paymentCard', JSON.stringify(teamPaymentCard));
      formData.append('members', JSON.stringify(teamMembers));
      Object.entries(teamImageFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`teamImage_${index}`, file);
        }
      });

      const nextSettings = await siteSettingsService.updateTeamSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setTeamImageFiles({});
      setIsTeamEditorOpen(false);
      toast.success('Homepage team updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Team update failed.');
    } finally {
      setIsSavingSection('');
    }
  };

  const saveReview = async (event) => {
    event.preventDefault();
    setIsSavingSection('review');

    try {
      const formData = new FormData();
      formData.append('heading', JSON.stringify(reviewHeading));
      formData.append('text', JSON.stringify(reviewText));
      formData.append('reviewer', JSON.stringify(reviewer));

      const nextSettings = await siteSettingsService.updateReviewSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setIsReviewEditorOpen(false);
      toast.success('Homepage review updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Review update failed.');
    } finally {
      setIsSavingSection('');
    }
  };

  const saveExploreBanner = async (event) => {
    event.preventDefault();
    setIsSavingSection('explore');

    try {
      const nextSettings = await siteSettingsService.updateHomeExploreBannerSiteSettings(
        adminToken,
        {
          titleLine1: exploreBannerContent.titleLine1,
          titleLine2: exploreBannerContent.titleLine2,
          subtitle: exploreBannerContent.subtitle,
          readMoreLabel: exploreBannerContent.readMoreLabel,
          googlePlayUrl: exploreBannerContent.googlePlayUrl,
          appStoreUrl: exploreBannerContent.appStoreUrl,
        }
      );
      setSiteSettings(nextSettings);
      setIsExploreBannerEditorOpen(false);
      toast.success('Virtual tour banner updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Virtual tour banner update failed.');
    } finally {
      setIsSavingSection('');
    }
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>{homeMetaTitle} - Tales of Reval</title>
        {preloadHeroMedia?.src ? (
          <link
            rel="preload"
            as="image"
            href={preloadHeroMedia.src}
            imagesrcset={preloadHeroMedia.srcSet || undefined}
            imagesizes={preloadHeroMedia.sizes || undefined}
          />
        ) : null}
        <meta
          name="description"
          content={homeMetaDescription}
        />
        <meta
          name="keywords"
          content="Medieval Tours in Tallinn, Historical Experiences in Estonia, Interactive Medieval Experiences, Tallinn Guided Tours, Live Medieval Shows, Top Rated Tallinn Tours, Unique Tallinn Experiences, Authentic Tallinn Tours, Best Tallinn Attractions, Tallinn Tour Company"
        />
      </Helmet>

      <HomeLanding
        texts={heroTexts}
        backgroundMediaItems={activeHeroMediaItems}
        initialImageIndex={activeHeroInitialIndex}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      />

      <div className="container home-content">
        <ManagedServicesSection
          texts={resolvedMiscTexts}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          adminToken={adminToken}
          isEditMode={isEditMode}
          language={language}
          onAdminAuthError={handleAdminAuthError}
        />
        <OurTeam
          texts={resolvedMiscTexts}
          heading={siteSettings.homeTeam.heading}
          items={siteSettings.homeTeam.members}
          paymentCard={siteSettings.homeTeam.paymentCard}
          showPaymentButton
          language={language}
          adminAction={
            adminToken && isEditMode ? (
              <SectionEditButton onClick={() => setIsTeamEditorOpen(true)} />
            ) : null
          }
        />
        <Reviews
          misc_texts={resolvedMiscTexts}
          variant="home"
          content={siteSettings.homeReview}
          language={language}
          adminAction={
            adminToken && isEditMode ? (
              <SectionEditButton onClick={() => setIsReviewEditorOpen(true)} />
            ) : null
          }
        />
        {adminToken && isEditMode ? (
          <div className="section-inline-action">
            <SectionEditButton onClick={() => setIsExploreBannerEditorOpen(true)} />
          </div>
        ) : null}
        <HomeExploreBanner
          texts={resolvedMiscTexts}
          language={language}
          content={siteSettings.homeExploreBanner}
        />
      </div>

      {adminToken && isHeroEditorOpen ? (
        <HomeHeroEditorModal
          currentImages={retainedHeroImages}
          currentImageUrls={retainedHeroImageUrls}
          setCurrentImages={setRetainedHeroImages}
          selectedFiles={heroImageFiles}
          setSelectedFiles={setHeroImageFiles}
          selectedImages={heroNewImages}
          setSelectedImages={setHeroNewImages}
          onSelectFiles={handleHeroFilesSelected}
          previewUrls={heroPreviewUrls}
          onSave={saveHero}
          onCancel={closeHeroEditor}
          defaultImageKey={heroDefaultImageKey}
          onSelectDefaultImage={setHeroDefaultImageKey}
          isSaving={isSavingSection === 'hero'}
          isPreparingImages={isPreparingHeroImages}
          maxImageCount={MAX_HOME_HERO_IMAGES}
          titleLine1={heroTitleLine1}
          setTitleLine1={setHeroTitleLine1}
          titleLine2={heroTitleLine2}
          setTitleLine2={setHeroTitleLine2}
          subtitle={heroSubtitle}
          setSubtitle={setHeroSubtitle}
        />
      ) : null}

      {adminToken && isTeamEditorOpen ? (
        <HomeTeamEditorModal
          heading={{ value: teamHeading, set: setTeamHeading }}
          paymentCard={{ value: teamPaymentCard, set: setTeamPaymentCard }}
          members={{ value: teamMembers, set: setTeamMembers }}
          imageFiles={teamImageFiles}
          setImageFiles={setTeamImageFiles}
          onSave={saveTeam}
          onCancel={() => {
            setIsTeamEditorOpen(false);
            setTeamImageFiles({});
            setTeamHeading(cloneValue(siteSettings.homeTeam.heading));
            setTeamPaymentCard(
              cloneValue(siteSettings.homeTeam.paymentCard || DEFAULT_PAYMENT_CARD_COPY)
            );
            setTeamMembers(cloneValue(siteSettings.homeTeam.members));
          }}
          isSaving={isSavingSection === 'team'}
        />
      ) : null}

      {adminToken && isReviewEditorOpen ? (
        <HomeReviewEditorModal
          heading={{ ...reviewHeading, set: setReviewHeading }}
          text={{ ...reviewText, set: setReviewText }}
          reviewer={{ ...reviewer, set: setReviewer }}
          onSave={saveReview}
          onCancel={() => {
            setIsReviewEditorOpen(false);
            setReviewHeading(cloneValue(siteSettings.homeReview.heading));
            setReviewText(cloneValue(siteSettings.homeReview.text));
            setReviewer(cloneValue(siteSettings.homeReview.reviewer));
          }}
          isSaving={isSavingSection === 'review'}
        />
      ) : null}

      {adminToken && isExploreBannerEditorOpen ? (
        <HomeExploreBannerEditorModal
          content={exploreBannerContent}
          setContent={setExploreBannerContent}
          onSave={saveExploreBanner}
          onCancel={() => {
            setIsExploreBannerEditorOpen(false);
            setExploreBannerContent(cloneValue(siteSettings.homeExploreBanner));
          }}
          isSaving={isSavingSection === 'explore'}
        />
      ) : null}
    </div>
  );
}

export default Home;
