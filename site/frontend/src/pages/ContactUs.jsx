import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMiscTexts, getFooterTexts, reset } from '../features/texts/textSlice';
import { sendContactMessage } from '../features/email/emailSlice';
import { toast } from 'react-toastify';
import bgcontact from '../img/bgcontact.webp';
import OurTeam from '../components/OurTeam';
import ContactsTeam from '../components/ContactsTeam.jsx';
import ButtonPrimary from '../components/style-components/ButtonPrimary.jsx';
import Spinner from '../components/Spinner';
import { Helmet } from 'react-helmet';

function ContactUs() {
  const dispatch = useDispatch();
  const { misc_texts, footer_texts, isLoading, isError, message } = useSelector((state) => state.texts);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    dispatch(getFooterTexts());
  }, [dispatch]);

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
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessageContent('');
  };

  if (isLoading) {
    return <Spinner />;
  }

  const contactUsText = misc_texts?.["contact-us"]?.text || '';
  const sayHelloText = misc_texts?.["say-hello!"]?.text || '';
  const nameLabel = misc_texts?.["name"]?.text || 'Name';
  const emailLabel = misc_texts?.["e-mail"]?.text || 'E-mail';
  const writeSomethingText = misc_texts?.["write-something"]?.text || 'Write something';
  const sendText = misc_texts?.["send"]?.text || 'Send';
  const addressLine1 = misc_texts?.["address-line-1"]?.text || '';
  const addressLine2 = misc_texts?.["address-line-2"]?.text || '';

  return (
    <div className='story-page'>
      <Helmet>
        <title>Contact Us - Tales of Reval</title>
        <meta name="description" content="Get in touch with Tales of Reval for inquiries about our medieval tours, private tours, team events, and more. Contact us today to book your unique Tallinn experience." />
        <meta name="keywords" content="Contact Tales of Reval, Book a Tour in Tallinn, Inquire About Medieval Tours, Tour Booking Contact, Tallinn Tour Inquiries, Medieval Tour Customer Service, Private Tours in Tallinn, Team Events Tallinn, Unique Tallinn Experiences" />
      </Helmet>
      <div className="story-landing" style={{ background: `url(${bgcontact})` }}>
        <h1>{contactUsText}</h1>
      </div>

      <div className="container">
        <ContactsTeam contactPage={true} />
      </div>

      <div className="contact-us-section">
        <div className="contact-cols">
          <div className="contact-col">
            <div className="input-form-card contact-us">
              <h3 className='cardo'>{sayHelloText}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group padding-20-top">
                  <label htmlFor="name">{nameLabel}*</label>
                  <input
                    name='name'
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{emailLabel}*</label>
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

                <div className="submit">
                  <ButtonPrimary
                    icon="ArrowRight"
                    text={sendText}
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="contact-col">
            <div className="contact-us-info">
              <p className="bold">OÜ Satsang</p>
              <p className='padding-20-top'>Reg no. 14443936</p>
              <p className='padding-20-top'>
                {addressLine1}<br />
                {addressLine2}
              </p>
              <p className='padding-20-top'>EE220020202020202 <br />LHV Pank AS</p>
              <p className='padding-20-top'>
                <a className="underline" href="mailto:info@talesofreval.ee">info@talesofreval.ee</a> <br />
              </p>
              <p className='padding-5-top'>
                <a className="underline" href="tel:+37255555555">+372 5560 4421</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
