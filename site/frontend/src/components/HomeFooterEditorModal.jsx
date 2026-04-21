import { useEffect, useState } from 'react';

import { resolveSiteImage } from '../content/siteSettingsDefaults';
import AdminModalShell from './AdminModalShell';
import ImageFocusEditor from './ImageFocusEditor';

const cloneValue = (value) =>
  value === null || value === undefined ? value : JSON.parse(JSON.stringify(value));

function HomeFooterEditorModal({
  footer,
  setFooter,
  gpsImageFile,
  onSelectGpsImageFile,
  currentGpsImage = null,
  currentGpsImageUrl = '',
  onSave,
  onCancel,
  isSaving,
  isPreparingImage = false,
}) {
  const [gpsPreviewUrl, setGpsPreviewUrl] = useState('');

  useEffect(() => {
    if (!gpsImageFile) {
      setGpsPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(gpsImageFile);
    setGpsPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [gpsImageFile]);

  const updateLocalized = (key, language, value) => {
    setFooter((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [language]: value,
      },
    }));
  };

  const updateValue = (key, value) => {
    setFooter((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateSocial = (key, value) => {
    setFooter((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value,
      },
    }));
  };

  const updateGpsImageFocus = (focus) => {
    setFooter((current) => ({
      ...current,
      gpsImage: {
        ...(current.gpsImage || {}),
        ...focus,
      },
    }));
  };

  const restoreCurrentGpsImage = () => {
    onSelectGpsImageFile?.(null);
    setFooter((current) => ({
      ...current,
      gpsImage: cloneValue(currentGpsImage || null),
    }));
  };

  const gpsImageUrl =
    gpsPreviewUrl ||
    resolveSiteImage(footer.gpsImage, footer.gpsImageKey) ||
    currentGpsImageUrl;
  const gpsImageName = gpsImageFile?.name || footer.gpsImage?.name || currentGpsImage?.name || '';
  const gpsImageStatus = isPreparingImage
    ? 'Optimizing selected image in the browser...'
    : gpsImageFile
      ? '1 new image added'
      : gpsImageUrl
        ? 'Choose a replacement image'
        : 'Choose an image';

  return (
    <AdminModalShell
      eyebrow="Footer system"
      title="Edit footer"
      description="Update the site footer content and links."
      onClose={onCancel}
      wide
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Free tour heading (EN)
              <input type="text" value={footer.freeTourHeading.en} onChange={(event) => updateLocalized('freeTourHeading', 'en', event.target.value)} />
            </label>
            <label>
              Free tour heading (ET)
              <input type="text" value={footer.freeTourHeading.ee} onChange={(event) => updateLocalized('freeTourHeading', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              First time (EN)
              <input type="text" value={footer.firstTime.en} onChange={(event) => updateLocalized('firstTime', 'en', event.target.value)} />
            </label>
            <label>
              First time (ET)
              <input type="text" value={footer.firstTime.ee} onChange={(event) => updateLocalized('firstTime', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Second time (EN)
              <input type="text" value={footer.secondTime.en} onChange={(event) => updateLocalized('secondTime', 'en', event.target.value)} />
            </label>
            <label>
              Second time (ET)
              <input type="text" value={footer.secondTime.ee} onChange={(event) => updateLocalized('secondTime', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Language line (EN)
              <input type="text" value={footer.languageLine.en} onChange={(event) => updateLocalized('languageLine', 'en', event.target.value)} />
            </label>
            <label>
              Language line (ET)
              <input type="text" value={footer.languageLine.ee} onChange={(event) => updateLocalized('languageLine', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Duration line (EN)
              <input type="text" value={footer.durationLine.en} onChange={(event) => updateLocalized('durationLine', 'en', event.target.value)} />
            </label>
            <label>
              Duration line (ET)
              <input type="text" value={footer.durationLine.ee} onChange={(event) => updateLocalized('durationLine', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Distance line (EN)
              <input type="text" value={footer.distanceLine.en} onChange={(event) => updateLocalized('distanceLine', 'en', event.target.value)} />
            </label>
            <label>
              Distance line (ET)
              <input type="text" value={footer.distanceLine.ee} onChange={(event) => updateLocalized('distanceLine', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Starting point line (EN)
              <input type="text" value={footer.startingPointLine.en} onChange={(event) => updateLocalized('startingPointLine', 'en', event.target.value)} />
            </label>
            <label>
              Starting point line (ET)
              <input type="text" value={footer.startingPointLine.ee} onChange={(event) => updateLocalized('startingPointLine', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Open map button (EN)
              <input type="text" value={footer.openMapLabel.en} onChange={(event) => updateLocalized('openMapLabel', 'en', event.target.value)} />
            </label>
            <label>
              Open map button (ET)
              <input type="text" value={footer.openMapLabel.ee} onChange={(event) => updateLocalized('openMapLabel', 'ee', event.target.value)} />
            </label>
          </div>
          <label>
            Open map URL
            <input type="text" value={footer.openMapUrl} onChange={(event) => updateValue('openMapUrl', event.target.value)} />
          </label>
          <div className="story-admin-grid two">
            <label>
              GPS heading (EN)
              <input type="text" value={footer.gpsHeading.en} onChange={(event) => updateLocalized('gpsHeading', 'en', event.target.value)} />
            </label>
            <label>
              GPS heading (ET)
              <input type="text" value={footer.gpsHeading.ee} onChange={(event) => updateLocalized('gpsHeading', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              GPS copy (EN)
              <input type="text" value={footer.gpsCopy.en} onChange={(event) => updateLocalized('gpsCopy', 'en', event.target.value)} />
            </label>
            <label>
              GPS copy (ET)
              <input type="text" value={footer.gpsCopy.ee} onChange={(event) => updateLocalized('gpsCopy', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              GPS button (EN)
              <input type="text" value={footer.gpsButtonLabel.en} onChange={(event) => updateLocalized('gpsButtonLabel', 'en', event.target.value)} />
            </label>
            <label>
              GPS button (ET)
              <input type="text" value={footer.gpsButtonLabel.ee} onChange={(event) => updateLocalized('gpsButtonLabel', 'ee', event.target.value)} />
            </label>
          </div>
          <label>
            GPS URL
            <input type="text" value={footer.gpsUrl} onChange={(event) => updateValue('gpsUrl', event.target.value)} />
          </label>
          <div className="footer-gps-editor hero-editor-gallery hero-editor-gallery--single">
            <label>
              GPS image
              <span className="story-admin-file-picker">
                <input
                  className="story-admin-file-picker__input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    onSelectGpsImageFile?.(event.target.files?.[0] || null);
                    event.target.value = '';
                  }}
                />
                <span className="story-admin-file-picker__button">Choose file</span>
                <span className="story-admin-file-picker__status">{gpsImageStatus}</span>
              </span>
            </label>

            <div className="hero-editor-gallery__grid">
              <div className="hero-editor-gallery__card">
                <ImageFocusEditor
                  image={footer.gpsImage || currentGpsImage}
                  imageUrl={gpsImageUrl}
                  onChange={updateGpsImageFocus}
                  aspectRatio="800 / 560"
                  label={null}
                  helpText={null}
                  allowZoom
                />
                <div
                  className={`hero-editor-gallery__meta${
                    gpsImageName ? '' : ' hero-editor-gallery__meta--actions-only'
                  }`}
                >
                  {gpsImageName ? <span>{gpsImageName}</span> : null}
                  {gpsImageFile ? (
                    <button
                      type="button"
                      className="story-admin-button story-admin-button--secondary"
                      onClick={restoreCurrentGpsImage}
                    >
                      Use current
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="story-admin-grid two">
            <label>
              Follow us heading (EN)
              <input type="text" value={footer.followUsHeading.en} onChange={(event) => updateLocalized('followUsHeading', 'en', event.target.value)} />
            </label>
            <label>
              Follow us heading (ET)
              <input type="text" value={footer.followUsHeading.ee} onChange={(event) => updateLocalized('followUsHeading', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Contact heading (EN)
              <input type="text" value={footer.contactHeading.en} onChange={(event) => updateLocalized('contactHeading', 'en', event.target.value)} />
            </label>
            <label>
              Contact heading (ET)
              <input type="text" value={footer.contactHeading.ee} onChange={(event) => updateLocalized('contactHeading', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              E-mail
              <input type="email" value={footer.email} onChange={(event) => updateValue('email', event.target.value)} />
            </label>
            <label>
              Phone
              <input type="text" value={footer.phone} onChange={(event) => updateValue('phone', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Company name
              <input type="text" value={footer.companyName} onChange={(event) => updateValue('companyName', event.target.value)} />
            </label>
            <label>
              Company reg
              <input type="text" value={footer.companyReg} onChange={(event) => updateValue('companyReg', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Address (EN)
              <input type="text" value={footer.address.en} onChange={(event) => updateLocalized('address', 'en', event.target.value)} />
            </label>
            <label>
              Address (ET)
              <input type="text" value={footer.address.ee} onChange={(event) => updateLocalized('address', 'ee', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Facebook URL
              <input type="text" value={footer.socialLinks.facebook} onChange={(event) => updateSocial('facebook', event.target.value)} />
            </label>
            <label>
              Instagram URL
              <input type="text" value={footer.socialLinks.instagram} onChange={(event) => updateSocial('instagram', event.target.value)} />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              TripAdvisor URL
              <input type="text" value={footer.socialLinks.tripadvisor} onChange={(event) => updateSocial('tripadvisor', event.target.value)} />
            </label>
            <label>
              Airbnb URL
              <input type="text" value={footer.socialLinks.airbnb} onChange={(event) => updateSocial('airbnb', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={isSaving || isPreparingImage}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="story-admin-button story-admin-button--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
    </AdminModalShell>
  );
}

export default HomeFooterEditorModal;
