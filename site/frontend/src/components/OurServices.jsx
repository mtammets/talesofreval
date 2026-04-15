import React from 'react';
import ServicesList from './ServicesList';
import { getLocalizedSiteText } from '../content/siteSettingsDefaults';

function OurServices({ texts, compact = false, heading, items, language = 'en', adminAction = null }) {
  const ourServicesText = heading
    ? getLocalizedSiteText(heading, language)
    : texts && texts["our-services"]
      ? texts["our-services"].text
      : null;

  return (
    <div className="section our-services padding-80-top">
      <div className="section-heading-row">
        <h2 className='padding-20-bottom'>{ourServicesText}</h2>
        {adminAction}
      </div>
      <ServicesList texts={texts} compact={compact} itemsOverride={items} language={language} />
    </div>
  );
}

export default OurServices;
