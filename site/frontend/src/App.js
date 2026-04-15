import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AdminToolbar from './components/AdminToolbar';
import Header from './components/Header';
import Home from './pages/Home';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import { getStoredStoryAdminAuth } from './features/events/storyAdminService';
import { DEFAULT_SITE_SETTINGS } from './content/siteSettingsDefaults';
import siteSettingsService from './features/siteSettings/siteSettingsService';

import 'react-toastify/dist/ReactToastify.css';

const StyleGuide = lazy(() => import('./pages/StyleGuide'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const VirtualTour = lazy(() => import('./pages/VirtualTour'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

const BookNowPopup = lazy(() => import('./components/BookNowPopup'));
const FreeBookNow = lazy(() => import('./components/FreeBookNow'));

function RouteFallback() {
  return <Spinner />;
}

function AppShell() {
  const [adminToken, setAdminToken] = useState(getStoredStoryAdminAuth());
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

  return (
    <>
      <Header
        setShowBookNow={setShowBookNow}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
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
                  <AdminLoginPage adminToken={adminToken} setAdminToken={setAdminToken} />
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
      <ToastContainer />
    </>
  );
}

export default App;
