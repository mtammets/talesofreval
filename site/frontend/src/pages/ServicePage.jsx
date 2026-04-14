import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { getService, reset } from '../features/services/serviceSlice';
import { getHomeTexts, getMiscTexts } from '../features/texts/textSlice';
import { FaArrowDown } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ServicePageCards from '../components/ServicePageCards';
import BookNow from '../components/style-components/BookNow';
import OurServices from '../components/OurServices';
import { toast } from 'react-toastify';
import dmc_file from '../img/dmc_file.pdf';

function ServicePage({ setShowBookNow }) {
  const dispatch = useDispatch();
  const { serviceType } = useParams();

  const { service, isLoading, isError, message } = useSelector(
    (state) => state.services
  );

  const { misc_texts, home_texts } = useSelector((state) => state.texts);

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
    dispatch(getHomeTexts());
    dispatch(getService(serviceType));
  }, [dispatch, serviceType]);

  if (isLoading || !service) {
    return <Spinner />;
  }

  const title = service?.title || '';
  const intro = service?.intro || '';
  const background_image = service?.background_image?.src || '';
  const review = service?.review || '';
  const review_author = service?.review_author || '';

  const haveALookText =
    misc_texts && misc_texts["have-a-look-at-what's-possible!"]
      ? misc_texts["have-a-look-at-what's-possible!"].text
      : '';
  const destinationManagementDescriptionText =
    misc_texts &&
    misc_texts[
      'destination-management-service-description-includes-in-the-following-pdf...'
    ]
      ? misc_texts[
          'destination-management-service-description-includes-in-the-following-pdf...'
        ].text
      : '';
  const downloadPdfText =
    misc_texts && misc_texts['download-pdf']
      ? misc_texts['download-pdf'].text
      : '';

  const seoData = {
    'team': {
      title: 'Team Service - Tales of Reval',
      description: 'Team building events in Tallinn with Tales of Reval. Enhance teamwork with our interactive and motivational medieval themed events.',
      keywords: 'Team Building Events Tallinn, Corporate Team Events, Interactive Team Building, Medieval Team Experiences, Custom Team Events, Team Activities Tallinn, Corporate Retreats Tallinn, Team Bonding Experiences, Unique Team Building, Team Building Service Tallinn'
    },
    'private': {
      title: 'Private Service - Tales of Reval',
      description: 'Private medieval tours in Tallinn with Tales of Reval. Enjoy exclusive and immersive historical experiences tailored just for you.',
      keywords: 'Private Tours Tallinn, Custom Medieval Tours, Exclusive Tallinn Tours, Private Medieval Experiences, Tailored Tallinn Tours, VIP Tour Service, Private Tour Booking, Personalized Tour Guide, Custom Private Events, Private Tour Company'
    },
    'destination': {
      title: 'Destination Management Service - Tales of Reval',
      description: 'Comprehensive destination management services in Tallinn by Tales of Reval. Organize group travels, tours, and events with ease.',
      keywords: 'Destination Management Tallinn, Group Travel Estonia, Customized Group Tours, Estonia Destination Services, Group Tours Tallinn, Comprehensive Tour Management, Event Planning Estonia, Group Adventure Planning, Full-Service Destination Management, Tallinn Group Activities'
    },
    'wedding': {
      title: 'Wedding Service - Tales of Reval',
      description: 'Experience a fairytale wedding in Tallinn with Tales of Reval. We offer unique medieval themed wedding planning and hosting services.',
      keywords: 'Medieval Wedding Planner, Tallinn Wedding Services, Unique Wedding Events, Historical Wedding Venues, Wedding Coordination Tallinn, Custom Wedding Planning, Medieval Themed Weddings, Tallinn Wedding Organizer, Authentic Wedding Experiences, Personalized Wedding Services'
    },
    'quick': {
      title: 'Quick Service - Tales of Reval',
      description: 'Quick and immersive tours in Tallinn by Tales of Reval. Perfect for those with limited time who want to experience the medieval charm.',
      keywords: 'Quick Tallinn Tours, Short Guided Tours, Express Medieval Tours, Quick Historical Tours, 30-Minute Tallinn Tours, Fast Tour Service, Short Medieval Experiences, Quick Visit Tallinn, Express Tour Booking, Short Tour Experiences'
    }
  };

  const { title: seoTitle, description: seoDescription, keywords: seoKeywords } = seoData[serviceType] || {};

  return (
    <div className="service-page">
      <Helmet>
        <title>{seoTitle || title} - Tales of Reval</title>
        <meta name="description" content={seoDescription || intro} />
        <meta name="keywords" content={seoKeywords || 'Tours in tallinn, Free tours in Tallinn, Private tours in Tallinn, Best tour in Tallinn'} />
      </Helmet>
      <div
        className="service-landing"
        style={{ background: `url(${background_image})` }}
      >
        <h1>{title}</h1>
      </div>

      <div className="container">
        <div className="tagline padding-40-top padding-40-bottom">
          <h4 className="cardo">{intro}</h4>
        </div>
        <ServicePageCards activeService={service} />
      </div>

      {review_author !== 'destination' ? (
        <div className="service-page-review">
          <div className="service-review-container">
            <h4 className="cardo padding-20-bottom">{review}</h4>
            <p className="padding-20-bottom">{review_author}</p>
            <div
              className="service-page-review-book-now"
              onClick={() => setShowBookNow(true)}
            >
              <BookNow texts={misc_texts} />
            </div>
          </div>
        </div>
      ) : (
        <div className="service-page-review">
          <div className="service-review-container">
            <h4 className="cardo padding-20-bottom">
              {haveALookText}
            </h4>
            <p className="padding-20-bottom">
              {destinationManagementDescriptionText}
            </p>
            <div className="service-page-review-book-now">
              <a href={dmc_file} download>
                <button className="book-now-button">
                  <span className="button-text">{downloadPdfText}</span>
                  <span className="button-icon"></span>
                  <FaArrowDown />
                </button>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <OurServices texts={misc_texts} />
      </div>
    </div>
  );
}

export default ServicePage;
