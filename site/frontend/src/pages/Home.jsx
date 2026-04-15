import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import HomeLanding from '../components/HomeLanding';
import HomeHeroEditorModal from '../components/HomeHeroEditorModal';
import HomeReviewEditorModal from '../components/HomeReviewEditorModal';
import HomeServicesEditorModal from '../components/HomeServicesEditorModal';
import HomeTeamEditorModal from '../components/HomeTeamEditorModal';
import OurServices from '../components/OurServices';
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
  getLocalizedSiteText,
  resolveSiteImage,
} from '../content/siteSettingsDefaults';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

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
  const [isServicesEditorOpen, setIsServicesEditorOpen] = useState(false);
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  const [isReviewEditorOpen, setIsReviewEditorOpen] = useState(false);

  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState('');
  const [servicesHeading, setServicesHeading] = useState(cloneValue(siteSettings.homeServices.heading));
  const [serviceItems, setServiceItems] = useState(cloneValue(siteSettings.homeServices.items));
  const [serviceImageFiles, setServiceImageFiles] = useState({});
  const [teamHeading, setTeamHeading] = useState(cloneValue(siteSettings.homeTeam.heading));
  const [teamMembers, setTeamMembers] = useState(cloneValue(siteSettings.homeTeam.members));
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
    setServicesHeading(cloneValue(siteSettings.homeServices.heading));
    setServiceItems(cloneValue(siteSettings.homeServices.items));
    setTeamHeading(cloneValue(siteSettings.homeTeam.heading));
    setTeamMembers(cloneValue(siteSettings.homeTeam.members));
    setReviewHeading(cloneValue(siteSettings.homeReview.heading));
    setReviewText(cloneValue(siteSettings.homeReview.text));
    setReviewer(cloneValue(siteSettings.homeReview.reviewer));
    setHeroTitleLine1(cloneValue(siteSettings.homeHero.titleLine1));
    setHeroTitleLine2(cloneValue(siteSettings.homeHero.titleLine2));
    setHeroSubtitle(cloneValue(siteSettings.homeHero.subtitle));
  }, [siteSettings]);

  useEffect(() => {
    if (!heroImageFile) {
      setHeroPreviewUrl('');
      return;
    }

    const objectUrl = window.URL.createObjectURL(heroImageFile);
    setHeroPreviewUrl(objectUrl);

    return () => {
      window.URL.revokeObjectURL(objectUrl);
    };
  }, [heroImageFile]);

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

  const closeHeroEditor = () => {
    setIsHeroEditorOpen(false);
    setHeroImageFile(null);
    setHeroTitleLine1(cloneValue(siteSettings.homeHero.titleLine1));
    setHeroTitleLine2(cloneValue(siteSettings.homeHero.titleLine2));
    setHeroSubtitle(cloneValue(siteSettings.homeHero.subtitle));
  };

  const saveHero = async (event) => {
    event.preventDefault();
    setIsSavingSection('hero');

    try {
      const formData = new FormData();
      formData.append('titleLine1', JSON.stringify(heroTitleLine1));
      formData.append('titleLine2', JSON.stringify(heroTitleLine2));
      formData.append('subtitle', JSON.stringify(heroSubtitle));
      if (heroImageFile) {
        formData.append('imageFile', heroImageFile);
      }

      const nextSettings = await siteSettingsService.updateHeroSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      closeHeroEditor();
      toast.success('Homepage background updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Background update failed.');
    } finally {
      setIsSavingSection('');
    }
  };

  const saveServices = async (event) => {
    event.preventDefault();
    setIsSavingSection('services');

    try {
      const formData = new FormData();
      formData.append('heading', JSON.stringify(servicesHeading));
      formData.append('items', JSON.stringify(serviceItems));
      Object.entries(serviceImageFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`serviceImage_${index}`, file);
        }
      });

      const nextSettings = await siteSettingsService.updateServicesSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setServiceImageFiles({});
      setIsServicesEditorOpen(false);
      toast.success('Homepage services updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Services update failed.');
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
        backgroundImage={heroPreviewUrl || siteSettings.homeHero.image?.src}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      />

      <div className="container home-content">
        <OurServices
          texts={resolvedMiscTexts}
          compact
          heading={siteSettings.homeServices.heading}
          items={siteSettings.homeServices.items}
          language={language}
          adminAction={
            adminToken && isEditMode ? (
              <SectionEditButton onClick={() => setIsServicesEditorOpen(true)} />
            ) : null
          }
        />
        <OurTeam
          texts={resolvedMiscTexts}
          heading={siteSettings.homeTeam.heading}
          items={siteSettings.homeTeam.members}
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
      </div>

      {adminToken && isHeroEditorOpen ? (
        <HomeHeroEditorModal
          currentImage={siteSettings.homeHero.image}
          currentImageUrl={resolveSiteImage(siteSettings.homeHero.image, siteSettings.homeHero.imageKey)}
          selectedFile={heroImageFile}
          setSelectedFile={setHeroImageFile}
          previewUrl={heroPreviewUrl}
          onSave={saveHero}
          onCancel={closeHeroEditor}
          isSaving={isSavingSection === 'hero'}
          titleLine1={heroTitleLine1}
          setTitleLine1={setHeroTitleLine1}
          titleLine2={heroTitleLine2}
          setTitleLine2={setHeroTitleLine2}
          subtitle={heroSubtitle}
          setSubtitle={setHeroSubtitle}
        />
      ) : null}

      {adminToken && isServicesEditorOpen ? (
        <HomeServicesEditorModal
          heading={{ value: servicesHeading, set: setServicesHeading }}
          items={{ value: serviceItems, set: setServiceItems }}
          imageFiles={serviceImageFiles}
          setImageFiles={setServiceImageFiles}
          onSave={saveServices}
          onCancel={() => {
            setIsServicesEditorOpen(false);
            setServiceImageFiles({});
            setServicesHeading(cloneValue(siteSettings.homeServices.heading));
            setServiceItems(cloneValue(siteSettings.homeServices.items));
          }}
          isSaving={isSavingSection === 'services'}
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
