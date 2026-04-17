import june2019 from '../img/june2019.webp';
import may2019 from '../img/may2019.webp';
import november2019 from '../img/november2019.webp';

const createImage = (src, name) => ({
  src,
  name,
  width: 1200,
  height: 760,
});

const events = [
  {
    _id: 'fallback-event-2019-1',
    year: 2019,
    order: 1,
    mediaType: 0,
    image: createImage(may2019, 'may2019.png'),
    title: 'The first live city stories',
    title_estonian: 'Esimesed elavad linnalood',
    description:
      '<p>Tales of Reval began shaping immersive medieval storytelling walks in Tallinn, combining humour, characters and local history into a format that felt personal and theatrical.</p>',
    description_estonian:
      '<p>Tales of Reval alustas kaasavate keskaegsete jutustustuurede kujundamist Tallinnas, sidudes huumori, tegelased ja kohaliku ajaloo isiklikuks ning teatraalseks kogemuseks.</p>',
  },
  {
    _id: 'fallback-event-2019-2',
    year: 2019,
    order: 2,
    mediaType: 0,
    image: createImage(june2019, 'june2019.png'),
    title: 'Performers joined the format',
    title_estonian: 'Esinejad liitusid formaadiga',
    description:
      '<p>The concept expanded from guided walks into richer live experiences, where hosts and performers helped bring medieval Tallinn to life for guests and private groups.</p>',
    description_estonian:
      '<p>Kontseptsioon laienes giidituuridelt rikkalikumateks live-elamusteks, kus hostid ja esinejad aitasid keskaegse Tallinna kulaliste ja privaatgruppide jaoks ellu aratada.</p>',
  },
  {
    _id: 'fallback-event-2019-3',
    year: 2019,
    order: 3,
    mediaType: 0,
    image: createImage(november2019, 'november2019.png'),
    title: 'A recognisable visual world emerged',
    title_estonian: 'Tekkis ara tuntav visuaalne maailm',
    description:
      '<p>By the end of the year, the project had a stronger visual language, clearer service structure and a more distinctive approach to hosted medieval experiences.</p>',
    description_estonian:
      '<p>Aasta lopuks oli projektil tugevam visuaalne keel, selgem teenuseloogika ja eristuvam lahenemine korraldatud keskaegsetele elamustele.</p>',
  },
];

const applyLanguage = (event, language) => ({
  ...event,
  title: language === 'ee' ? event.title_estonian || event.title : event.title,
  title_estonian: language === 'ee' ? event.title : event.title_estonian,
  description:
    language === 'ee'
      ? event.description_estonian || event.description
      : event.description,
  description_estonian:
    language === 'ee' ? event.description : event.description_estonian,
});

export const getFallbackEvents = (language = 'en') =>
  events
    .slice()
    .sort((a, b) => (a.year === b.year ? a.order - b.order : a.year - b.year))
    .map((event) => applyLanguage(event, language));
