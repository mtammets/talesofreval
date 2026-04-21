import { useEffect, useRef, useState } from 'react';
import { FaRegCircle, FaCircle } from "react-icons/fa";
import { ArrowLeft } from '../icons/ArrowLeft.tsx';
import { ArrowRight } from '../icons/ArrowRight.tsx';
import {
  getImageObjectPosition,
  getImageRotation,
  getImageZoom,
  getImageLayout,
  hasImageLayout,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';
import { normalizeVideoEmbedUrl } from '../features/events/storyAdminUtils';
import StoryImageTransformEditor from './StoryImageTransformEditor.jsx';

const STORY_MEDIA_SIZES = '(max-width: 768px) 100vw, 55vw';

const getImageOrientation = (width, height) => {
  if (!width || !height) {
    return 'landscape';
  }

  const ratio = width / height;

  if (ratio < 0.88) {
    return 'portrait';
  }

  if (ratio > 1.12) {
    return 'landscape';
  }

  return 'square';
};

const getSingleImageScale = (zoom, rotation) =>
  Number((zoom * (1 + Math.abs(rotation) / 140)).toFixed(4));

const DEFAULT_GALLERY_Z_INDEX = [1, 3, 2, 0];

const getGalleryItemZIndex = (image, itemIndex) => {
  const storedZIndex = Number(image?.zIndex);

  if (Number.isFinite(storedZIndex)) {
    return storedZIndex;
  }

  return DEFAULT_GALLERY_Z_INDEX[itemIndex] ?? itemIndex;
};

function StoryYear({
  events,
  language = 'en',
  isEditable = false,
  onEditEvent,
  onAddPage,
  onDeleteEvent,
  onChangeImageTransform,
  isMutating = false,
}) {
  const SWIPE_TRANSITION_MS = 360;
  const [index, setIndex] = useState(0);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1100);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState(null);
  const swipeSurfaceRef = useRef(null);
  const swipeStateRef = useRef({
    startX: 0,
    startY: 0,
    deltaX: 0,
    isPointerDown: false,
    isHorizontalSwipe: false,
    blockedByVerticalScroll: false,
    startTime: 0,
  });
  const transitionTimersRef = useRef([]);

  const updateWindowDimensions = () => {
    const newIsTablet = window.innerWidth >= 768 && window.innerWidth <= 1100;
    const newIsMobile = window.innerWidth < 768;
    setIsTablet(newIsTablet);
    setIsMobile(newIsMobile);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  useEffect(() => {
    if (index >= events.length) {
      setIndex(Math.max(events.length - 1, 0));
    }
  }, [events.length, index]);

  useEffect(() => {
    return () => {
      transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      clearTransitionTimers();
      setDragOffset(0);
      setIsDragging(false);
      setIsSwipeTransitioning(false);
      setTransitionTargetIndex(null);
      resetSwipeState();
    }
  }, [isMobile]);

  const clearTransitionTimers = () => {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  };

  const getSwipeWidth = () => {
    return swipeSurfaceRef.current?.clientWidth || window.innerWidth || 320;
  };

  const getAdjacentIndex = (deltaX) => {
    if (deltaX < 0 && index < events.length - 1) {
      return index + 1;
    }

    if (deltaX > 0 && index > 0) {
      return index - 1;
    }

    return null;
  };

  const finalizeSwipeTransition = (nextIndex) => {
    setIndex(nextIndex);
    setDragOffset(0);
    setIsDragging(false);
    setIsSwipeTransitioning(false);
    setTransitionTargetIndex(null);
    resetSwipeState();
  };

  const animateToIndex = (nextIndex, options = {}) => {
    const { fromDrag = false } = options;

    if (nextIndex < 0 || nextIndex > events.length - 1 || nextIndex === index || isSwipeTransitioning) {
      return;
    }

    clearTransitionTimers();
    setIsDragging(false);
    setTransitionTargetIndex(nextIndex);

    const targetOffset = nextIndex > index ? -getSwipeWidth() : getSwipeWidth();

    if (fromDrag) {
      setIsSwipeTransitioning(true);
      setDragOffset(targetOffset);
    } else {
      setIsSwipeTransitioning(false);
      setDragOffset(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSwipeTransitioning(true);
          setDragOffset(targetOffset);
        });
      });
    }

    transitionTimersRef.current.push(
      window.setTimeout(() => {
        finalizeSwipeTransition(nextIndex);
      }, SWIPE_TRANSITION_MS)
    );
  };

  const animateSwipeBack = () => {
    const activeTargetIndex = transitionTargetIndex ?? getAdjacentIndex(dragOffset);

    setIsDragging(false);
    setTransitionTargetIndex(activeTargetIndex);
    setIsSwipeTransitioning(true);
    setDragOffset(0);

    transitionTimersRef.current.push(
      window.setTimeout(() => {
        setIsSwipeTransitioning(false);
        setTransitionTargetIndex(null);
        setDragOffset(0);
        resetSwipeState();
      }, SWIPE_TRANSITION_MS - 20)
    );
  };

  const nextEvent = () => {
    if (index < events.length - 1) {
      if (isMobile) {
        animateToIndex(index + 1);
        return;
      }

      setIndex(index + 1);
    }
  };

  const prevEvent = () => {
    if (index > 0) {
      if (isMobile) {
        animateToIndex(index - 1);
        return;
      }

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

  const resetSwipeState = () => {
    swipeStateRef.current = {
      startX: 0,
      startY: 0,
      deltaX: 0,
      isPointerDown: false,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: 0,
    };
  };

  const handleTouchStart = (event) => {
    if (!isMobile || isSwipeTransitioning || event.touches.length !== 1 || events.length < 2) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('button, a, iframe')) {
      return;
    }

    clearTransitionTimers();
    setIsSwipeTransitioning(false);
    setTransitionTargetIndex(null);

    const touch = event.touches[0];
    swipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      isPointerDown: true,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: Date.now(),
    };
  };

  const handleTouchMove = (event) => {
    if (!isMobile || !swipeStateRef.current.isPointerDown || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeStateRef.current.startX;
    const deltaY = touch.clientY - swipeStateRef.current.startY;
    const targetIndex = getAdjacentIndex(deltaX);

    swipeStateRef.current.deltaX = deltaX;

    if (!swipeStateRef.current.isHorizontalSwipe && !swipeStateRef.current.blockedByVerticalScroll) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        swipeStateRef.current.isHorizontalSwipe = true;
        setIsDragging(true);
      } else {
        swipeStateRef.current.blockedByVerticalScroll = true;
        return;
      }
    }

    if (!swipeStateRef.current.isHorizontalSwipe) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const isPushingPastFirst = index === 0 && deltaX > 0;
    const isPushingPastLast = index === events.length - 1 && deltaX < 0;
    const resistance = isPushingPastFirst || isPushingPastLast ? 0.28 : 0.92;

    setTransitionTargetIndex(targetIndex);
    setDragOffset(deltaX * resistance);
  };

  const handleTouchEnd = () => {
    if (!isMobile) {
      return;
    }

    if (!swipeStateRef.current.isPointerDown) {
      resetSwipeState();
      return;
    }

    const { deltaX, isHorizontalSwipe, startTime } = swipeStateRef.current;
    const width = getSwipeWidth();
    const elapsed = Math.max(Date.now() - startTime, 1);
    const velocity = Math.abs(deltaX) / elapsed;
    const threshold = Math.min(Math.max(width * 0.18, 42), 96);
    const targetIndex = getAdjacentIndex(deltaX);
    const shouldCommit = isHorizontalSwipe && (
      Math.abs(deltaX) > threshold ||
      (Math.abs(deltaX) > 24 && velocity > 0.55)
    );

    setIsDragging(false);

    if (shouldCommit && targetIndex !== null) {
      resetSwipeState();
      animateToIndex(targetIndex, { fromDrag: true });
      return;
    }

    animateSwipeBack();
    resetSwipeState();
  };

  const getEventCopy = (event) => ({
    title: language === 'ee' ? event.title_estonian || event.title : event.title,
    description: language === 'ee' ? event.description_estonian || event.description : event.description,
  });

  const renderControls = (slideIndex) => (
    <div className="controls">
      <button
        type="button"
        className={`year-event-switch ${slideIndex === 0 ? 'disabled' : ''}`}
        onClick={prevEvent}
      >
        <ArrowLeft />
      </button>
      <div className="counter">
        {events.map((event, i) => (
          slideIndex === i ? (
            <FaCircle key={i} style={{ margin: "0 5px" }} size={10} />
          ) : (
            <FaRegCircle key={i} style={{ margin: "0 5px" }} size={10} />
          )
        ))}
      </div>
      <button
        type="button"
        className={`year-event-switch ${slideIndex === events.length - 1 ? 'disabled' : ''}`}
        onClick={nextEvent}
      >
        <ArrowRight />
      </button>
    </div>
  );

  const getGalleryFrameStyle = (image, baseStyle = {}) => {
    const layout = getImageLayout(image);
    const hasLayoutMetadata = hasImageLayout(image);
    const hasPositionMetadata =
      layout.layoutX !== null || layout.layoutY !== null || layout.layoutWidth !== null;
    const frameStyle = {
      ...baseStyle,
    };
    const storedZIndex = Number(image?.zIndex);

    if (Number.isFinite(storedZIndex)) {
      frameStyle.zIndex = storedZIndex;
    }

    if (!hasLayoutMetadata) {
      return frameStyle;
    }

    if (layout.layoutX !== null) {
      frameStyle.left = `${layout.layoutX}%`;
    }

    if (layout.layoutY !== null) {
      frameStyle.top = `${layout.layoutY}%`;
    }

    if (layout.layoutWidth !== null) {
      frameStyle.width = `${layout.layoutWidth}%`;
    }

    if (hasPositionMetadata) {
      frameStyle.right = 'auto';
      frameStyle.bottom = 'auto';
      frameStyle.height = 'auto';
    }

    frameStyle.transform = `rotate(${layout.rotation}deg)`;

    return frameStyle;
  };

  const handleImageTransformChange = (event, imageIndex, patch, options = {}) => {
    if (!event?._id) {
      return;
    }

    onChangeImageTransform?.({
      eventId: event._id,
      mediaType: Number(event.mediaType) || 0,
      imageIndex,
      patch,
      commit: Boolean(options.commit),
    });
  };

  const handleGalleryImageActivate = (event, imageIndex, galleryItems) => {
    if (!event?._id || !Array.isArray(galleryItems) || !galleryItems.length) {
      return;
    }

    const activeZIndex = getGalleryItemZIndex(galleryItems[imageIndex]?.image, imageIndex);
    const maxZIndex = Math.max(
      ...galleryItems.map((item, index) => getGalleryItemZIndex(item.image, index))
    );

    if (activeZIndex >= maxZIndex) {
      return;
    }

    handleImageTransformChange(
      event,
      imageIndex,
      {
        zIndex: maxZIndex + 1,
      },
      {
        commit: true,
      }
    );
  };

  const renderGalleryItem = (item, itemIndex) => {
    const imageWidth = item.width || 4;
    const imageHeight = item.height || 3;
    const frameClassName = `year-gallery-frame year-gallery-frame--${itemIndex} year-gallery-frame--${item.orientation}`;
    const frameStyle = getGalleryFrameStyle(item.image, {
      '--story-gallery-ratio': `${imageWidth} / ${imageHeight}`,
    });

    if (item.canEdit) {
      return (
        <StoryImageTransformEditor
          key={`${item.src}-${itemIndex}`}
          mode="gallery"
          image={item.image}
          src={item.src}
          srcSet={item.media?.srcSet || undefined}
          sizes={item.media?.sizes || undefined}
          alt=""
          className={frameClassName}
          imageClassName="year-gallery-image"
          style={frameStyle}
          onActivate={() =>
            handleGalleryImageActivate(item.event, itemIndex, item.galleryItems)
          }
          onChange={(patch, options) =>
            handleImageTransformChange(item.event, itemIndex, patch, options)
          }
        />
      );
    }

    return (
      <div
        key={`${item.src}-${itemIndex}`}
        className={frameClassName}
        style={frameStyle}
      >
        <img
          src={item.src}
          srcSet={item.media?.srcSet || undefined}
          sizes={item.media?.sizes || undefined}
          alt=""
          className="year-gallery-image"
          style={{
            objectPosition: item.position,
            transform: `scale(${item.zoom})`,
            transformOrigin: item.position,
          }}
        />
      </div>
    );
  };

  const renderSlide = (event, slideIndex, options = {}) => {
    const { isTarget = false, isMeasure = false, slideStyle, layerKey, hideControls = false } = options;
    const { mediaType, image, images, video } = event;
    const { title, description } = getEventCopy(event);
    const videoEmbedUrl = normalizeVideoEmbedUrl(video);
    const singleImageMedia =
      mediaType === 0 && image ? resolveSiteImageMedia(image, '', STORY_MEDIA_SIZES) : null;
    const singleImageSrc = singleImageMedia?.src || image?.src || '';
    const singleImagePosition =
      singleImageMedia?.objectPosition || getImageObjectPosition(image);
    const singleImageZoom = singleImageMedia?.zoom || getImageZoom(image);
    const singleImageRotation = getImageRotation(image);
    const canEditMedia = isEditable && !isMeasure && !isTarget && !isMobile;
    const galleryMediaItems =
      mediaType === 1 && Array.isArray(images)
        ? images
            .map((galleryImage, galleryIndex) => {
              const media = resolveSiteImageMedia(galleryImage, '', STORY_MEDIA_SIZES);
              const src = media?.src || galleryImage?.src || '';
              const width = Number(galleryImage?.width || media?.width) || 0;
              const height = Number(galleryImage?.height || media?.height) || 0;

              return src
                ? {
                    event,
                    image: galleryImage,
                    media,
                    src,
                    width,
                    height,
                    orientation: getImageOrientation(width, height),
                    position: media?.objectPosition || getImageObjectPosition(galleryImage),
                    zoom: media?.zoom || getImageZoom(galleryImage),
                    canEdit: canEditMedia,
                    zIndex: getGalleryItemZIndex(galleryImage, galleryIndex),
                  }
                : null;
            })
            .filter(Boolean)
        : [];
    galleryMediaItems.forEach((item) => {
      item.galleryItems = galleryMediaItems;
    });
    const galleryOrientationClass =
      mediaType === 1 && galleryMediaItems.length
        ? ` year-media--gallery year-media--gallery-${galleryMediaItems[0].orientation}`
        : '';

    return (
      <div
        key={layerKey}
        className={`year-data${isMobile ? ' year-data--mobile' : ''}${isMeasure ? ' year-data--measure' : ''}${isTarget ? ' year-swipe-layer year-swipe-layer--target' : isMobile && !isMeasure ? ' year-swipe-layer year-swipe-layer--current' : ''}${isDragging && !isMeasure ? ' year-swipe-layer--dragging' : ''}${isSwipeTransitioning && !isMeasure ? ' year-swipe-layer--transitioning' : ''}`}
        style={slideStyle}
        aria-hidden={isMeasure ? 'true' : undefined}
      >
        <div className={`year-media${galleryOrientationClass}`}>
          {mediaType === 0 && singleImageSrc ? (
            canEditMedia ? (
              <StoryImageTransformEditor
                mode="single"
                image={image}
                src={singleImageSrc}
                srcSet={singleImageMedia?.srcSet || undefined}
                sizes={singleImageMedia?.sizes || undefined}
                alt=""
                ariaHidden="true"
                className="year-media__single-editor"
                imageClassName="year-media__single"
                onChange={(patch, options) =>
                  handleImageTransformChange(event, null, patch, options)
                }
              />
            ) : (
              <img
                className="year-media__single"
                src={singleImageSrc}
                srcSet={singleImageMedia?.srcSet || undefined}
                sizes={singleImageMedia?.sizes || undefined}
                alt=""
                aria-hidden="true"
                style={{
                  objectPosition: singleImagePosition,
                  transform: `scale(${getSingleImageScale(singleImageZoom, singleImageRotation)}) rotate(${singleImageRotation}deg)`,
                  transformOrigin: singleImagePosition,
                }}
              />
            )
          ) : null}
          {mediaType === 1 && galleryMediaItems.length ? (
            <div
              className={`year-justified-gallery year-justified-gallery--count-${Math.min(
                galleryMediaItems.length,
                4
              )}${isTablet && containsVerticalImage(images) ? ' year-justified-gallery--has-vertical' : ''}`}
            >
              {galleryMediaItems.slice(0, 4).map(renderGalleryItem)}
            </div>
          ) : (
            null
          )}
          {mediaType === 2 && (
            <iframe
              title="video"
              src={videoEmbedUrl}
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
                  onClick={() => onEditEvent?.(event._id)}
                  disabled={isMutating}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="story-year-admin-actions__primary"
                  onClick={() => onAddPage?.(event)}
                  disabled={isMutating}
                >
                  Add Page
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteEvent?.(event._id)}
                  disabled={isMutating}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          {hideControls ? null : renderControls(slideIndex)}
        </div>
      </div>
    );
  };

  if (!events || events.length === 0) {
    return null;
  }

  const currentEvent = events[index];
  const { year } = currentEvent;
  const swipeWidth = getSwipeWidth();
  const swipeProgress = isMobile ? Math.min(Math.abs(dragOffset) / swipeWidth, 1) : 0;
  const activeTargetIndex = isMobile ? transitionTargetIndex ?? getAdjacentIndex(dragOffset) : null;
  const activeTargetEvent = activeTargetIndex !== null ? events[activeTargetIndex] : null;
  const targetBaseOffset = activeTargetIndex === null
    ? 0
    : activeTargetIndex > index
      ? swipeWidth
      : -swipeWidth;
  const currentSlideStyle = isMobile
    ? {
        '--story-swipe-progress': swipeProgress,
        transform: `translate3d(${dragOffset}px, 0, 0)`,
        opacity: 1 - (swipeProgress * 0.1),
      }
    : undefined;
  const targetSlideStyle = isMobile && activeTargetIndex !== null
    ? {
        '--story-swipe-progress': swipeProgress,
        transform: `translate3d(${targetBaseOffset + dragOffset}px, 0, 0)`,
        opacity: 0.76 + (swipeProgress * 0.24),
      }
    : undefined;

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
        {isMobile ? (
          <div
            ref={swipeSurfaceRef}
            className="year-swipe-viewport"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {renderSlide(currentEvent, index, {
              isMeasure: true,
              layerKey: `measure-${currentEvent._id || `${currentEvent.year}-${index}`}`,
            })}
            {activeTargetEvent ? renderSlide(activeTargetEvent, activeTargetIndex, {
              isTarget: true,
              slideStyle: targetSlideStyle,
              layerKey: activeTargetEvent._id || `${activeTargetEvent.year}-${activeTargetIndex}`,
              hideControls: true,
            }) : null}
            {renderSlide(currentEvent, index, {
              slideStyle: currentSlideStyle,
              layerKey: currentEvent._id || `${currentEvent.year}-${index}`,
            })}
          </div>
        ) : (
          renderSlide(currentEvent, index)
        )}
      </div>
    </div>
  );
}

export default StoryYear;
