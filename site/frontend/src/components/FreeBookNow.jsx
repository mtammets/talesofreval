import { useState, useEffect } from 'react';
import ButtonPrimary from './style-components/ButtonPrimary';
import ButtonSecondary from './style-components/ButtonSecondary';
import { FaCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { sendFreeTourMessage } from '../features/email/emailSlice';
import Spinner from './Spinner';
import { getMiscTexts, reset as resetTexts } from '../features/texts/textSlice';
import { getDates, reset as resetDates } from '../features/tour/tourSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFallbackText } from '../content/fallbackContent';
import { parseFreeTourDate, toFreeTourDateKey } from '../utils/freeTourSchedule';

function FreeBookNow({ showBookNow, setShowBookNow }) {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.email);
    const { misc_texts } = useSelector(state => state.texts);
    const { dates, isError, message: tourMessage } = useSelector(state => state.tour);
    const language = localStorage.getItem('language') || 'en';

    useEffect(() => {
        return () => {
            dispatch(resetTexts());
            dispatch(resetDates());
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(getMiscTexts());
        dispatch(getDates());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(tourMessage);
        }
    }, [dates, isError, tourMessage]);

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = toFreeTourDateKey(selectedDate);
            const times = dates.filter(d => d.date === formattedDate).map(d => d.time);
            setAvailableTimes(times);
        } else {
            setAvailableTimes([]);
        }
    }, [selectedDate, dates]);

    useEffect(() => {
        if (numberOfPeople === getFallbackText('misc', 'more-than-7', language, 'More than 7')) {
            toast.info(
              getFallbackText(
                'misc',
                'for-groups-larger-than-7-please-use-the-main-booking-option',
                language,
                'For groups larger than 7 please use the main booking option.'
              )
            );
        }
    }, [language, numberOfPeople]);

    const isDateAvailable = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison
    
        if (date <= today) {
            if (date.getTime() === today.getTime()) {
                // Get the current time in the Estonian time zone
                const estonianTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Tallinn" });
                const estonianDate = new Date(estonianTime);
                const currentHourInEstonia = estonianDate.getHours();
    
                if (currentHourInEstonia >= 15) {
                    return false;
                }
            }
            return false;
        }
    
        const formattedDate = toFreeTourDateKey(date);
        const isAvailable = dates.some(d => d.date === formattedDate);
        return isAvailable;
    };

    const getDateObject = (date, time) => {
        const dateObj = dates.find(d => d.date === toFreeTourDateKey(date) && d.time === time);
        return dateObj;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            toast.error(getFallbackText('misc', 'name-is-required', language, 'Name is required.'));
            return;
        } else if (!email) {
            toast.error(getFallbackText('misc', 'email-is-required', language, 'Email is required.'));
            return;
        } else if (!email.includes('@')) {
            toast.error(getFallbackText('misc', 'email-is-not-valid', language, 'Email is not valid.'));
            return;
        } else if (!selectedDate) {
            toast.error(getFallbackText('misc', 'date-is-required', language, 'Date is required.'));
            return;
        } else if (!selectedTime) {
            toast.error(getFallbackText('misc', 'time-is-required', language, 'Time is required.'));
            return;
        } else if (!numberOfPeople || numberOfPeople === getFallbackText('misc', 'more-than-7', language, 'More than 7')) {
            toast.error(
              getFallbackText(
                'misc',
                'please-select-a-valid-number-of-people',
                language,
                'Please select a valid number of people.'
              )
            );
            return;
        }
    
        const localDate = toFreeTourDateKey(selectedDate);
        const dateObj = getDateObject(selectedDate, selectedTime);
    
        const data = {
            name,
            email,
            date: localDate,
            time: selectedTime,
            people: numberOfPeople,
            dateObject: dateObj
        };

        try {
            await dispatch(sendFreeTourMessage(data)).unwrap();
            setSubmitted(true);
            setName('');
            setEmail('');
            setSelectedDate(null);
            setSelectedTime('');
            setNumberOfPeople('');
        } catch (_error) {
            // Toasts are handled by the email slice.
        }
    }

    const handleClose = (e) => {
        e.preventDefault();
        setShowBookNow(false);
        setSubmitted(false);
        setName('');
        setEmail('');
        setSelectedDate(null);
        setSelectedTime('');
        setNumberOfPeople('');
    }

    const nameLabel = misc_texts?.["name"]?.text || getFallbackText('misc', 'name', language, 'Name');
    const emailLabel = misc_texts?.["e-mail"]?.text || getFallbackText('misc', 'e-mail', language, 'E-mail');
    const sendText = misc_texts?.["send"]?.text || getFallbackText('misc', 'send', language, 'Send');
    const cancelText =
      misc_texts?.["cancel"]?.text || getFallbackText('misc', 'cancel', language, 'Cancel');
    const thankYouText =
      misc_texts?.["thank-you"]?.text || getFallbackText('misc', 'thank-you', language, 'Thank you!');
    const closeText =
      misc_texts?.["close"]?.text || getFallbackText('misc', 'close', language, 'Close');
    const followUpText =
      misc_texts?.["well-be-in-touch"]?.text ||
      getFallbackText('misc', 'well-be-in-touch', language, "We'll be in touch soon!");
    const freeTourRegistrationText =
      misc_texts?.["free-tour-registration"]?.text ||
      getFallbackText('misc', 'free-tour-registration', language, 'Free Tour Registration');
    const selectDateText =
      misc_texts?.["select-a-date"]?.text ||
      getFallbackText('misc', 'select-a-date', language, 'Select a date:');
    const selectDatePlaceholder =
      misc_texts?.["select-a-date-placeholder"]?.text ||
      getFallbackText('misc', 'select-a-date-placeholder', language, 'Select a date');
    const selectTimeText =
      misc_texts?.["select-a-time"]?.text ||
      getFallbackText('misc', 'select-a-time', language, 'Select a time:');
    const selectTimePlaceholder =
      misc_texts?.["select-a-time-placeholder"]?.text ||
      getFallbackText('misc', 'select-a-time-placeholder', language, 'Select a time');
    const numberOfPeopleText =
      misc_texts?.["number-of-people"]?.text ||
      getFallbackText('misc', 'number-of-people', language, 'Number of people:');
    const selectNumberOfPeopleText =
      misc_texts?.["select-number-of-people"]?.text ||
      getFallbackText('misc', 'select-number-of-people', language, 'Select number of people');
    const moreThanSevenText =
      misc_texts?.["more-than-7"]?.text ||
      getFallbackText('misc', 'more-than-7', language, 'More than 7');

    if (!showBookNow) return null;

    if (isLoading) {
        return <Spinner />
    }

    return (
        <div className='book-now-popup'>
            <div className="input-form-card book-card">
                {submitted && <FaCheck size={25} color={"#05AA6C"} className='padding-20-bottom' />}
                <h3 className='cardo'>{submitted ? thankYouText : freeTourRegistrationText}</h3>
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
                            <div className="">
                                <label htmlFor="date">{selectDateText}</label>
                            </div>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                highlightDates={dates
                                    .map(d => parseFreeTourDate(d.date))
                                    .filter(Boolean)
                                    .filter(date => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date > today;
                                    })
                                }
                                filterDate={isDateAvailable}
                                dateFormat="yyyy-MM-dd"
                                placeholderText={selectDatePlaceholder}
                                popperPlacement="auto"
                                popperModifiers={{
                                    preventOverflow: {
                                        enabled: true,
                                        escapeWithReference: false,
                                        boundariesElement: 'viewport'
                                    }
                                }}
                            />
                            {selectedDate && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="time">{selectTimeText}</label>
                                        <select className="basic-select" id="time" name="time" value={selectedTime} onChange={(e) => {
                                            setSelectedTime(e.target.value);
                                        }}>
                                            <option value="">{selectTimePlaceholder}</option>
                                            {availableTimes.map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="people">{numberOfPeopleText}</label>
                                        <select className="basic-select" id="people" name="people" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)}>
                                            <option value="">{selectNumberOfPeopleText}</option>
                                            {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                            <option value={moreThanSevenText}>{moreThanSevenText}</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </>
                    :   
                        <>
                            <h5 className='padding-20-top'>{followUpText}</h5>
                        </>
                    }
                    <div className="submit">
                        <div>
                            <ButtonSecondary 
                                text={submitted ? closeText : cancelText}
                                onClick={handleClose}
                            />  
                        </div>
                        {!submitted && numberOfPeople !== moreThanSevenText && (
                            <div>
                                <ButtonPrimary icon="ArrowRight" text={sendText} onClick={handleSubmit} />
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FreeBookNow;
