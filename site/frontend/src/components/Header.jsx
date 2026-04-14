import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DesktopHeader from './header-components/DesktopHeader.jsx';
import MobileHeader from './header-components/MobileHeader.jsx';
import { getHeaderTexts, getMiscTexts, reset } from '../features/texts/textSlice';
import {
  FALLBACK_HEADER_TEXTS,
  FALLBACK_MISC_TEXTS,
  hasTextEntries,
} from '../content/fallbackContent';

function Header({ setShowBookNow }) {
  const [smallScreen, setSmallScreen] = useState(window.innerWidth < 1100);
  const [ourServicesOpen, setOurServicesOpen] = useState(false);
  const dispatch = useDispatch();
  const { header_texts, misc_texts, isError, message } = useSelector((state) => state.texts);

  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.innerWidth < 1100);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    dispatch(getHeaderTexts());
    dispatch(getMiscTexts());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Header texts fallback active:', message);
    }
  }, [isError, message]);

  const resolvedHeaderTexts = hasTextEntries(header_texts)
    ? header_texts
    : FALLBACK_HEADER_TEXTS;
  const resolvedMiscTexts = hasTextEntries(misc_texts)
    ? misc_texts
    : FALLBACK_MISC_TEXTS;
  const isVirtualPage = window.location.pathname.startsWith('/virtual');

  return (
    <div className="header">
      {ourServicesOpen ? <div className="dropdown-background"></div> : null}
      {smallScreen ? (
        <MobileHeader
          virtual={isVirtualPage}
          texts={resolvedHeaderTexts}
          misc_texts={resolvedMiscTexts}
          setShowBookNow={setShowBookNow}
          ourServicesOpen={ourServicesOpen}
          setOurServicesOpen={setOurServicesOpen}
        />
      ) : (
        <DesktopHeader
          virtual={isVirtualPage}
          texts={resolvedHeaderTexts}
          misc_texts={resolvedMiscTexts}
          setShowBookNow={setShowBookNow}
          ourServicesOpen={ourServicesOpen}
          setOurServicesOpen={setOurServicesOpen}
        />
      )}
    </div>
  );
}

export default Header;
