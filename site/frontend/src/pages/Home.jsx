import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import HomeLanding from '../components/HomeLanding';
import HomeHeroEditorModal from '../components/HomeHeroEditorModal';
import HomeExploreBanner from '../components/HomeExploreBanner';
import HomeReviewEditorModal from '../components/HomeReviewEditorModal';
import HomeTeamEditorModal from '../components/HomeTeamEditorModal';
import ManagedServicesSection from '../components/ManagedServicesSection';
import OurTeam from '../components/OurTeam';
import Reviews from '../components/Reviews';
import { getHomeTexts, getMiscTexts, reset } from '../features/texts/textSlice';
import {
  FALLBACK_HOME_TEXTS,
  FALLBACK_MISC_TEXTS,
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
import { normalizePaymentLinks } from '../content/paymentMethods';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFilesForUpload,
} from '../utils/prepareImageFilesForUpload';

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

  const [heroImageFiles, setHeroImageFiles] = useState([]);
  const [heroNewImages, setHeroNewImages] = useState([]);
  const [heroPreviewUrls, setHeroPreviewUrls] = useState([]);
  const [retainedHeroImages, setRetainedHeroImages] = useState(
    cloneValue(siteSettings.homeHero.images || [])
  );
  const [isPreparingHeroImages, setIsPreparingHeroImages] = useState(false);
  const [teamHeading, setTeamHeading] = useState(cloneValue(siteSettings.homeTeam.heading));
  const [teamMembers, setTeamMembers] = useState(
    cloneValue(siteSettings.homeTeam.members.map(normalizeTeamMember))
  );
  const [teamImageFiles, setTeamImageFiles] = useState({});
  const [reviewHeading, setReviewHeading] = useState(cloneValue(siteSettings.homeReview.heading));
  const [reviewText, setReviewText] = useState(cloneValue(siteSettings.homeReview.text));
  const [reviewer, setReviewer] = useState(cloneValue(siteSettings.homeReview.reviewer));
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
    setTeamMembers(cloneValue(siteSettings.homeTeam.members.map(normalizeTeamMember)));
    setReviewHeading(cloneValue(siteSettings.homeReview.heading));
    setReviewText(cloneValue(siteSettings.homeReview.text));
    setReviewer(cloneValue(siteSettings.homeReview.reviewer));
    setHeroTitleLine1(cloneValue(siteSettings.homeHero.titleLine1));
    setHeroTitleLine2(cloneValue(siteSettings.homeHero.titleLine2));
    setHeroSubtitle(cloneValue(siteSettings.homeHero.subtitle));
    setRetainedHeroImages(cloneValue(siteSettings.homeHero.images || []));
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
    : FALLBACK_HOME_TEXTS;
  const resolvedMiscTexts = hasTextEntries(misc_texts)
    ? misc_texts
    : FALLBACK_MISC_TEXTS;

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
  const preloadHeroMedia = activeHeroMediaItems[0] || null;

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
          name: file.name,
          focusX: 50,
          focusY: 50,
          zoom: 1,
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

  return (
    <div className="home-page">
      <Helmet>
        <title>Home - Tales of Reval</title>
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
          content="Experience the most authentic medieval tours in Tallinn. Discover unique live experiences and historical adventures with Tales of Reval."
        />
        <meta
          name="keywords"
          content="Medieval Tours in Tallinn, Historical Experiences in Estonia, Interactive Medieval Experiences, Tallinn Guided Tours, Live Medieval Shows, Top Rated Tallinn Tours, Unique Tallinn Experiences, Authentic Tallinn Tours, Best Tallinn Attractions, Tallinn Tour Company"
        />
      </Helmet>

      <HomeLanding
        texts={heroTexts}
        backgroundMediaItems={activeHeroMediaItems}
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
        <HomeExploreBanner />
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
          members={{ value: teamMembers, set: setTeamMembers }}
          imageFiles={teamImageFiles}
          setImageFiles={setTeamImageFiles}
          onSave={saveTeam}
          onCancel={() => {
            setIsTeamEditorOpen(false);
            setTeamImageFiles({});
            setTeamHeading(cloneValue(siteSettings.homeTeam.heading));
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
    </div>
  );
}

export default Home;
