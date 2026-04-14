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

function FreeBookNow({ showBookNow, setShowBookNow }) {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const [dateObject, setDateObject] = useState(null);

    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.email);
    const { misc_texts } = useSelector(state => state.texts);
    const { dates, isError, message: tourMessage } = useSelector(state => state.tour);

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
            const formattedDate = selectedDate.toDateString();
            const times = dates.filter(d => new Date(d.date).toDateString() === formattedDate).map(d => d.time);
            setAvailableTimes(times);
        } else {
            setAvailableTimes([]);
        }
    }, [selectedDate, dates]);

    useEffect(() => {
        if (numberOfPeople === "More than 7") {
            toast.info("For groups larger than 7 please use the main booking option");
        }
    }, [numberOfPeople]);

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
    
        const formattedDate = date.toDateString();
        const isAvailable = dates.some(d => new Date(d.date).toDateString() === formattedDate);
        return isAvailable;
    };

    const getDateObject = (date, time) => {
        const dateObj = dates.find(d => new Date(d.date).toDateString() === date.toDateString() && d.time === time);
        return dateObj;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) {
            toast.error("Name is required");
            return;
        } else if (!email) {
            toast.error("Email is required");
            return;
        } else if (!email.includes('@')) {
            toast.error("Email is not valid");
            return;
        } else if (!selectedDate) {
            toast.error("Date is required");
            return;
        } else if (!selectedTime) {
            toast.error("Time is required");
            return;
        } else if (!numberOfPeople || numberOfPeople === "More than 7") {
            toast.error("Please select a valid number of people");
            return;
        }
    
        const localDate = selectedDate.toISOString().split('T')[0]; // Use the selected date directly
        const dateObj = getDateObject(selectedDate, selectedTime);
    
        const data = {
            name,
            email,
            date: localDate,
            time: selectedTime,
            people: numberOfPeople,
            dateObject: dateObj
        };
    
        dispatch(sendFreeTourMessage(data));
    
        setSubmitted(true);
        setName('');
        setEmail('');
        setSelectedDate(null);
        setSelectedTime('');
        setNumberOfPeople('');
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

    const nameLabel = misc_texts?.["name"]?.text || 'Name';
    const emailLabel = misc_texts?.["e-mail"]?.text || 'E-mail';
    const sendText = misc_texts?.["send"]?.text || 'Send';
    const cancelText = misc_texts?.["cancel"]?.text || 'Cancel';

    if (!showBookNow) return null;

    if (isLoading) {
        return <Spinner />
    }

    return (
        <div className='book-now-popup'>
            <div className="input-form-card book-card">
                {submitted && <FaCheck size={25} color={"#05AA6C"} className='padding-20-bottom' />}
                <h3 className='cardo'>{submitted ? "Thank you" : "Free Tour Registration"}</h3>
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
                                <label htmlFor="date">Select a Date:</label>
                            </div>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                highlightDates={dates
                                    .map(d => new Date(d.date))
                                    .filter(date => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date > today;
                                    })
                                }
                                filterDate={isDateAvailable}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select a date"
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
                                        <label htmlFor="time">Select a Time:</label>
                                        <select className="basic-select" id="time" name="time" value={selectedTime} onChange={(e) => {
                                            setSelectedTime(e.target.value);
                                            setDateObject(getDateObject(selectedDate, e.target.value));
                                        }}>
                                            <option value="">Select a time</option>
                                            {availableTimes.map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="people">Number of People:</label>
                                        <select className="basic-select" id="people" name="people" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)}>
                                            <option value="">Select number of people</option>
                                            {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                            <option value="More than 7">More than 7</option>
                                        </select>
                                    </div>
                                </>
                            )}
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
                        {!submitted && numberOfPeople !== "More than 7" && (
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
