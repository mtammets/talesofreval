import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { getFooterTexts, reset } from '../features/texts/textSlice';
import FooterColumnLeft from './footer-components/FooterColumnLeft.jsx';
import FooterColumnMiddle from './footer-components/FooterColumnMiddle.jsx';
import FooterColumnRight from './footer-components/FooterColumnRight.jsx';
import { FALLBACK_FOOTER_TEXTS, hasTextEntries } from '../content/fallbackContent';
import HomeFooterEditorModal from './HomeFooterEditorModal';
import FreeTourScheduleEditorModal from './FreeTourScheduleEditorModal';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import { normalizeFreeTourEmailTemplates } from '../utils/freeTourEmailTemplates';
import { toEditableFreeTourSchedule } from '../utils/freeTourSchedule';
import {
  FOOTER_GPS_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
} from '../utils/prepareImageFilesForUpload';

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
  const { footer_texts, isError, message } = useSelector((state) => state.texts);
  const [isFooterEditorOpen, setIsFooterEditorOpen] = useState(false);
  const [footerForm, setFooterForm] = useState(cloneValue(siteSettings?.footer || {}));
  const [freeTourScheduleForm, setFreeTourScheduleForm] = useState(
    cloneValue(toEditableFreeTourSchedule(siteSettings?.freeTourSchedule))
  );
  const [freeTourEmailTemplatesForm, setFreeTourEmailTemplatesForm] = useState(
    cloneValue(normalizeFreeTourEmailTemplates(siteSettings?.freeTourEmails))
  );
  const [gpsImageFile, setGpsImageFile] = useState(null);
  const [isPreparingGpsImage, setIsPreparingGpsImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarEditorOpen, setIsCalendarEditorOpen] = useState(false);
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);

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
    setFreeTourScheduleForm(cloneValue(toEditableFreeTourSchedule(siteSettings?.freeTourSchedule)));
    setFreeTourEmailTemplatesForm(cloneValue(normalizeFreeTourEmailTemplates(siteSettings?.freeTourEmails)));
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
      formData.append('gpsImage', JSON.stringify(footerForm.gpsImage || null));
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
      setIsPreparingGpsImage(false);
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

  const saveFreeTourSchedule = async (event) => {
    event.preventDefault();
    setIsSavingCalendar(true);

    try {
      const nextSettings = await siteSettingsService.updateFreeTourScheduleSiteSettings(
        adminToken,
        {
          freeTourSchedule: freeTourScheduleForm,
          freeTourEmails: freeTourEmailTemplatesForm,
        }
      );
      setSiteSettings(nextSettings);
      setIsCalendarEditorOpen(false);
      toast.success('Free tour settings updated.');
    } catch (error) {
      if (error?.response?.status === 401) {
        setStoredStoryAdminAuth('');
        setAdminToken('');
        setIsCalendarEditorOpen(false);
        toast.error('Admin session expired. Please log in again.');
      } else {
        toast.error(
          error?.response?.data?.message || error?.message || 'Free tour settings update failed.'
        );
      }
    } finally {
      setIsSavingCalendar(false);
    }
  };

  const handleGpsImageFileSelected = async (file) => {
    if (!file) {
      setGpsImageFile(null);
      return;
    }

    setIsPreparingGpsImage(true);

    try {
      const preparedFile = await prepareImageFileForUpload(
        file,
        FOOTER_GPS_IMAGE_PREPARATION_OPTIONS
      );

      if (!preparedFile) {
        return;
      }

      setGpsImageFile(preparedFile);
      setFooterForm((current) => ({
        ...current,
        gpsImage: {
          ...(current.gpsImage || {}),
          name: preparedFile.name,
          focusX: 50,
          focusY: 50,
          zoom: 1,
        },
      }));
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingGpsImage(false);
    }
  };

  return (
    <div className="footer section padding-80-top">
      <div className="container">
        {adminToken && isEditMode ? (
          <div className="footer-admin-row">
            <button type="button" className="section-edit-button" onClick={() => setIsFooterEditorOpen(true)}>
              Edit
            </button>
            <button
              type="button"
              className="section-edit-button"
              onClick={() => setIsCalendarEditorOpen(true)}
            >
              Edit calendar
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
          onSelectGpsImageFile={handleGpsImageFileSelected}
          currentGpsImage={siteSettings?.footer?.gpsImage || null}
          currentGpsImageUrl=""
          onSave={saveFooter}
          onCancel={() => {
            setIsFooterEditorOpen(false);
            setGpsImageFile(null);
            setIsPreparingGpsImage(false);
            setFooterForm(cloneValue(siteSettings?.footer || {}));
          }}
          isSaving={isSaving}
          isPreparingImage={isPreparingGpsImage}
        />
      ) : null}
      {adminToken && isCalendarEditorOpen ? (
        <FreeTourScheduleEditorModal
          schedule={freeTourScheduleForm}
          setSchedule={setFreeTourScheduleForm}
          emailTemplates={freeTourEmailTemplatesForm}
          setEmailTemplates={setFreeTourEmailTemplatesForm}
          onSave={saveFreeTourSchedule}
          onCancel={() => {
            setIsCalendarEditorOpen(false);
            setFreeTourScheduleForm(cloneValue(toEditableFreeTourSchedule(siteSettings?.freeTourSchedule)));
            setFreeTourEmailTemplatesForm(
              cloneValue(normalizeFreeTourEmailTemplates(siteSettings?.freeTourEmails))
            );
          }}
          isSaving={isSavingCalendar}
        />
      ) : null}
    </div>
  );
}

export default Footer;
