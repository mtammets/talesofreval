import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMiscTexts, reset } from '../features/texts/textSlice';
import { sendContactMessage } from '../features/email/emailSlice';
import { toast } from 'react-toastify';
import bgcontact from '../img/bgcontact.webp';
import ContactsTeam from '../components/ContactsTeam.jsx';
import Spinner from '../components/Spinner';
import { Helmet } from 'react-helmet';
import HomeTeamEditorModal from '../components/HomeTeamEditorModal';
import ContactSectionEditorModal from '../components/ContactSectionEditorModal';
import HeroImageEditorModal from '../components/HeroImageEditorModal';
import PageHero from '../components/PageHero';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import { getFallbackText } from '../content/fallbackContent';
import {
  DEFAULT_SITE_SETTINGS,
  HERO_MEDIA_SIZES,
  createPreviewMediaAsset,
  getLocalizedSiteText,
  resolveSiteImage,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';
import { ArrowRight } from '../icons/ArrowRight.tsx';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
} from '../utils/prepareImageFilesForUpload';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const buildContactPageFormData = (
  heading,
  members,
  contact,
  imageFiles = {},
  heroImageFile = null,
  heroImage = undefined
) => {
  const formData = new FormData();

  formData.append('teamHeading', JSON.stringify(heading));
  formData.append('teamMembers', JSON.stringify(members));
  formData.append('formTitle', JSON.stringify(contact.formTitle));
  formData.append('nameLabel', JSON.stringify(contact.nameLabel));
  formData.append('emailLabel', JSON.stringify(contact.emailLabel));
  formData.append('messageLabel', JSON.stringify(contact.messageLabel));
  formData.append('submitLabel', JSON.stringify(contact.submitLabel));
  formData.append('address', JSON.stringify(contact.address));
  formData.append('companyName', contact.companyName || '');
  formData.append('companyReg', contact.companyReg || '');
  formData.append('bankLine1', contact.bankLine1 || '');
  formData.append('bankLine2', contact.bankLine2 || '');
  formData.append('email', contact.email || '');
  formData.append('phone', contact.phone || '');

  Object.entries(imageFiles).forEach(([index, file]) => {
    if (file) {
      formData.append(`contactTeamImage_${index}`, file);
    }
  });

  if (heroImageFile) {
    formData.append('contactHeroImage', heroImageFile);
  }

  if (heroImage !== undefined) {
    formData.append('image', JSON.stringify(heroImage));
  }

  return formData;
};

