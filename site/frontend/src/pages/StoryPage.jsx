import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import ManagedServicesSection from '../components/ManagedServicesSection';
import StoryYear from '../components/StoryYear.jsx';
import Spinner from '../components/Spinner';
import StoryFeedEditorModal from '../components/StoryFeedEditorModal';
import HeroImageEditorModal from '../components/HeroImageEditorModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHero from '../components/PageHero';
import { getEvents, reset } from '../features/events/eventSlice';
import { getMiscTexts } from '../features/texts/textSlice.js';
import storyAdminService, {
  setStoredStoryAdminAuth,
} from '../features/events/storyAdminService';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import {
  applyStoryEventLanguage,
  createEmptyStoryEventForm,
  editorTextToHtml,
  mapStoryEventToForm,
} from '../features/events/storyAdminUtils';
import { DEFAULT_SITE_SETTINGS, resolveSiteImage } from '../content/siteSettingsDefaults';

function StoryPage({
  adminToken,
  setAdminToken,
  siteSettings = DEFAULT_SITE_SETTINGS,
  setSiteSettings,
  isEditMode,
  setIsEditMode,
}) {
  const dispatch = useDispatch();
  const language = localStorage.getItem('language') || 'en';

  const { events, isLoading, isError, message } = useSelector((state) => state.events);
  const { misc_texts } = useSelector((state) => state.texts);

  const [adminEvents, setAdminEvents] = useState([]);
  const [didLoadAdminEvents, setDidLoadAdminEvents] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorForm, setEditorForm] = useState(createEmptyStoryEventForm());
  const [editorMode, setEditorMode] = useState('create');
  const [lockYear, setLockYear] = useState(false);
  const [lockOrder, setLockOrder] = useState(false);
  const [isHeroEditorOpen, setIsHeroEditorOpen] = useState(false);
  const [singleImageFile, setSingleImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [storyHeroImageFile, setStoryHeroImageFile] = useState(null);
  const [storyHeroPreviewUrl, setStoryHeroPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [isSavingHero, setIsSavingHero] = useState(false);

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
  }, [dispatch]);

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  useEffect(() => {
    if (!storyHeroImageFile) {
      setStoryHeroPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(storyHeroImageFile);
    setStoryHeroPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [storyHeroImageFile]);

  const handleAdminAuthError = (error) => {
    if (error?.response?.status === 401) {
      setStoredStoryAdminAuth('');
      setAdminToken('');
      setAdminEvents([]);
      setDidLoadAdminEvents(false);
      setIsEditMode(false);
      setIsEditorOpen(false);
      toast.error('Admin session expired. Please log in again.');
      return;
    }

    toast.error(error?.response?.data?.message || error?.message || 'Story feed request failed.');
  };

  const loadAdminEvents = async (token = adminToken) => {
    if (!token) {
      setAdminEvents([]);
      setDidLoadAdminEvents(false);
      return;
    }

    setIsAdminLoading(true);
    try {
      const data = await storyAdminService.listStoryEvents(token);
      setAdminEvents(data);
      setDidLoadAdminEvents(true);
    } catch (error) {
      handleAdminAuthError(error);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadAdminEvents(adminToken);
    } else {
      setAdminEvents([]);
      setDidLoadAdminEvents(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const displayEvents = useMemo(() => {
    if (adminToken && didLoadAdminEvents) {
      return adminEvents.map((event) => applyStoryEventLanguage(event, language));
    }

    return events || [];
  }, [adminEvents, adminToken, didLoadAdminEvents, events, language]);

  const adminEventMap = useMemo(
    () => new Map(adminEvents.map((event) => [event._id, event])),
    [adminEvents]
  );

  const groupedYears = useMemo(
    () =>
      [...new Set(displayEvents.map((event) => event.year))]
        .sort((a, b) => a - b)
        .map((year) => ({
          year,
          events: displayEvents.filter((event) => event.year === year),
        })),
    [displayEvents]
  );

  const openCreateEditor = () => {
    const latestYear = displayEvents.length
      ? Math.max(...displayEvents.map((event) => event.year))
      : new Date().getFullYear();

    setEditorForm(createEmptyStoryEventForm(latestYear));
    setEditorMode('create');
    setLockYear(false);
    setLockOrder(false);
    setSingleImageFile(null);
    setGalleryFiles([]);
    setIsEditorOpen(true);
  };

  const openCreateEditorForYear = (currentEvent) => {
    const yearEvents = displayEvents.filter(
      (event) => Number(event.year) === Number(currentEvent?.year)
    );
    const currentIndex = yearEvents.findIndex((event) => event._id === currentEvent?._id);
    const nextOrder = currentIndex >= 0 ? currentIndex + 2 : yearEvents.length + 1;

    setEditorForm({
      ...createEmptyStoryEventForm(Number(currentEvent?.year)),
      year: Number(currentEvent?.year),
      order: nextOrder,
    });
    setEditorMode('add-page');
    setLockYear(true);
    setLockOrder(true);
    setSingleImageFile(null);
    setGalleryFiles([]);
    setIsEditorOpen(true);
  };

  const openEditEditor = (eventId) => {
    const rawEvent = adminEventMap.get(eventId);

    if (!rawEvent) {
      toast.error('Story item not found.');
      return;
    }

    setEditorForm(mapStoryEventToForm(rawEvent));
    setEditorMode('edit');
    setLockYear(false);
    setLockOrder(false);
    setSingleImageFile(null);
    setGalleryFiles([]);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorForm(createEmptyStoryEventForm());
    setEditorMode('create');
    setLockYear(false);
    setLockOrder(false);
    setSingleImageFile(null);
    setGalleryFiles([]);
  };

  const openDeleteDialog = (eventId = editorForm._id) => {
    if (!adminToken || !eventId) {
      return;
    }

    setPendingDeleteId(eventId);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setPendingDeleteId('');
  };

  const buildFormData = () => {
    const payload = new FormData();
    payload.append('year', String(editorForm.year));
    payload.append('order', String(editorForm.order));
    payload.append('mediaType', String(editorForm.mediaType));
    payload.append('title', editorForm.title);
    payload.append('title_estonian', editorForm.title_estonian);
    payload.append('description', editorTextToHtml(editorForm.description));
    payload.append('description_estonian', editorTextToHtml(editorForm.description_estonian));
    payload.append('video', editorForm.video);

    if (singleImageFile) {
      payload.append('imageFile', singleImageFile);
    }

    galleryFiles.forEach((file) => payload.append('galleryFiles', file));

    return payload;
  };

  const saveStoryEvent = async (event) => {
    event.preventDefault();

    if (!adminToken) {
      toast.error('Log in to edit the story feed.');
      return;
    }

    if (!editorForm.title.trim() || !editorForm.title_estonian.trim()) {
      toast.error('Both English and Estonian titles are required.');
      return;
    }

    if (!editorForm.description.trim() || !editorForm.description_estonian.trim()) {
      toast.error('Both English and Estonian descriptions are required.');
      return;
    }

    if (Number(editorForm.mediaType) === 2 && !editorForm.video.trim()) {
      toast.error('Video URL is required for video entries.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildFormData();
      const data = editorForm._id
        ? await storyAdminService.updateStoryEvent(adminToken, editorForm._id, payload)
        : await storyAdminService.createStoryEvent(adminToken, payload);

      setAdminEvents(data);
      setDidLoadAdminEvents(true);
      setIsEditorOpen(false);
      setSingleImageFile(null);
      setGalleryFiles([]);
      toast.success(editorForm._id ? 'Story item updated.' : 'Story item created.');
    } catch (error) {
      handleAdminAuthError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStoryEvent = async (eventId = editorForm._id) => {
    if (!adminToken || !eventId) {
      return;
    }

    setIsDeleting(true);

    try {
      const data = await storyAdminService.deleteStoryEvent(adminToken, eventId);
      setAdminEvents(data);
      setDidLoadAdminEvents(true);
      setIsEditorOpen(false);
      setPendingDeleteId('');
      setSingleImageFile(null);
      setGalleryFiles([]);
      toast.success('Story item deleted.');
    } catch (error) {
      handleAdminAuthError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const saveStoryHero = async (event) => {
    event.preventDefault();
    setIsSavingHero(true);

    try {
      const formData = new FormData();
      if (storyHeroImageFile) {
        formData.append('imageFile', storyHeroImageFile);
      }

      const nextSettings = await siteSettingsService.updateStoryHeroSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setStoryHeroImageFile(null);
      setIsHeroEditorOpen(false);
      toast.success('Story background updated.');
    } catch (error) {
      handleAdminAuthError(error);
    } finally {
      setIsSavingHero(false);
    }
  };

  const isPageLoading =
    (isLoading && (!events || events.length === 0)) ||
    (adminToken && isAdminLoading && !didLoadAdminEvents && (!events || events.length === 0));

  if (isPageLoading) {
    return <Spinner />;
  }

  const ourStoryText = misc_texts && misc_texts['our-story'] ? misc_texts['our-story'].text : null;
  const storyHeroBackground =
    storyHeroPreviewUrl ||
    resolveSiteImage(siteSettings.storyPage.image, siteSettings.storyPage.imageKey);

  return (
    <div className="story-page">
      <Helmet>
        <title>Our Story - Tales of Reval</title>
        <meta
          name="description"
          content="Explore the journey of Tales of Reval, from its inception to the present day, through immersive storytelling experiences and medieval themed events."
        />
        <meta
          name="keywords"
          content="Medieval Themed Events, Tallinn Team Building Events, Private Medieval Events, Unique Event Hosting Tallinn, Corporate Events in Tallinn, Team Building Activities Tallinn, Special Events Tallinn, Medieval Feasts and Events, Customized Medieval Events, Tallinn Event Management"
        />
      </Helmet>

      <PageHero
        mediaClassName="story-landing"
        backgroundImage={storyHeroBackground}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      >
        <h1>{ourStoryText}</h1>
      </PageHero>

      {adminToken && isEditMode ? (
        <div className="container">
          <div className="story-page-admin-toolbar story-page-admin-toolbar--compact">
            <div className="story-page-admin-actions">
              <button type="button" onClick={openCreateEditor}>
                Add year
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="container">
        <div className="tagline padding-40-top padding-40-bottom"></div>

        {groupedYears.length ? (
          groupedYears.map(({ year, events: yearEvents }) => (
            <StoryYear
              key={year}
              events={yearEvents}
              language={language}
              isEditable={Boolean(adminToken) && isEditMode}
              onEditEvent={openEditEditor}
              onAddPage={openCreateEditorForYear}
              onDeleteEvent={openDeleteDialog}
              isMutating={isSaving || isDeleting}
            />
          ))
        ) : (
          <div className="story-empty-state">
            <h3>No content items yet</h3>
            <p>Add the first item to start building the timeline on this page.</p>
            {adminToken && isEditMode ? (
              <button type="button" onClick={openCreateEditor}>
                Add first item
              </button>
            ) : null}
          </div>
        )}
      </div>

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

      {adminToken && isEditorOpen ? (
        <StoryFeedEditorModal
          form={editorForm}
          setForm={setEditorForm}
          singleImageFile={singleImageFile}
          setSingleImageFile={setSingleImageFile}
          galleryFiles={galleryFiles}
          setGalleryFiles={setGalleryFiles}
          onSave={saveStoryEvent}
          onDelete={() => openDeleteDialog(editorForm._id)}
          onCancel={closeEditor}
          isSaving={isSaving}
          isDeleting={isDeleting}
          editorMode={editorMode}
          lockYear={lockYear}
          lockOrder={lockOrder}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete item"
        message="Are you sure you want to delete this story item?"
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={closeDeleteDialog}
        onConfirm={() => deleteStoryEvent(pendingDeleteId)}
      />
      {adminToken && isHeroEditorOpen ? (
        <HeroImageEditorModal
          title="Change background image"
          description="Upload a new background image for the story page."
          currentImage={siteSettings.storyPage.image}
          currentImageUrl={resolveSiteImage(siteSettings.storyPage.image, siteSettings.storyPage.imageKey)}
          selectedFile={storyHeroImageFile}
          setSelectedFile={setStoryHeroImageFile}
          previewUrl={storyHeroPreviewUrl}
          onSave={saveStoryHero}
          onCancel={() => {
            setIsHeroEditorOpen(false);
            setStoryHeroImageFile(null);
          }}
          isSaving={isSavingHero}
        />
      ) : null}
    </div>
  );
}

export default StoryPage;
