import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Header from './components/Header';
import Home from './pages/Home';
import Spinner from './components/Spinner';
import Footer from './components/Footer';

import 'react-toastify/dist/ReactToastify.css';

const StyleGuide = lazy(() => import('./pages/StyleGuide'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const VirtualTour = lazy(() => import('./pages/VirtualTour'));

const BookNowPopup = lazy(() => import('./components/BookNowPopup'));
const FreeBookNow = lazy(() => import('./components/FreeBookNow'));

function RouteFallback() {
  return <Spinner />;
}

function App() {
  const [showBookNow, setShowBookNow] = useState(false);
  const [showFreeBookNow, setShowFreeBookNow] = useState(false);

  return (
    <>
      <Router>
        <Header setShowBookNow={setShowBookNow} />
        <Suspense fallback={null}>
          {showBookNow ? (
            <BookNowPopup showBookNow={showBookNow} setShowBookNow={setShowBookNow} />
          ) : null}
          {showFreeBookNow ? (
            <FreeBookNow
              showBookNow={showFreeBookNow}
              setShowBookNow={setShowFreeBookNow}
            />
          ) : null}
        </Suspense>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/story" element={<StoryPage />} />
            <Route path="/contacts" element={<ContactUs />} />
            <Route path="/styles" element={<StyleGuide />} />
            <Route
              path="/service/:serviceType"
              element={<ServicePage setShowBookNow={setShowBookNow} />}
            />
            <Route path="/" element={<Home />} />
            <Route path="/virtual" element={<VirtualTour />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Footer setShowFreeBookNow={setShowFreeBookNow} />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