function ContactUs({
  adminToken,
  setAdminToken,
  siteSettings = DEFAULT_SITE_SETTINGS,
  setSiteSettings,
  isEditMode = false,
}) {
  const dispatch = useDispatch();
  const language = localStorage.getItem('language') || 'en';
  const { misc_texts, isLoading, isError, message } = useSelector((state) => state.texts);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  const [isContactEditorOpen, setIsContactEditorOpen] = useState(false);
  const [isHeroEditorOpen, setIsHeroEditorOpen] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [contactTeamHeading, setContactTeamHeading] = useState(cloneValue(siteSettings.contactPage.teamHeading));
  const [contactTeamMembers, setContactTeamMembers] = useState(cloneValue(siteSettings.contactPage.teamMembers));
  const [contactTeamImageFiles, setContactTeamImageFiles] = useState({});
  const [contactForm, setContactForm] = useState(cloneValue(siteSettings.contactPage));
  const [contactHeroImageFile, setContactHeroImageFile] = useState(null);
  const [contactHeroPreviewUrl, setContactHeroPreviewUrl] = useState('');
  const [contactHeroDraftImage, setContactHeroDraftImage] = useState(
    cloneValue(siteSettings.contactPage.image || null)
  );
  const [isPreparingHeroImage, setIsPreparingHeroImage] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  useEffect(() => {
    dispatch(getMiscTexts());
  }, [dispatch]);

  useEffect(() => {
    setContactTeamHeading(cloneValue(siteSettings.contactPage.teamHeading));
    setContactTeamMembers(cloneValue(siteSettings.contactPage.teamMembers));
    setContactForm(cloneValue(siteSettings.contactPage));
    setContactHeroDraftImage(cloneValue(siteSettings.contactPage.image || null));
  }, [siteSettings]);

  useEffect(() => {
    if (!contactHeroImageFile) {
      setContactHeroPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(contactHeroImageFile);
    setContactHeroPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [contactHeroImageFile]);

  const handleAdminAuthError = (error, fallbackMessage) => {
    if (error?.response?.status === 401) {
      setStoredStoryAdminAuth('');
      setAdminToken('');
      toast.error('Admin session expired. Please log in again.');
      return;
    }

    toast.error(error?.response?.data?.message || error?.message || fallbackMessage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      toast.error(getFallbackText('misc', 'name-is-required', language, 'Name is required.'));
      return;
    }
    if (!email) {
      toast.error(getFallbackText('misc', 'email-is-required', language, 'Email is required.'));
      return;
    }
    if (!messageContent) {
      toast.error(getFallbackText('misc', 'message-is-required', language, 'Message is required.'));
      return;
    }
    if (!email.includes('@')) {
      toast.error(getFallbackText('misc', 'email-is-not-valid', language, 'Email is not valid.'));
      return;
    }

    const data = { name, email, message: messageContent };

    dispatch(sendContactMessage(data));
    setName('');
    setEmail('');
    setMessageContent('');
  };

  const saveContactTeam = async (event) => {
    event.preventDefault();
    setIsSavingTeam(true);

    try {
      const formData = buildContactPageFormData(
        contactTeamHeading,
        contactTeamMembers,
        contactForm,
        contactTeamImageFiles
      );

      const nextSettings = await siteSettingsService.updateContactPageSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setContactTeamImageFiles({});
      setIsTeamEditorOpen(false);
      toast.success('Team updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Contact team update failed.');
    } finally {
      setIsSavingTeam(false);
    }
  };

  const saveContactSection = async (event) => {
    event.preventDefault();
    setIsSavingContact(true);

    try {
      const formData = buildContactPageFormData(contactTeamHeading, contactTeamMembers, contactForm);

      const nextSettings = await siteSettingsService.updateContactPageSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setIsContactEditorOpen(false);
      toast.success('Contact section updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Contact section update failed.');
    } finally {
      setIsSavingContact(false);
    }
  };

  const saveContactHero = async (event) => {
    event.preventDefault();
    setIsSavingHero(true);

    try {
      const formData = buildContactPageFormData(
        contactTeamHeading,
        contactTeamMembers,
        contactForm,
        {},
        contactHeroImageFile,
        contactHeroDraftImage
      );

      const nextSettings = await siteSettingsService.updateContactPageSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setContactHeroImageFile(null);
      setContactHeroDraftImage(cloneValue(nextSettings.contactPage.image || null));
      setIsHeroEditorOpen(false);
      toast.success('Contact background updated.');
    } catch (error) {
      handleAdminAuthError(error, 'Contact background update failed.');
    } finally {
      setIsSavingHero(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  const contactUsText =
    misc_texts?.["contact-us"]?.text ||
    getFallbackText('misc', 'contact-us', language, 'Contact us');
  const sayHelloText = getLocalizedSiteText(
    siteSettings.contactPage.formTitle,
    language,
    misc_texts?.["say-hello!"]?.text ||
      getFallbackText('misc', 'say-hello!', language, 'Say hello!')
  );
  const nameLabel = getLocalizedSiteText(
    siteSettings.contactPage.nameLabel,
    language,
    `${getFallbackText('misc', 'name', language, 'Name')}*`
  );
  const emailLabel = getLocalizedSiteText(
    siteSettings.contactPage.emailLabel,
    language,
    `${getFallbackText('misc', 'e-mail', language, 'E-mail')}*`
  );
  const writeSomethingText = getLocalizedSiteText(
    siteSettings.contactPage.messageLabel,
    language,
    getFallbackText('misc', 'write-something', language, 'Write something')
  );
  const sendText = getLocalizedSiteText(
    siteSettings.contactPage.submitLabel,
    language,
    getFallbackText('misc', 'send', language, 'Send')
  );
  const addressText = getLocalizedSiteText(siteSettings.contactPage.address, language, '');
  const contactMetaDescription =
    language === 'ee'
      ? 'Võta Tales of Revaliga ühendust, et küsida meie keskaegsete tuuride, privaatsete elamuste ja tiimiürituste kohta Tallinnas.'
      : 'Get in touch with Tales of Reval for inquiries about our medieval tours, private tours, team events, and more. Contact us today to book your unique Tallinn experience.';
  const editText = language === 'ee' ? 'Muuda' : 'Edit';
  const contactHeroMedia =
    (contactHeroPreviewUrl
      ? createPreviewMediaAsset(
          contactHeroPreviewUrl,
          HERO_MEDIA_SIZES,
          contactHeroDraftImage
        )
      : null) ||
    resolveSiteImageMedia(
      siteSettings.contactPage.image,
      siteSettings.contactPage.imageKey,
      HERO_MEDIA_SIZES
    ) ||
    createPreviewMediaAsset(bgcontact, HERO_MEDIA_SIZES);

  const handleContactHeroFileSelected = async (file) => {
    if (!file) {
      setContactHeroImageFile(null);
      return;
    }

    setIsPreparingHeroImage(true);

    try {
      const preparedFile = await prepareImageFileForUpload(
        file,
        HERO_IMAGE_PREPARATION_OPTIONS
      );
      setContactHeroImageFile(preparedFile);
      setContactHeroDraftImage({
        name: preparedFile.name,
        focusX: 50,
        focusY: 50,
        zoom: 1,
      });
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingHeroImage(false);
    }
  };

  return (
    <div className='story-page contact-page'>
      <Helmet>
        <title>{contactUsText} - Tales of Reval</title>
        <meta name="description" content={contactMetaDescription} />
        <meta name="keywords" content="Contact Tales of Reval, Book a Tour in Tallinn, Inquire About Medieval Tours, Tour Booking Contact, Tallinn Tour Inquiries, Medieval Tour Customer Service, Private Tours in Tallinn, Team Events Tallinn, Unique Tallinn Experiences" />
      </Helmet>
      <PageHero
        className="contact-page-hero"
        mediaClassName="story-landing"
        backgroundMedia={contactHeroMedia}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      >
        <h1>{contactUsText}</h1>
      </PageHero>

      <div className="container contact-page-team">
        <ContactsTeam
          contactPage={true}
          heading={siteSettings.contactPage.teamHeading}
          items={siteSettings.contactPage.teamMembers}
          language={language}
          adminAction={
            adminToken && isEditMode ? (
              <button type="button" className="section-edit-button" onClick={() => setIsTeamEditorOpen(true)}>
                {editText}
              </button>
            ) : null
          }
        />
      </div>

      <div className="contact-us-section">
        <div className="container">
          {adminToken && isEditMode ? (
            <div className="contact-section-admin-row">
              <button type="button" className="section-edit-button" onClick={() => setIsContactEditorOpen(true)}>
                {editText}
              </button>
            </div>
          ) : null}
          <div className="contact-cols">
            <div className="contact-col contact-col-form">
              <div className="input-form-card contact-us">
                <h3 className='cardo'>{sayHelloText}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">{nameLabel}</label>
                    <input
                      name='name'
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{emailLabel}</label>
                    <input
                      name='email'
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">{writeSomethingText}</label>
                    <textarea
                      name="message"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="submit contact-submit">
                    <button type="submit" className="button-primary contact-submit-button">
                      <span className="button-text">{sendText}</span>
                      <span className="icon-span-right">
                        <ArrowRight />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="contact-col contact-col-info">
              <div className="contact-us-info">
                <div className="contact-us-info-group">
                  <p className="bold">{siteSettings.contactPage.companyName}</p>
                  <span className="contact-us-info-spacer" aria-hidden="true" />
                  <p>{siteSettings.contactPage.companyReg}</p>
                  <span className="contact-us-info-spacer" aria-hidden="true" />
                  <p className="contact-address">{addressText}</p>
                </div>
                <div className="contact-us-info-group">
                  <p>{siteSettings.contactPage.bankLine1}</p>
                  <p>{siteSettings.contactPage.bankLine2}</p>
                </div>
                <div className="contact-us-info-group contact-us-info-links">
                  <a href={`mailto:${siteSettings.contactPage.email}`}>{siteSettings.contactPage.email}</a>
                  <a href={`tel:${siteSettings.contactPage.phone}`}>{siteSettings.contactPage.phone}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {adminToken && isTeamEditorOpen ? (
        <HomeTeamEditorModal
          heading={{ value: contactTeamHeading, set: setContactTeamHeading }}
          members={{ value: contactTeamMembers, set: setContactTeamMembers }}
          imageFiles={contactTeamImageFiles}
          setImageFiles={setContactTeamImageFiles}
          onSave={saveContactTeam}
          onCancel={() => {
            setIsTeamEditorOpen(false);
            setContactTeamImageFiles({});
            setContactTeamHeading(cloneValue(siteSettings.contactPage.teamHeading));
            setContactTeamMembers(cloneValue(siteSettings.contactPage.teamMembers));
          }}
          isSaving={isSavingTeam}
          modalTitle="Edit team"
          modalDescription="Update the shared team cards used across the site."
        />
      ) : null}

      {adminToken && isContactEditorOpen ? (
        <ContactSectionEditorModal
          contact={contactForm}
          setContact={setContactForm}
          onSave={saveContactSection}
          onCancel={() => {
            setIsContactEditorOpen(false);
            setContactForm(cloneValue(siteSettings.contactPage));
          }}
          isSaving={isSavingContact}
        />
      ) : null}

      {adminToken && isHeroEditorOpen ? (
        <HeroImageEditorModal
          title="Change background image"
          description={null}
          currentImage={siteSettings.contactPage.image}
          currentImageUrl={resolveSiteImage(siteSettings.contactPage.image, siteSettings.contactPage.imageKey)}
          draftImage={contactHeroDraftImage}
          onChangeImage={setContactHeroDraftImage}
          selectedFile={contactHeroImageFile}
          onSelectFile={handleContactHeroFileSelected}
          previewUrl={contactHeroPreviewUrl}
          onSave={saveContactHero}
          onCancel={() => {
            setIsHeroEditorOpen(false);
            setContactHeroImageFile(null);
            setContactHeroDraftImage(cloneValue(siteSettings.contactPage.image || null));
          }}
          isSaving={isSavingHero}
          isPreparingImage={isPreparingHeroImage}
        />
      ) : null}
    </div>
  );
}

export default ContactUs;
