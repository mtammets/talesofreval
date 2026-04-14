function OurTeamCard({bgimage, title, email, phone}) {
  return (
    <div className="contacts-team" style={{backgroundImage: `url(${bgimage})`}}>
    <div className="contacts-team-info">
        <h5 className="blue-text">{title}</h5>
        <a className = "mail" href={`mailto:${email}`}>{email}</a>
        <a className="phone bold" href={`tel:${phone}`}>{phone}</a>
    </div>
</div>
  )
}

export default OurTeamCard