function ServicePageCard({ activeService, index }) {
  const isOdd = index % 2 === 0;
  const isFirst = index === 0;
  const { text_image, text_title, text_english } = activeService.texts[index];
  
  return (
    <div className={`service-page-card ${isOdd ? 'odd' : 'even'} ${isFirst ? 'padding-40-top' : ''}`}>
      <div className="service-card-image">
        <img src={text_image.src} alt={text_title} />
      </div>
      <div className="service-card-info">
        <h5 className='padding-20-bottom'>{text_title}</h5>
        <p>{text_english}</p>
      </div>
    </div>
  );
}

export default ServicePageCard;
