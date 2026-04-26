import tripadvisorimg from "../img/trip-advisor.png"
import { FaCircle } from "react-icons/fa"
import { ArrowRightUp } from "../icons/ArrowRightUp.tsx";
import { TripAdvisor } from "../icons/TripAdvisor.tsx";
import { getFallbackText } from "../content/fallbackContent";
import { getLocalizedSiteText } from "../content/siteSettingsDefaults";

function Reviews({reviews, misc_texts, variant = "default", content = null, language = 'en', adminAction = null}) {
  const heading = content?.heading
    ? getLocalizedSiteText(content.heading, language)
    : misc_texts?.["customers-love-us"]?.text || getFallbackText('misc', 'customers-love-us', language, 'Customers love us:');
  const reviewText = content?.text
    ? getLocalizedSiteText(content.text, language)
    : misc_texts?.["review-text"]?.text || getFallbackText('misc', 'review-text', language, "This was absolutely amazing. The tour guide was so interesting, enthusiastic and humorous with an amazing knowledge of Tallinn. The whole family thoroughly enjoyed it and we can't recommend it enough!");
  const reviewer = content?.reviewer
    ? getLocalizedSiteText(content.reviewer, language)
    : misc_texts?.["reviewer-name"]?.text || getFallbackText('misc', 'reviewer-name', language, 'Tripadvisor review');
  const readMoreText = misc_texts?.["read-more"]?.text || getFallbackText('misc', 'read-more', language, 'Read more');
  const reviewPlatformText =
    misc_texts?.["review-platform-prefix"]?.text ||
    getFallbackText('misc', 'review-platform-prefix', language, 'on');
  const reviewRatingLabel =
    misc_texts?.["review-rating-label"]?.text ||
    getFallbackText('misc', 'review-rating-label', language, '5 out of 5 rating');

  return (
    <div className={`review-container ${variant === "home" ? "review-container-home" : ""}`}>
      <div className={`review-section ${variant === "home" ? "review-section-home" : ""}`}>
        <div className="review-card-content">
          {adminAction ? <div className="section-inline-action">{adminAction}</div> : null}
          <h3 className='cardo'>{heading}</h3>
          <p className='review-copy'>{reviewText}</p>
          <p className="reviewer">{reviewer}</p>
          <div className="review-rating">
            <div className="review-rating-dots" aria-label={reviewRatingLabel}>
              {Array.from({ length: 5 }).map((_, index) => (
                <FaCircle key={index} color="#05AA6C" />
              ))}
            </div>
            <p>{reviewPlatformText}</p>
            <img src={tripadvisorimg} alt="" />
          </div>
        </div>
      </div>
      <a className="review-read-more" href="https://www.tripadvisor.co.uk/Attraction_Review-g274958-d14768095-Reviews-Tales_of_Reval-Tallinn_Harju_County.html" target="_blank" rel="noopener noreferrer">
        <span className="review-read-more__icon">
          <TripAdvisor size={variant === "home" ? "1.35rem" : "1.5rem"} />
        </span>
        <span>{readMoreText}</span>
        <ArrowRightUp color="#202533" />
      </a>
    </div>
  )
}

export default Reviews
