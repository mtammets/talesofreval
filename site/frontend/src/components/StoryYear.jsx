import { useState, useEffect } from 'react';
import { FaRegCircle, FaCircle } from "react-icons/fa";
import { ArrowLeft } from '../icons/ArrowLeft.tsx';
import { ArrowRight } from '../icons/ArrowRight.tsx';

function StoryYear({
  events,
  language = 'en',
  isEditable = false,
  onEditEvent,
  onDeleteEvent,
  isMutating = false,
}) {
  const [index, setIndex] = useState(0);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1100);

  const updateWindowDimensions = () => {
    const newIsTablet = window.innerWidth >= 768 && window.innerWidth <= 1100;
    setIsTablet(newIsTablet);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  const nextEvent = () => {
    if (index < events.length - 1) {
      setIndex(index + 1);
    }
  };

  const prevEvent = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const containsVerticalImage = (images) => {
    for (let i = 0; i < images.length; i++) {
      if (images[i].height > images[i].width) {
        return true;
      }
    }
    return false;
  };

  if (!events || events.length === 0) {
    return null;
  }

  const currentEvent = events[index];
  const { year, mediaType, image, images, video } = currentEvent;
  const title =
    language === 'ee'
      ? currentEvent.title_estonian || currentEvent.title
      : currentEvent.title;
  const description =
    language === 'ee'
      ? currentEvent.description_estonian || currentEvent.description
      : currentEvent.description;

  return (
    <div className="story-year padding-40-bottom">
      <h3>{year}</h3>
      <div className="year-container padding-20-top">
        <div className="year-dividor">
          <div className="dividor-container">
            <div className="dividor-circle">.</div>
            <div className="dividor-line">.</div>
          </div>
        </div>
        <div className="year-data">
          <div className="year-media" style={mediaType === 0 ? { background: `url(${image.src})` } : {}}>
            {mediaType === 1 && !(isTablet && containsVerticalImage(images)) ? (
              <div className="year-justified-gallery">
                {images.map((img, i) => (
                  <img key={i} src={img.src} alt="" className={`img-${i}`} />
                ))}
              </div>
            ) : (
              mediaType === 1 && (
                <div className="year-justified-gallery">
                  <img key={images[0].src} src={images[0].src} alt="" className="img-vertical" />
                </div>
              )
            )}
            {mediaType === 2 && (
              <iframe
                title="video"
                src={video}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
            <span></span>
          </div>
          <div className="year-info">
            <div className="year-info-content">
              <h5 className="padding-20-bottom">{title}</h5>
              <div dangerouslySetInnerHTML={{ __html: description }} />
              {isEditable ? (
                <div className="story-year-admin-actions">
                  <button
                    type="button"
                    onClick={() => onEditEvent?.(currentEvent._id)}
                    disabled={isMutating}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEvent?.(currentEvent._id)}
                    disabled={isMutating}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
            <div className="controls">
              <button className={`year-event-switch ${index === 0 ? 'disabled' : ''}`} onClick={prevEvent}>
                <ArrowLeft />
              </button>
              <div className="counter">
                {events.map((event, i) => (
                  index === i ? (
                    <FaCircle key={i} style={{ margin: "0 5px" }} size={10} />
                  ) : (
                    <FaRegCircle key={i} style={{ margin: "0 5px" }} size={10} />
                  )
                ))}
              </div>
              <button className={`year-event-switch ${index === events.length - 1 ? 'disabled' : ''}`} onClick={nextEvent}>
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryYear;
