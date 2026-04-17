import homeBg from '../img/home-bg.webp';
import teamImage from '../img/team.webp';
import privateImage from '../img/private.webp';
import quickImage from '../img/quick.webp';
import destinationImage from '../img/destination.webp';
import weddingImage from '../img/pulmad.webp';
import teamHeroImage from '../img/team-background.webp';
import privateHeroImage from '../img/privatebg.webp';
import quickHeroImage from '../img/quickbg.webp';
import destinationHeroImage from '../img/destinationbg.webp';
import weddingHeroImage from '../img/weddingbg.webp';
import teamSectionImage1 from '../img/team-teamwork.webp';
import teamSectionImage2 from '../img/team-connections.webp';
import teamSectionImage3 from '../img/team-experiences.webp';
import privateSectionImage1 from '../img/private-story.webp';
import privateSectionImage2 from '../img/private-deliver.webp';
import privateSectionImage3 from '../img/private-revelation.webp';
import quickSectionImage1 from '../img/quick-minutes.webp';
import quickSectionImage2 from '../img/quick-heart.webp';
import quickSectionImage3 from '../img/quick-imagine.webp';
import destinationSectionImage1 from '../img/destination-adventures.webp';
import destinationSectionImage2 from '../img/destination-await.webp';
import destinationSectionImage3 from '../img/destination-shows.webp';
import weddingSectionImage1 from '../img/weddings-fantasy.webp';
import weddingSectionImage2 from '../img/weddings-hosts.webp';
import weddingSectionImage3 from '../img/weddings-champions.webp';
import person1 from '../img/person1.webp';
import person2 from '../img/person2.webp';
import person3 from '../img/person3.webp';
import bgcontact from '../img/bgcontact.webp';
import storyBgImage from '../img/storybg.webp';
import gpsGameImage from '../img/gps-game.webp';
import { createEmptyPaymentLinks } from './paymentMethods';

export const SITE_IMAGE_ASSETS = {
  homeBg,
  serviceTeam: teamImage,
  servicePrivate: privateImage,
  serviceQuick: quickImage,
  serviceDestination: destinationImage,
  serviceWedding: weddingImage,
  serviceTeamHero: teamHeroImage,
  servicePrivateHero: privateHeroImage,
  serviceQuickHero: quickHeroImage,
  serviceDestinationHero: destinationHeroImage,
  serviceWeddingHero: weddingHeroImage,
  serviceTeamSection1: teamSectionImage1,
  serviceTeamSection2: teamSectionImage2,
  serviceTeamSection3: teamSectionImage3,
  servicePrivateSection1: privateSectionImage1,
  servicePrivateSection2: privateSectionImage2,
  servicePrivateSection3: privateSectionImage3,
  serviceQuickSection1: quickSectionImage1,
  serviceQuickSection2: quickSectionImage2,
  serviceQuickSection3: quickSectionImage3,
  serviceDestinationSection1: destinationSectionImage1,
  serviceDestinationSection2: destinationSectionImage2,
  serviceDestinationSection3: destinationSectionImage3,
  serviceWeddingSection1: weddingSectionImage1,
  serviceWeddingSection2: weddingSectionImage2,
  serviceWeddingSection3: weddingSectionImage3,
  teamMember1: person1,
  teamMember2: person2,
  teamMember3: person3,
  contactMember1: person1,
  contactMember2: person2,
  contactMember3: person3,
  contactMember4: person1,
  contactBg: bgcontact,
  storyBg: storyBgImage,
  gpsGame: gpsGameImage,
};

