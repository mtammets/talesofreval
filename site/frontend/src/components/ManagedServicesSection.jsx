import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import HomeServicesEditorModal from './HomeServicesEditorModal';
import OurServices from './OurServices';
import siteSettingsService from '../features/siteSettings/siteSettingsService';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

function ManagedServicesSection({
  texts,
  siteSettings,
  setSiteSettings,
  adminToken,
  isEditMode = false,
  language = 'en',
  onAdminAuthError = null,
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [servicesHeading, setServicesHeading] = useState(
    cloneValue(siteSettings.homeServices.heading)
  );
  const [serviceItems, setServiceItems] = useState(
    cloneValue(siteSettings.homeServices.items)
  );
  const [serviceImageFiles, setServiceImageFiles] = useState({});

  useEffect(() => {
    setServicesHeading(cloneValue(siteSettings.homeServices.heading));
    setServiceItems(cloneValue(siteSettings.homeServices.items));
  }, [siteSettings]);

  const closeEditor = () => {
    setIsEditorOpen(false);
    setServiceImageFiles({});
    setServicesHeading(cloneValue(siteSettings.homeServices.heading));
    setServiceItems(cloneValue(siteSettings.homeServices.items));
  };

  const saveServices = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('heading', JSON.stringify(servicesHeading));
      formData.append('items', JSON.stringify(serviceItems));

      Object.entries(serviceImageFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`serviceImage_${index}`, file);
        }
      });

      const nextSettings = await siteSettingsService.updateServicesSiteSettings(
        adminToken,
        formData
      );
      setSiteSettings(nextSettings);
      closeEditor();
      toast.success('Services updated.');
    } catch (error) {
      if (onAdminAuthError) {
        onAdminAuthError(error, 'Services update failed.');
      } else {
        toast.error(
          error?.response?.data?.message || error?.message || 'Services update failed.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <OurServices
        texts={texts}
        heading={siteSettings.homeServices.heading}
        items={siteSettings.homeServices.items}
        language={language}
        compact
        adminAction={
          adminToken && isEditMode ? (
            <button
              type="button"
              className="section-edit-button"
              onClick={() => setIsEditorOpen(true)}
            >
              Edit
            </button>
          ) : null
        }
      />
      {adminToken && isEditorOpen ? (
        <HomeServicesEditorModal
          heading={{ value: servicesHeading, set: setServicesHeading }}
          items={{ value: serviceItems, set: setServiceItems }}
          imageFiles={serviceImageFiles}
          setImageFiles={setServiceImageFiles}
          onSave={saveServices}
          onCancel={closeEditor}
          isSaving={isSaving}
        />
      ) : null}
    </>
  );
}

export default ManagedServicesSection;
