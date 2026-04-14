import React, { useEffect } from 'react';
import HomeLanding from '../components/HomeLanding';
import OurServices from '../components/OurServices';
import { useDispatch, useSelector } from 'react-redux';
import OurTeam from '../components/OurTeam';
import Reviews from '../components/Reviews';
import { getHomeTexts, getMiscTexts, reset } from '../features/texts/textSlice';
import { Helmet } from 'react-helmet';
import {
  FALLBACK_HOME_TEXTS,
  FALLBACK_MISC_TEXTS,
  hasTextEntries,
} from '../content/fallbackContent';

function Home() {
  const dispatch = useDispatch();
  const { home_texts, isError, message } = useSelector((state) => state.texts);
  const { misc_texts } = useSelector((state) => state.texts);

  useEffect(() => {
    if (localStorage.getItem('language') === null) {
      localStorage.setItem('language', 'en');
    }

    dispatch(getHomeTexts());
    dispatch(getMiscTexts());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Home texts fallback active:', message);
    }
  }, [isError, message]);

  const resolvedHomeTexts = hasTextEntries(home_texts)
    ? home_texts
    : FALLBACK_HOME_TEXTS;
  const resolvedMiscTexts = hasTextEntries(misc_texts)
    ? misc_texts
    : FALLBACK_MISC_TEXTS;

  return (
    <div className="home-page">
      <Helmet>
        <title>Home - Tales of Reval</title>
        <meta name="description" content="Experience the most authentic medieval tours in Tallinn. Discover unique live experiences and historical adventures with Tales of Reval." />
        <meta name="keywords" content="Medieval Tours in Tallinn, Historical Experiences in Estonia, Interactive Medieval Experiences, Tallinn Guided Tours, Live Medieval Shows, Top Rated Tallinn Tours, Unique Tallinn Experiences, Authentic Tallinn Tours, Best Tallinn Attractions, Tallinn Tour Company" />
      </Helmet>
      <HomeLanding texts={resolvedHomeTexts} />
      <div className="container home-content">
        <OurServices texts={resolvedMiscTexts} compact />
        <OurTeam texts={resolvedMiscTexts} />
        <Reviews misc_texts={resolvedMiscTexts} variant="home" />
      </div>
    </div>
  );
}

export default Home;