export const DEFAULT_SITE_SETTINGS = {
  homeHero: {
    titleLine1: { en: 'Storytelling', ee: 'Lugude jutustamine' },
    titleLine2: { en: 'Reinvented', ee: 'uuesti loodud' },
    subtitle: {
      en: 'Let Your Imagination Find Its Voice!',
      ee: 'Lase oma kujutlusvõimel hääl leida!',
    },
    imageKey: 'homeBg',
    image: null,
  },
  storyPage: {
    imageKey: 'storyBg',
    image: null,
  },
  servicePageHeroes: {
    team: {
      imageKey: 'serviceTeamHero',
      image: null,
    },
    private: {
      imageKey: 'servicePrivateHero',
      image: null,
    },
    quick: {
      imageKey: 'serviceQuickHero',
      image: null,
    },
    destination: {
      imageKey: 'serviceDestinationHero',
      image: null,
    },
    wedding: {
      imageKey: 'serviceWeddingHero',
      image: null,
    },
  },
  homeServices: {
    heading: { en: 'Our services', ee: 'Meie teenused' },
    items: [
      {
        key: 'team',
        link: 'team',
        title: { en: 'Team events', ee: 'Tiimiüritused' },
        description: {
          en: 'Interactive medieval team events in Tallinn that bring guests together through humor, storytelling and live performance.',
          ee: 'Interaktiivsed keskaegsed tiimiüritused Tallinnas, mis toovad inimesed kokku huumori, lugude jutustamise ja live-esinemiste kaudu.',
        },
        imageKey: 'serviceTeam',
        image: null,
      },
      {
        key: 'private',
        link: 'private',
        title: { en: 'Private tour', ee: 'Privaattuur' },
        description: {
          en: 'Private guided experiences and immersive performances tailored for families, partners, delegations and special guests.',
          ee: 'Privaatsed giidituurid ja kaasahaaravad elamused peredele, partneritele, delegatsioonidele ning erikülalistele.',
        },
        imageKey: 'servicePrivate',
        image: null,
      },
      {
        key: 'quick',
        link: 'quick',
        title: { en: '"We Only Have 30 Minutes!"', ee: '"Meil on ainult 30 minutit!"' },
        description: {
          en: 'A short-format Tallinn experience for visitors with limited time who still want a memorable medieval story.',
          ee: 'Lühiformaadis Tallinna elamus külastajatele, kellel on vähe aega, kuid kes tahavad siiski meeldejäävat keskaegset lugu.',
        },
        imageKey: 'serviceQuick',
        image: null,
      },
      {
        key: 'destination',
        link: 'destination',
        title: { en: 'Destination management', ee: 'Sihtkoha haldus' },
        description: {
          en: 'Destination management support for curated Tallinn programmes, hosted experiences and group itineraries.',
          ee: 'Sihtkoha halduse tugi kureeritud Tallinna programmidele, võõrustatud elamustele ja grupi-itineraridele.',
        },
        imageKey: 'serviceDestination',
        image: null,
      },
      {
        key: 'wedding',
        link: 'wedding',
        title: { en: 'Fantasy Weddings', ee: 'Fantaasiapulmad' },
        description: {
          en: 'Fantasy wedding concepts and themed celebrations with hosts, performers and a distinctive medieval atmosphere.',
          ee: 'Fantaasiapulmade kontseptsioonid ja temaatilised peod koos õhtujuhtide, esinejate ning erilise keskaegse atmosfääriga.',
        },
        imageKey: 'serviceWedding',
        image: null,
      },
    ],
  },
  homeTeam: {
    heading: { en: 'Our team', ee: 'Meie tiim' },
    members: [
      {
        key: 'member-1',
        name: 'Marek Tammets',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        payment_links: createEmptyPaymentLinks(),
        imageKey: 'teamMember1',
        image: null,
      },
      {
        key: 'member-2',
        name: 'Tales of Reval Team',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        payment_links: createEmptyPaymentLinks(),
        imageKey: 'teamMember2',
        image: null,
      },
      {
        key: 'member-3',
        name: 'Guest Experience Host',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        payment_links: createEmptyPaymentLinks(),
        imageKey: 'teamMember3',
        image: null,
      },
      {
        key: 'member-4',
        name: 'Tales of Reval Host',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        payment_links: createEmptyPaymentLinks(),
        imageKey: 'contactMember4',
        image: null,
      },
    ],
  },
  homeReview: {
    heading: { en: 'Customers love us:', ee: 'Külastajad armastavad meid:' },
    text: {
      en: "This was absolutely amazing. The tour guide was so interesting, enthusiastic and humorous with an amazing knowledge of Tallinn. The whole family thoroughly enjoyed it and we can't recommend it enough!",
      ee: 'See oli täiesti imeline. Giid oli väga huvitav, entusiastlik ja humoorikas ning tundis Tallinna ajalugu suurepäraselt. Kogu pere nautis seda väga ja soovitame soojalt!',
    },
    reviewer: { en: 'Tripadvisor review', ee: 'Tripadvisori arvustus' },
  },
  contactPage: {
    imageKey: 'contactBg',
    image: null,
    teamHeading: { en: 'Our team', ee: 'Meie tiim' },
    teamMembers: [
      {
        key: 'contact-member-1',
        name: 'Marek Tammets',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        imageKey: 'contactMember1',
        image: null,
      },
      {
        key: 'contact-member-2',
        name: 'Tales of Reval Team',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        imageKey: 'contactMember2',
        image: null,
      },
      {
        key: 'contact-member-3',
        name: 'Guest Experience Host',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        imageKey: 'contactMember3',
        image: null,
      },
      {
        key: 'contact-member-4',
        name: 'Tales of Reval Host',
        email: 'info@talesofreval.ee',
        phone: '+372 5560 4421',
        imageKey: 'contactMember4',
        image: null,
      },
    ],
    formTitle: { en: 'Say hello!', ee: 'Ütle tere!' },
    nameLabel: { en: 'Name*', ee: 'Nimi*' },
    emailLabel: { en: 'E-mail*', ee: 'E-post*' },
    messageLabel: { en: 'Write something', ee: 'Kirjuta midagi' },
    submitLabel: { en: 'Send', ee: 'Saada' },
    companyName: 'OÜ TalesOfReval',
    companyReg: 'Reg. no. 8834738257',
    address: {
      en: 'Tallinna 1, Tallinn,\nHarjumaa, Estonia',
      ee: 'Tallinna 1, Tallinn,\nHarjumaa, Eesti',
    },
    bankLine1: 'EE220020202020202',
    bankLine2: 'LHV Pank AS',
    email: 'info@talesofreval.ee',
    phone: '+372 5555 5555',
  },
  footer: {
    freeTourHeading: { en: 'Join our free tour', ee: 'Liitu meie tasuta tuuriga' },
    firstTime: { en: 'Daily 10:00', ee: 'Iga päev 10:00' },
    secondTime: { en: 'and 13:00', ee: 'ja 13:00' },
    languageLine: { en: 'Language: English', ee: 'Keel: inglise' },
    durationLine: { en: 'Duration: 90 minutes', ee: 'Kestus: 90 minutit' },
    distanceLine: { en: 'Distance: 1.2 km', ee: 'Distants: 1.2 km' },
    startingPointLine: { en: 'Starting point: Niguliste 2', ee: 'Alguspunkt: Niguliste 2' },
    openMapLabel: { en: 'Open map', ee: 'Ava kaart' },
    openMapUrl: 'https://maps.app.goo.gl/bVono2RWfCPvSp5x5',
    gpsHeading: { en: 'Our GPS game', ee: 'Meie GPS-mäng' },
    gpsCopy: { en: 'Very fun game and cool stuff', ee: 'Väga lõbus mäng ja ägedad ülesanded' },
    gpsButtonLabel: { en: 'Read more', ee: 'Loe lähemalt' },
    gpsUrl: 'https://connect.leplace.online/storyline-talesofreval',
    gpsImageKey: 'gpsGame',
    gpsImage: null,
    followUsHeading: { en: 'Follow us', ee: 'Jälgi meid' },
    contactHeading: { en: 'Contact us', ee: 'Võta ühendust' },
    companyName: 'OÜ Satsang',
    companyReg: 'Reg no. 14443936',
    email: 'info@talesofreval.ee',
    phone: '+372 5560 4421',
    address: { en: 'Sakala tn 7-2, 10141 Tallinn, Estonia', ee: 'Sakala tn 7-2, 10141 Tallinn, Eesti' },
    socialLinks: {
      facebook: 'https://www.facebook.com/TalesofReval/',
      instagram: 'https://www.instagram.com/talesofreval/',
      tripadvisor: 'https://www.tripadvisor.co.uk/Attraction_Review-g274958-d14768095-Reviews-Tales_of_Reval-Tallinn_Harju_County.html',
      airbnb: 'https://www.airbnb.co.uk/experiences/1096623',
    },
  },
};

export const getLocalizedSiteText = (value, language = 'en', fallback = '') => {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  if (language === 'ee') {
    return value.ee || value.en || fallback;
  }

  return value.en || value.ee || fallback;
};

export const resolveSiteImage = (image, imageKey) => {
  if (image?.src) {
    return image.src;
  }

  return SITE_IMAGE_ASSETS[imageKey] || '';
};
