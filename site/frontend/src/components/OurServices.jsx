import React from 'react';
import ServicesList from './ServicesList';

function OurServices({ texts, compact = false }) {
  const ourServicesText = texts && texts["our-services"] ? texts["our-services"].text : null;

  return (
    <div className="section our-services padding-80-top">
      <h2 className='padding-20-bottom'>{ourServicesText}</h2>
      <ServicesList texts={texts} compact={compact} />
    </div>
  );
}

export default OurServices;
