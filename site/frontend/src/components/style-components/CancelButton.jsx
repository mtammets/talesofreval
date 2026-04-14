function CancelButton({text, link, onClick}) {
  return (
    <a href={link ? link : null} target="_blank" rel="noopener noreferrer" onClick={onClick}> 
      <button className="cancel-button">
          <span className="button-text">{text}</span>
      </button>
    </a>
  )
}

export default CancelButton