import React, { useEffect } from 'react';
import storybg from '../img/storybg.webp';
import OurServices from '../components/OurServices';
import StoryYear from '../components/StoryYear.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents, reset } from '../features/events/eventSlice';
import Spinner from '../components/Spinner';
import { getMiscTexts } from '../features/texts/textSlice.js';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

function StoryPage() {

    const dispatch = useDispatch();

    const { events, isLoading, isError, message } = useSelector(
        (state) => state.events
    );

    const { misc_texts } = useSelector(
        (state) => state.texts
    );

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
        dispatch(getEvents());
    }, [dispatch]);

    if (isLoading || !events || events.length === 0) {
        return <Spinner />
    }

    const ourStoryText = misc_texts && misc_texts["our-story"] ? misc_texts["our-story"].text : null;

    return (
        <div className='story-page'>
            <Helmet>
                <title>Our Story - Tales of Reval</title>
                <meta name="description" content="Explore the journey of Tales of Reval, from its inception to the present day, through immersive storytelling experiences and medieval themed events." />
                <meta name="keywords" content="Medieval Themed Events, Tallinn Team Building Events, Private Medieval Events, Unique Event Hosting Tallinn, Corporate Events in Tallinn, Team Building Activities Tallinn, Special Events Tallinn, Medieval Feasts and Events, Customized Medieval Events, Tallinn Event Management" />
            </Helmet>
            <div className="story-landing" style={{ background: `url(${storybg})` }}>
                <h1>{ourStoryText}</h1>
            </div>

            <div className="container">
                <div className="tagline padding-40-top padding-40-bottom">
                    {/* <h4 className="cardo">{introText}</h4> */}
                </div>

                {events.filter(event => event.year === 2018).length > 0 && <StoryYear events={events.filter(event => event.year === 2018)} />}
                {events.filter(event => event.year === 2019).length > 0 && <StoryYear events={events.filter(event => event.year === 2019)} />}
                {events.filter(event => event.year === 2020).length > 0 && <StoryYear events={events.filter(event => event.year === 2020)} />}
                {events.filter(event => event.year === 2021).length > 0 && <StoryYear events={events.filter(event => event.year === 2021)} />}
                {events.filter(event => event.year === 2022).length > 0 && <StoryYear events={events.filter(event => event.year === 2022)} />}
                {events.filter(event => event.year === 2023).length > 0 && <StoryYear events={events.filter(event => event.year === 2023)} />}
                {events.filter(event => event.year === 2024).length > 0 && <StoryYear events={events.filter(event => event.year === 2024)} />}
            </div>

            <div className="container">
                <OurServices texts={misc_texts} />
            </div>
        </div>
    );
}

export default StoryPage;
