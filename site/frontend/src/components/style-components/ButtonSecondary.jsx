import { Link } from "react-router-dom"

function ButtonSecondary({text, link, onClick}) {
  return (
    <Link to={link ? link : null}> 
      <button className="button-secondary" onClick={onClick}>
          <span>{text}</span>
      </button>
    </Link>
  )
}

export default ButtonSecondary
