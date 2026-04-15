import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMiscTexts, reset } from '../features/texts/textSlice';
import { sendContactMessage } from '../features/email/emailSlice';
import { toast } from 'react-toastify';
import bgcontact from '../img/bgcontact.webp';
import ContactsTeam from '../components/ContactsTeam.jsx';
import ButtonPrimary from '../components/style-components/ButtonPrimary.jsx';
import Spinner from '../components/Spinner';
import { Helmet } from 'react-helmet';
import HomeTeamEditorModal from '../components/HomeTeamEditorModal';
import ContactSectionEditorModal from '../components/ContactSectionEditorModal';
import HeroImageEditorModal from '../components/HeroImageEditorModal';
import PageHero from '../components/PageHero';
import siteSettingsService from '../features/siteSettings/siteSettingsService';
import { setStoredStoryAdminAuth } from '../features/events/storyAdminService';
import { DEFAULT_SITE_SETTINGS, getLocalizedSiteText, resolveSiteImage } from '../content/siteSettingsDefaults';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const buildContactPageFormData = (heading, members, contact, imageFiles = {}, heroImageFile = null) => {
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
  const [contactTeamHeading, setContactTeamHeading] = useState(cloneValue(siteSettings.homeTeam.heading));
  const [contactTeamMembers, setContactTeamMembers] = useState(cloneValue(siteSettings.homeTeam.members));
  const [contactTeamImageFiles, setContactTeamImageFiles] = useState({});
  const [contactForm, setContactForm] = useState(cloneValue(siteSettings.contactPage));
  const [contactHeroImageFile, setContactHeroImageFile] = useState(null);
  const [contactHeroPreviewUrl, setContactHeroPreviewUrl] = useState('');

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
    setContactTeamHeading(cloneValue(siteSettings.homeTeam.heading));
    setContactTeamMembers(cloneValue(siteSettings.homeTeam.members));
    setContactForm(cloneValue(siteSettings.contactPage));
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
      toast.error("Name is required");
      return;
    }
    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!messageContent) {
      toast.error("Message is required");
      return;
    }
    if (!email.includes('@')) {
      toast.error("Email is not valid");
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
        contactHeroImageFile
      );

      const nextSettings = await siteSettingsService.updateContactPageSiteSettings(adminToken, formData);
      setSiteSettings(nextSettings);
      setContactHeroImageFile(null);
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

  const contactUsText = misc_texts?.["contact-us"]?.text || '';
  const sayHelloText = getLocalizedSiteText(siteSettings.contactPage.formTitle, language, misc_texts?.["say-hello!"]?.text || '');
  const nameLabel = getLocalizedSiteText(siteSettings.contactPage.nameLabel, language, 'Name*');
  const emailLabel = getLocalizedSiteText(siteSettings.contactPage.emailLabel, language, 'E-mail*');
  const writeSomethingText = getLocalizedSiteText(siteSettings.contactPage.messageLabel, language, 'Write something');
  const sendText = getLocalizedSiteText(siteSettings.contactPage.submitLabel, language, 'Send');
  const addressText = getLocalizedSiteText(siteSettings.contactPage.address, language, '');
  const contactHeroBackground =
    contactHeroPreviewUrl ||
    resolveSiteImage(siteSettings.contactPage.image, siteSettings.contactPage.imageKey) ||
    bgcontact;

  return (
    <div className='story-page'>
      <Helmet>
        <title>Contact Us - Tales of Reval</title>
        <meta name="description" content="Get in touch with Tales of Reval for inquiries about our medieval tours, private tours, team events, and more. Contact us today to book your unique Tallinn experience." />
        <meta name="keywords" content="Contact Tales of Reval, Book a Tour in Tallinn, Inquire About Medieval Tours, Tour Booking Contact, Tallinn Tour Inquiries, Medieval Tour Customer Service, Private Tours in Tallinn, Team Events Tallinn, Unique Tallinn Experiences" />
      </Helmet>
      <PageHero
        mediaClassName="story-landing"
        backgroundImage={contactHeroBackground}
        isEditable={Boolean(adminToken) && isEditMode}
        onEditBackground={() => setIsHeroEditorOpen(true)}
      >
        <h1>{contactUsText}</h1>
      </PageHero>

      <div className="container contact-page-team">
        <ContactsTeam
          contactPage={true}
          heading={siteSettings.homeTeam.heading}
          items={siteSettings.homeTeam.members}
          language={language}
          adminAction={
            adminToken && isEditMode ? (
              <button type="button" className="section-edit-button" onClick={() => setIsTeamEditorOpen(true)}>
                Edit
              </button>
            ) : null
          }
        />
      </div>

      <div className="contact-us-section">
        <div className="container">
          <div className="contact-section-admin-row">
            {adminToken && isEditMode ? (
              <button type="button" className="section-edit-button" onClick={() => setIsContactEditorOpen(true)}>
                Edit
              </button>
            ) : null}
          </div>
          <div className="contact-cols">
            <div className="contact-col contact-col-form">
              <div className="input-form-card contact-us">
                <h3 className='cardo'>{sayHelloText}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group padding-20-top">
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
                    <ButtonPrimary
                      icon="ArrowRight"
                      text={sendText}
                    />
                  </div>
                </form>
              </div>
            </div>
            <div className="contact-col contact-col-info">
              <div className="contact-us-info">
                <p className="bold">{siteSettings.contactPage.companyName}</p>
                <p className='padding-20-top'>{siteSettings.contactPage.companyReg}</p>
                <p className='padding-20-top contact-address'>{addressText}</p>
                <p className='padding-20-top'>
                  {siteSettings.contactPage.bankLine1} <br />{siteSettings.contactPage.bankLine2}
                </p>
                <p className='padding-20-top'>
                  <a className="underline" href={`mailto:${siteSettings.contactPage.email}`}>{siteSettings.contactPage.email}</a> <br />
                </p>
                <p className='padding-5-top'>
                  <a className="underline" href={`tel:${siteSettings.contactPage.phone}`}>{siteSettings.contactPage.phone}</a>
                </p>
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
            setContactTeamHeading(cloneValue(siteSettings.homeTeam.heading));
            setContactTeamMembers(cloneValue(siteSettings.homeTeam.members));
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
          description="Upload a new background image for the contact page."
          currentImage={siteSettings.contactPage.image}
          currentImageUrl={resolveSiteImage(siteSettings.contactPage.image, siteSettings.contactPage.imageKey)}
          selectedFile={contactHeroImageFile}
          setSelectedFile={setContactHeroImageFile}
          previewUrl={contactHeroPreviewUrl}
          onSave={saveContactHero}
          onCancel={() => {
            setIsHeroEditorOpen(false);
            setContactHeroImageFile(null);
          }}
          isSaving={isSavingHero}
        />
      ) : null}
    </div>
  );
}

export default ContactUs;
