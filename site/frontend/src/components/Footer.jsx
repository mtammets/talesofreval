import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getFooterTexts, reset } from '../features/texts/textSlice';
import FooterColumnLeft from './footer-components/FooterColumnLeft.jsx';
import FooterColumnMiddle from './footer-components/FooterColumnMiddle.jsx';
import FooterColumnRight from './footer-components/FooterColumnRight.jsx';
import { FALLBACK_FOOTER_TEXTS, hasTextEntries } from '../content/fallbackContent';
import HomeFooterEditorModal from './HomeFooterEditorModal';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

function Footer({
  setShowFreeBookNow,
  adminToken,
  setAdminToken,
  siteSettings,
  setSiteSettings,
  isEditMode = false,
}) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { footer_texts, isError, message } = useSelector((state) => state.texts);
  const [isFooterEditorOpen, setIsFooterEditorOpen] = useState(false);
  const [footerForm, setFooterForm] = useState(cloneValue(siteSettings?.footer || {}));
  const [gpsImageFile, setGpsImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    setFooterForm(cloneValue(siteSettings?.footer || {}));
  }, [siteSettings]);

  const saveFooter = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      [
        'freeTourHeading',
        'firstTime',
        'secondTime',
        'languageLine',
        'durationLine',
        'distanceLine',
        'startingPointLine',
        'openMapLabel',
        'gpsHeading',
        'gpsCopy',
        'gpsButtonLabel',
        'followUsHeading',
        'contactHeading',
        'address',
        'socialLinks',
      ].forEach((key) => {
        formData.append(key, JSON.stringify(footerForm[key]));
      });

      formData.append('openMapUrl', footerForm.openMapUrl || '');
      formData.append('gpsUrl', footerForm.gpsUrl || '');
      formData.append('companyName', footerForm.companyName || '');
      formData.append('companyReg', footerForm.companyReg || '');
      formData.append('email', footerForm.email || '');
      formData.append('phone', footerForm.phone || '');

      if (gpsImageFile) {
        formData.append('gpsImageFile', gpsImageFile);
      }

      const nextSettings = await siteSettingsService.updateFooterSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setGpsImageFile(null);
      setIsFooterEditorOpen(false);
      toast.success('Footer updated.');
    } catch (error) {
      if (error?.response?.status === 401) {
        setStoredStoryAdminAuth('');
        setAdminToken('');
        setIsFooterEditorOpen(false);
        toast.error('Admin session expired. Please log in again.');
      } else {
        toast.error(error?.response?.data?.message || error?.message || 'Footer update failed.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="footer section padding-80-top">
      <div className="container">
        {adminToken && isEditMode && location.pathname === '/' ? (
          <div className="footer-admin-row">
            <button type="button" className="section-edit-button" onClick={() => setIsFooterEditorOpen(true)}>
              Edit
            </button>
          </div>
        ) : null}
        <div className="footer-columns">
          <FooterColumnLeft texts={resolvedFooterTexts} content={siteSettings?.footer} setShowFreeBookNow={setShowFreeBookNow} />
          <FooterColumnMiddle texts={resolvedFooterTexts} content={siteSettings?.footer} />
          <FooterColumnRight texts={resolvedFooterTexts} content={siteSettings?.footer} />
        </div>
      </div>
      {adminToken && isFooterEditorOpen ? (
        <HomeFooterEditorModal
          footer={footerForm}
          setFooter={setFooterForm}
          gpsImageFile={gpsImageFile}
          setGpsImageFile={setGpsImageFile}
          onSave={saveFooter}
          onCancel={() => {
            setIsFooterEditorOpen(false);
            setGpsImageFile(null);
            setFooterForm(cloneValue(siteSettings?.footer || {}));
          }}
          isSaving={isSaving}
        />
      ) : null}
    </div>
  );
}

export default Footer;
