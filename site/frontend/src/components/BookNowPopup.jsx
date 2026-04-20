import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../features/email/emailSlice';
import Spinner from './Spinner';
import { getMiscTexts, reset } from '../features/texts/textSlice';
import { ArrowRight } from '../icons/ArrowRight.tsx';

function BookNowPopup({ showBookNow, setShowBookNow }) {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [eventType, setEventType] = useState('');

    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.email);
    const { misc_texts } = useSelector(state => state.texts);

    const location = useLocation();

    const resetFormState = () => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
    };

    useEffect(() => {
        dispatch(getMiscTexts());
    }, [dispatch]);

    useEffect(() => {
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    useEffect(() => {
        switch (location.pathname) {
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
    }, [location.pathname]);

    useEffect(() => {
        if (!showBookNow) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowBookNow(false);
                resetFormState();
            }
        };

        document.body.classList.add('book-now-modal-open');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.classList.remove('book-now-modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showBookNow, setShowBookNow]);

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

    const handleClose = () => {
        setShowBookNow(false);
        resetFormState();
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
        <div className='book-now-popup' onClick={handleClose}>
            <div
                className={`book-now-dialog${submitted ? ' book-now-dialog--submitted' : ''}`}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="book-now-dialog-title"
            >
                <div className={`book-now-dialog__body${submitted ? ' book-now-dialog__body--submitted' : ''}`}>
                {submitted ? (
                    <div className="book-now-confirmation-icon" aria-hidden="true">
                        <FaCheck size={34} color={"#54b788"} />
                    </div>
                ) : null}
                <h3 className={`book-now-dialog__title cardo${submitted ? ' book-now-dialog__title--submitted' : ''}`} id="book-now-dialog-title">
                    {submitted ? "Thank you!" : "Book now"}
                </h3>
                <form className={`book-now-form${submitted ? ' book-now-form--submitted' : ''}`} onSubmit={handleSubmit}>
                    {!submitted ?
                        <>
                            <div className="book-now-field">
                                <label htmlFor="name">{nameLabel}*</label>
                                <input id="name" name='name' type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="book-now-field">
                                <label htmlFor="email">{emailLabel}*</label>
                                <input id="email" name='email' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="book-now-field">
                                <label htmlFor="message">{writeSomethingText}</label>
                                <textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                            </div>
                        </>
                        :
                        <>
                            <p className='book-now-confirmation-copy'>We'll be in touch :)</p>
                        </>
                    }

                    <div className={`book-now-actions${submitted ? ' book-now-actions--submitted' : ''}`}>
                        <button
                            type="button"
                            className={`book-now-action ${submitted ? 'book-now-action--close' : 'book-now-action--cancel'}`}
                            onClick={handleClose}
                        >
                            {submitted ? "Close" : cancelText}
                        </button>
                        {!submitted && (
                            <button type="submit" className="book-now-action book-now-action--submit">
                                <span>{sendText}</span>
                                <span className="book-now-action__icon" aria-hidden="true">
                                    <ArrowRight size="1.15rem" />
                                </span>
                            </button>
                        )}
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}

export default BookNowPopup;
