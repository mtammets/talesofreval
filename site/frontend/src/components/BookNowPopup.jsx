import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ButtonPrimary from './style-components/ButtonPrimary';
import ButtonSecondary from './style-components/ButtonSecondary';
import { FaCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../features/email/emailSlice';
import Spinner from './Spinner';
import { getMiscTexts, reset } from '../features/texts/textSlice';

function BookNowPopup({ showBookNow, setShowBookNow }) {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [eventType, setEventType] = useState('');
    const [isHome, setIsHome] = useState(false);

    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.email);
    const { misc_texts } = useSelector(state => state.texts);

    const location = useLocation();

    useEffect(() => {
        dispatch(getMiscTexts());
    }, [dispatch]);

    useEffect(() => {
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setIsHome(true);
        } else {
            setIsHome(false);
            switch (path) {
                case '/service/team':
                    setEventType('Team Events');
                    break;
                case '/service/quick':
                    setEventType('WE ONLY HAVE 30 MINUTES!');
                    break;
                case '/service/destination':
                    setEventType('Destination Management');
                    break;
                case '/service/wedding':
                    setEventType('Fantasy Weddings');
                    break;
                case '/service/private':
                    setEventType('Private Events');
                    break;
                default:
                    setEventType('');
                    break;
            }
        }
    }, [location]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) {
            toast.error("Name is required");
            return;
        } else if (!email) {
            toast.error("Email is required");
            return;
        } else if (!message) {
            toast.error("Message is required");
            return;
        } else if (!email.includes('@')) {
            toast.error("Email is not valid");
            return;
        }

        const data = {
            name,
            email,
            message,
            eventType
        };

        dispatch(sendMessage(data));
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowBookNow(false);
        setSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
    };

    const nameLabel = misc_texts?.["name"]?.text || 'Name';
    const emailLabel = misc_texts?.["e-mail"]?.text || 'E-mail';
    const writeSomethingText = misc_texts?.["write-something"]?.text || 'Write something';
    const sendText = misc_texts?.["send"]?.text || 'Send';
    const cancelText = misc_texts?.["cancel"]?.text || 'Cancel';

    if (!showBookNow) return null;

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className='book-now-popup'>
            <div className="input-form-card book-card">
                {submitted && <FaCheck size={25} color={"#05AA6C"} className='padding-20-bottom' />}
                <h3 className='cardo'>{submitted ? "Thank you" : "Book now"}</h3>
                <form>
                    {!submitted ?
                        <>
                            <div className="form-group padding-20-top">
                                <label htmlFor="name">{nameLabel}*</label>
                                <input name='name' type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{emailLabel}*</label>
                                <input name='email' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">{writeSomethingText}</label>
                                <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                            </div>
                            {isHome &&
                            <div className="form-group">
                                <label htmlFor="email">Service*</label>
                                <select className='basic-input' name='service-type' value={eventType} onChange={(e) => setEventType(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Team events">Team Events</option>
                                    <option value="Private events">Private Events</option>
                                    <option value="WE ONLY HAVE 30 MINUTES!">We only have 30 minutes!</option>
                                    <option value="Destination Management">Destination Management</option>
                                    <option value="Fantasy Weddings">Fantasy Weddings</option>
                                    
                                </select>
                            </div>
                            }
                        </>
                        :
                        <>
                            <h5 className='padding-20-top'>We'll be in touch!</h5>
                        </>
                    }

                    <div className="submit">
                        <div>
                            <ButtonSecondary
                                text={submitted ? "Close" : cancelText}
                                onClick={handleClose}
                            />
                        </div>
                        {!submitted && <div><ButtonPrimary icon="ArrowRight" text={sendText} onClick={handleSubmit} /></div>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookNowPopup;
