import { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AdminToolbar from './components/AdminToolbar';
import Header from './components/Header';
import Home from './pages/Home';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
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
const ContactUs = lazyWithRetry(
  () => import('./pages/ContactUs'),
  'lazy-retry:contact-us'
);
const VirtualTour = lazyWithRetry(
  () => import('./pages/VirtualTour'),
  'lazy-retry:virtual-tour'
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
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [editControlsVisible, setEditControlsVisible] = useState(Boolean(getStoredStoryAdminAuth()));
  const location = useLocation();
  const isAdminLogin = location.pathname === '/login';

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
      <Header
        setShowBookNow={setShowBookNow}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        siteSettings={siteSettings}
        isEditMode={editControlsVisible}
      />
      <AdminToolbar
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        editControlsVisible={editControlsVisible}
        setEditControlsVisible={setEditControlsVisible}
      />
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
        <Suspense fallback={<RouteFallback />}>
          <Routes>
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
            <Route path="/virtual" element={<VirtualTour />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      <Footer
        setShowFreeBookNow={setShowFreeBookNow}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        siteSettings={siteSettings}
        setSiteSettings={setSiteSettings}
        isEditMode={editControlsVisible}
      />
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
