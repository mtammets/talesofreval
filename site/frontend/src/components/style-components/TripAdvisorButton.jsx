import { TripAdvisor } from "../../icons/TripAdvisor.tsx";
import { ArrowRightUp } from "../../icons/ArrowRightUp.tsx";
import { Link } from 'react-router-dom';

function TripAdvisorButton({text, link}) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <button className="tripadvisor-button">
          <span className="icon-span-left"><TripAdvisor /></span>
          <span>{text}</span>
          <span className="icon-span-right"> <ArrowRightUp /></span>
      </button>
    </a>

  )
}

export default TripAdvisorButton
