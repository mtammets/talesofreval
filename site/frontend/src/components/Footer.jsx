import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFooterTexts, reset } from '../features/texts/textSlice';
import FooterColumnLeft from './footer-components/FooterColumnLeft.jsx';
import FooterColumnMiddle from './footer-components/FooterColumnMiddle.jsx';
import FooterColumnRight from './footer-components/FooterColumnRight.jsx';
import { FALLBACK_FOOTER_TEXTS, hasTextEntries } from '../content/fallbackContent';

function Footer({ setShowFreeBookNow }) {
  const dispatch = useDispatch();
  const { footer_texts, isError, message } = useSelector((state) => state.texts);

  useEffect(() => {
    dispatch(getFooterTexts());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Footer texts fallback active:', message);
    }
  }, [isError, message]);

  const resolvedFooterTexts = hasTextEntries(footer_texts)
    ? footer_texts
    : FALLBACK_FOOTER_TEXTS;

  return (
    <div className="footer section padding-80-top">
      <div className="container">
        <div className="footer-columns">
          <FooterColumnLeft texts={resolvedFooterTexts} setShowFreeBookNow={setShowFreeBookNow} />
          <FooterColumnMiddle texts={resolvedFooterTexts} />
          <FooterColumnRight texts={resolvedFooterTexts} />
        </div>
      </div>
    </div>
  );
}

export default Footer;
