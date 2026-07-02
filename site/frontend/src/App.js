import { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AdminToolbar from './components/AdminToolbar';
import Header from './components/Header';
import Home from './pages/Home';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import HomeFaq from './components/HomeFaq';
import storyAdminService, {
  getStoredStoryAdminAuth,
  setStoredStoryAdminAuth,
} from './features/events/storyAdminService';
import { DEFAULT_SITE_SETTINGS } from './content/siteSettingsDefaults';
import siteSettingsService from './features/siteSettings/siteSettingsService';
import { scrollViewportTop } from './utils/scrollViewportTop';
import lazyWithRetry from './utils/lazyWithRetry';

import 'react-toastify/dist/ReactToastify.css';

const StyleGuide = lazyWithRetry(
  () => import('./pages/StyleGuide'),
  'lazy-retry:style-guide'
);
const ServicePage = lazyWithRetry(
  () => import('./pages/ServicePage'),
  'lazy-retry:service-page'
);
const StoryPage = lazyWithRetry(
  () => import('./pages/StoryPage'),
  'lazy-retry:story-page'
);
const ServicesOverview = lazyWithRetry(
  () => import('./pages/ServicesOverview'),
  'lazy-retry:services-overview'
);
const BlogPage = lazyWithRetry(
  () => import('./pages/BlogPage'),
  'lazy-retry:blog-page'
);
const ContactUs = lazyWithRetry(
  () => import('./pages/ContactUs'),
  'lazy-retry:contact-us'
);
const VirtualTour = lazyWithRetry(
  () => import('./pages/VirtualTour'),
  'lazy-retry:virtual-tour'
);
const GuideTipPage = lazyWithRetry(
  () => import('./pages/GuideTipPage'),
  'lazy-retry:guide-tip-page'
);
const BookingPage = lazyWithRetry(
  () => import('./pages/BookingPage'),
  'lazy-retry:booking-page'
);
const AdminLoginPage = lazyWithRetry(
  () => import('./pages/AdminLoginPage'),
  'lazy-retry:admin-login'
);

const BookNowPopup = lazyWithRetry(
  () => import('./components/BookNowPopup'),
  'lazy-retry:book-now-popup'
);
const FreeBookNow = lazyWithRetry(
  () => import('./components/FreeBookNow'),
  'lazy-retry:free-book-now'
);

function RouteFallback() {
  return <Spinner />;
}

function AppShell() {
  const [adminToken, setAdminToken] = useState('');
  const [showBookNow, setShowBookNow] = useState(false);
  const [showFreeBookNow, setShowFreeBookNow] = useState(false);
  const [isFreeTourCalendarEditorOpen, setIsFreeTourCalendarEditorOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false);
  const [editControlsVisible, setEditControlsVisible] = useState(Boolean(getStoredStoryAdminAuth()));
  const location = useLocation();
  const isAdminLogin = location.pathname === '/login';
  const isBookingPage = location.pathname === '/booking';
  const isGuideTipPage = location.pathname.startsWith('/tip/');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (localStorage.getItem('language') === null) {
      localStorage.setItem('language', 'en');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSiteSettings = async () => {
      try {
        const settings = await siteSettingsService.getSiteSettings();
        if (isMounted) {
          setSiteSettings(settings);
        }
      } catch (error) {
        console.warn('Site settings fallback active:', error?.message || error);
      } finally {
        if (isMounted) {
          setSiteSettingsLoaded(true);
        }
      }
    };

    loadSiteSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreAdminSession = async () => {
      try {
        await storyAdminService.getAdminSession();

        if (!isMounted) {
          return;
        }

        setStoredStoryAdminAuth('active');
        setAdminToken('active');
        setEditControlsVisible(true);
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setStoredStoryAdminAuth('');
        setAdminToken('');
        setEditControlsVisible(false);
      }
    };

    restoreAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isAdminActive = Boolean(adminToken);

    root.classList.toggle('story-admin-active', isAdminActive);
    body.classList.toggle('story-admin-active', isAdminActive);

    return () => {
      root.classList.remove('story-admin-active');
      body.classList.remove('story-admin-active');
    };
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) {
      setEditControlsVisible(false);
      setIsFreeTourCalendarEditorOpen(false);
    }
  }, [adminToken]);

  useLayoutEffect(() => {
    if (location.pathname === '/login') {
      return undefined;
    }

    scrollViewportTop();
    const frameId = window.requestAnimationFrame(scrollViewportTop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.search]);

  return (
    <>
      {!isGuideTipPage ? (
        <Header
          setShowBookNow={setShowBookNow}
          adminToken={adminToken}
          setAdminToken={setAdminToken}
          siteSettings={siteSettings}
          isEditMode={editControlsVisible}
        />
      ) : null}
      {!isGuideTipPage ? (
        <AdminToolbar
          adminToken={adminToken}
          setAdminToken={setAdminToken}
          editControlsVisible={editControlsVisible}
          setEditControlsVisible={setEditControlsVisible}
          onOpenFreeTourCalendar={() => setIsFreeTourCalendarEditorOpen(true)}
        />
      ) : null}
      {!isGuideTipPage ? (
        <Suspense fallback={null}>
          {!isAdminLogin && showBookNow ? (
            <BookNowPopup showBookNow={showBookNow} setShowBookNow={setShowBookNow} />
          ) : null}
          {!isAdminLogin && showFreeBookNow ? (
            <FreeBookNow
              showBookNow={showFreeBookNow}
              setShowBookNow={setShowFreeBookNow}
            />
          ) : null}
        </Suspense>
      ) : null}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
            <Route
              path="/tip/:guideId"
              element={
                <GuideTipPage
                  siteSettings={siteSettings}
                  isSiteSettingsReady={siteSettingsLoaded}
                />
              }
            />
            <Route
              path="/story"
              element={
                <StoryPage
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                  isEditMode={editControlsVisible}
                  setIsEditMode={setEditControlsVisible}
                />
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Home
                    adminToken={adminToken}
                    setAdminToken={setAdminToken}
                    siteSettings={siteSettings}
                    setSiteSettings={setSiteSettings}
                    disableSeo
                  />
                  <AdminLoginPage
                    adminToken={adminToken}
                    setAdminToken={setAdminToken}
                    setEditControlsVisible={setEditControlsVisible}
                  />
                </>
              }
            />
            <Route
              path="/contacts"
              element={
                <ContactUs
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                  isEditMode={editControlsVisible}
                />
              }
            />
            <Route
              path="/booking"
              element={
                <BookingPage
                  siteSettings={siteSettings}
                  setShowFreeBookNow={setShowFreeBookNow}
                />
              }
            />
            <Route
              path="/services"
              element={<ServicesOverview siteSettings={siteSettings} />}
            />
            <Route
              path="/blog"
              element={<BlogPage siteSettings={siteSettings} />}
            />
            <Route path="/styles" element={<StyleGuide />} />
            <Route
              path="/service/:serviceType"
              element={
                <ServicePage
                  setShowBookNow={setShowBookNow}
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                  isEditMode={editControlsVisible}
                />
              }
            />
            <Route
              path="/"
              element={
                <Home
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                  isEditMode={editControlsVisible}
                />
              }
            />
            <Route
              path="/virtual"
              element={
                <VirtualTour
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                  isEditMode={editControlsVisible}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {!isGuideTipPage && !isBookingPage ? (
        <Footer
          setShowFreeBookNow={setShowFreeBookNow}
          adminToken={adminToken}
          setAdminToken={setAdminToken}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          isEditMode={editControlsVisible}
          isCalendarEditorOpen={isFreeTourCalendarEditorOpen}
          setIsCalendarEditorOpen={setIsFreeTourCalendarEditorOpen}
        />
      ) : null}
      {isHomePage ? (
        <HomeFaq language={localStorage.getItem('language') || 'en'} />
      ) : null}
    </>
  );
}

function App() {
  return (
    <>
      <Router>
        <AppShell />
      </Router>
      <ToastContainer position="bottom-center" draggable={false} limit={1} />
    </>
  );
}

export default App;
