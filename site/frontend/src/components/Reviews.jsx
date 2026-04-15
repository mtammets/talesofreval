import tripadvisorimg from "../img/trip-advisor.png"
import { FaCircle } from "react-icons/fa"
import { ArrowRightUp } from "../icons/ArrowRightUp.tsx";
import { getLocalizedSiteText } from "../content/siteSettingsDefaults";

function Reviews({reviews, misc_texts, variant = "default", content = null, language = 'en', adminAction = null}) {
  const heading = content?.heading
    ? getLocalizedSiteText(content.heading, language)
    : misc_texts?.["customers-love-us"]?.text || "Customers love us:";
  const reviewText = content?.text
    ? getLocalizedSiteText(content.text, language)
    : misc_texts?.["review-text"]?.text || "This was absolutely amazing. The tour guide was so interesting, enthusiastic and humorous with an amazing knowledge of Tallin. The whole family thoroughly enjoyed it and we can't recommend it enough!";
  const reviewer = content?.reviewer
    ? getLocalizedSiteText(content.reviewer, language)
    : misc_texts?.["reviewer-name"]?.text || "Joh Doe";

  return (
    <div className={`review-container ${variant === "home" ? "review-container-home" : ""}`}>
      <div className={`review-section ${variant === "home" ? "review-section-home" : ""}`}>
        <div className="review-card-content">
          {adminAction ? <div className="section-inline-action">{adminAction}</div> : null}
          <h3 className='cardo'>{heading}</h3>
          <p className='review-copy'>{reviewText}</p>
          <p className="reviewer">{reviewer}</p>
          <div className="review-rating">
            <div className="review-rating-dots" aria-label="5 out of 5 rating">
              {Array.from({ length: 5 }).map((_, index) => (
                <FaCircle key={index} color="#05AA6C" />
              ))}
            </div>
            <p>at</p>
            <img src={tripadvisorimg} alt="" />
          </div>
        </div>
      </div>
      <a className="review-read-more" href="https://www.tripadvisor.co.uk/Attraction_Review-g274958-d14768095-Reviews-Tales_of_Reval-Tallinn_Harju_County.html" target="_blank" rel="noopener noreferrer">
        <span>Read more</span>
        <ArrowRightUp color="#202533" />
      </a>
    </div>
  )
}

export default Reviews
