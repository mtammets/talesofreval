import teamBackground from '../img/team-background.webp';
import privateBackground from '../img/privatebg.webp';
import destinationBackground from '../img/destinationbg.webp';
import quickBackground from '../img/quickbg.webp';
import weddingBackground from '../img/weddingbg.webp';

import teamTeamwork from '../img/team-teamwork.webp';
import teamConnections from '../img/team-connections.webp';
import teamExperiences from '../img/team-experiences.webp';

import privateStory from '../img/private-story.webp';
import privateDeliver from '../img/private-deliver.webp';
import privateRevelation from '../img/private-revelation.webp';

import quickMinutes from '../img/quick-minutes.webp';
import quickHeart from '../img/quick-heart.webp';
import quickImagine from '../img/quick-imagine.webp';

import destinationAdventures from '../img/destination-adventures.webp';
import destinationAwait from '../img/destination-await.webp';
import destinationShows from '../img/destination-shows.webp';

import weddingFantasy from '../img/weddings-fantasy.webp';
import weddingHosts from '../img/weddings-hosts.webp';
import weddingChampions from '../img/weddings-champions.webp';

const createImage = (src, name) => ({
  src,
  name,
});

const services = {
  team: {
    _id: 'fallback-team',
    title: 'Team events',
    title_estonian: 'Tiimiuritused',
    intro:
      'Interactive medieval team events in Tallinn that bring guests together through humour, storytelling and live performance.',
    intro_estonian:
      'Interaktiivsed keskaegsed meeskonnauritused Tallinnas, mis toovad inimesed kokku huumori, lugude ja elava esituse kaudu.',
    review:
      'A brilliant way to bring the whole group together. Funny, clever and genuinely memorable from start to finish.',
    review_estonian:
      'Suureparane viis kogu grupp kokku tuua. Naljakas, nutikas ja algusest lopuni meeldejaav kogemus.',
    review_author: 'Tripadvisor review',
    review_author_estonian: 'Tripadvisori arvustus',
    background_image: createImage(teamBackground, 'team-background.png'),
    texts: [
      {
        text_title: 'Live hosts, real energy',
        text_title_estonian: 'Elavad tegelased ja paras energia',
        text_english:
          'Our storytellers guide the group with humour, roleplay and a strong shared narrative that makes everyone part of the experience.',
        text_estonian:
          'Meie jutuvestjad juhivad gruppi huumori, rollimangu ja tugeva looskeemiga, mis kaasab koiki osalejaid.',
        text_image: createImage(teamTeamwork, 'team-teamwork.png'),
      },
      {
        text_title: 'Built for groups',
        text_title_estonian: 'Loodud gruppidele',
        text_english:
          'Perfect for company events, visiting delegations and teams who want something more original than a standard guided walk.',
        text_estonian:
          'Ideaalne firmapidudeks, delegatsioonidele ja tiimidele, kes tahavad tavaparasest tuurist erilisemat kogemust.',
        text_image: createImage(teamConnections, 'team-connections.png'),
      },
      {
        text_title: 'Tailored to your goal',
        text_title_estonian: 'Kohandatud sinu eesmargile',
        text_english:
          'We can shape the route, tone and activities around celebration, bonding, hospitality or a showcase of Tallinn.',
        text_estonian:
          'Saame marsruudi, tooni ja tegevused kohandada pidustuse, meeskonnatunde, vastuvotu voi Tallinna tutvustamise jargi.',
        text_image: createImage(teamExperiences, 'team-experiences.png'),
      },
    ],
  },
  private: {
    _id: 'fallback-private',
    title: 'Private tour',
    title_estonian: 'Privaattuur',
    intro:
      'Private guided experiences and immersive performances tailored for families, partners, delegations and special guests.',
    intro_estonian:
      'Privaatsed giidituurid ja elamuslikud esitused peredele, partneritele, delegatsioonidele ning erikulalistele.',
    review:
      'Personal, warm and beautifully paced. It felt like Tallinn opened up just for us.',
    review_estonian:
      'Isiklik, soe ja suureparaselt ajastatud. Tundus, nagu Tallinn oleks avanenud ainult meile.',
    review_author: 'Tripadvisor review',
    review_author_estonian: 'Tripadvisori arvustus',
    background_image: createImage(privateBackground, 'privatebg.png'),
    texts: [
      {
        text_title: 'A route designed for you',
        text_title_estonian: 'Marsruut sinu jaoks',
        text_english:
          'We shape the story, pace and route to fit your group size, interests and schedule.',
        text_estonian:
          'Kohandame loo, tempo ja marsruudi sinu grupi suuruse, huvide ja ajakava jargi.',
        text_image: createImage(privateStory, 'private-story.png'),
      },
      {
        text_title: 'Immersive but effortless',
        text_title_estonian: 'Elamuslik, aga sundimatu',
        text_english:
          'Expect an engaging medieval atmosphere without losing comfort, clarity or flexibility.',
        text_estonian:
          'Sind ootab haarav keskaja atmosfaar ilma mugavuse, selguse voi paindlikkuse arvelt jareleandmisi tegemata.',
        text_image: createImage(privateDeliver, 'private-deliver.png'),
      },
      {
        text_title: 'For moments that matter',
        text_title_estonian: 'Olulisteks hetkedeks',
        text_english:
          'Ideal for birthdays, proposals, family visits, VIP hosting and meaningful one-off occasions.',
        text_estonian:
          'Sobib sunnipevadeks, kosimisteks, perekulastusteks, VIP vastuvotuks ja muudeks olulisteks kordadeks.',
        text_image: createImage(privateRevelation, 'private-revelation.png'),
      },
    ],
  },
  quick: {
    _id: 'fallback-quick',
    title: '"We Only Have 30 Minutes!"',
    title_estonian: '"Meil on ainult 30 minutit!"',
    intro:
      'A short-format Tallinn experience for visitors with limited time who still want a memorable medieval story.',
    intro_estonian:
      'Luhiformaadis Tallinna elamus neile, kellel on vahe aega, kuid soov saada meeldejaav keskaegne kogemus.',
    review:
      'Fast, sharp and surprisingly rich. We got far more atmosphere and storytelling than we expected in half an hour.',
    review_estonian:
      'Kiire, terav ja ullatavalt sisukas. Saime poole tunniga rohkem atmosfaari ja lugusid, kui arvasime.',
    review_author: 'Tripadvisor review',
    review_author_estonian: 'Tripadvisori arvustus',
    background_image: createImage(quickBackground, 'quickbg.png'),
    texts: [
      {
        text_title: 'Designed for tight schedules',
        text_title_estonian: 'Loodud napile ajale',
        text_english:
          'Perfect between meetings, cruise stops or transfers when a full tour is not realistic.',
        text_estonian:
          'Ideaalne kohtumiste, kruiisipeatuste voi umberistumiste vahele, kui pikem tuur ei mahu graafikusse.',
        text_image: createImage(quickMinutes, 'quick-minutes.png'),
      },
      {
        text_title: 'Short but still immersive',
        text_title_estonian: 'Luhike, aga haarav',
        text_english:
          'Even in a compact format, the experience keeps its humour, performance and vivid historical flavour.',
        text_estonian:
          'Ka kompaktse formaadi puhul sailib kogemuses huumor, esituslikkus ja elav ajalooline meeleolu.',
        text_image: createImage(quickHeart, 'quick-heart.png'),
      },
      {
        text_title: 'A powerful first impression',
        text_title_estonian: 'Mojukas esimene mulje',
        text_english:
          'A strong introduction to Tallinn for visitors who want the essence without the long route.',
        text_estonian:
          'Tugev sissejuhatus Tallinna neile, kes tahavad olemust ilma pika marsruudita.',
        text_image: createImage(quickImagine, 'quick-imagine.png'),
      },
    ],
  },
  destination: {
    _id: 'fallback-destination',
    title: 'Destination management',
    title_estonian: 'Sihtkoha haldus',
    intro:
      'Destination management support for curated Tallinn programmes, hosted experiences and group itineraries.',
    intro_estonian:
      'Sihtkoha juhtimise tugi hoolikalt koostatud Tallinna programmidele, hosted-kogemustele ja grupi itineraridele.',
    review:
      'Reliable, imaginative and extremely easy to work with. They made a complex programme feel seamless.',
    review_estonian:
      'Usaldusvaarsed, loomingulised ja vaga lihtsad koostoo partnerid. Keeruline programm muutus nende abil sujuvaks.',
    review_author: 'Tripadvisor review',
    review_author_estonian: 'Tripadvisori arvustus',
    background_image: createImage(destinationBackground, 'destinationbg.png'),
    texts: [
      {
        text_title: 'Programme design',
        text_title_estonian: 'Programmi disain',
        text_english:
          'We help shape guest journeys, event flow and local storytelling into one cohesive Tallinn experience.',
        text_estonian:
          'Aitame kujundada kulaliste teekonna, urituse voolu ja kohaliku jutustuse uhtseks Tallinna kogemuseks.',
        text_image: createImage(destinationAdventures, 'destination-adventures.png'),
      },
      {
        text_title: 'Reliable local execution',
        text_title_estonian: 'Usaldusvaarselt kohapeal',
        text_english:
          'A practical on-the-ground partner for schedules, coordination and memorable hosting.',
        text_estonian:
          'Praktiline kohapealne partner ajakavade, koordineerimise ja meeldejaava vastuvotu jaoks.',
        text_image: createImage(destinationAwait, 'destination-await.png'),
      },
      {
        text_title: 'Made for hosted groups',
        text_title_estonian: 'Loodud vastuvotuks',
        text_english:
          'Works especially well for agencies, incoming groups and bespoke city programmes.',
        text_estonian:
          'Toimib eriti haesti agentuuridele, incoming-gruppidele ja erilahendusena koostatud linnaprogrammidele.',
        text_image: createImage(destinationShows, 'destination-shows.png'),
      },
    ],
  },
  wedding: {
    _id: 'fallback-wedding',
    title: 'Fantasy Weddings',
    title_estonian: 'Fantaasiapulmad',
    intro:
      'Fantasy wedding concepts and themed celebrations with hosts, performers and a distinctive medieval atmosphere.',
    intro_estonian:
      'Fantaasiarikkad pulmakontseptsioonid ja teemapeod koos hostide, esinejate ning erilise keskaegse atmosfaariga.',
    review:
      'Completely unique and wonderfully theatrical. It felt romantic, playful and unlike any other wedding we had attended.',
    review_estonian:
      'Taiesti ainulaadne ja imeliselt teatraalne. See oli romantiline, manguline ja erinev koigist teistest pulmadest, kus oleme kainud.',
    review_author: 'Tripadvisor review',
    review_author_estonian: 'Tripadvisori arvustus',
    background_image: createImage(weddingBackground, 'weddingbg.jpg'),
    texts: [
      {
        text_title: 'A concept with character',
        text_title_estonian: 'Tugeva karakteriga kontseptsioon',
        text_english:
          'We build weddings around mood, story, place and memorable rituals rather than generic templates.',
        text_estonian:
          'Loome pulmi meeleolu, loo, koha ja meeldejaavate rituaalide umber, mitte mallilahenduste jargi.',
        text_image: createImage(weddingFantasy, 'weddings-fantasy.png'),
      },
      {
        text_title: 'Hosts and performers included',
        text_title_estonian: 'Hostid ja esinejad kaasas',
        text_english:
          'From atmosphere to audience guidance, the celebration can be fully staged and gently directed.',
        text_estonian:
          'Alates meeleolust kuni kulaliste suunamiseni saab kogu pidu olla labi moeldud ja maitsekalt juhitud.',
        text_image: createImage(weddingHosts, 'weddings-hosts.png'),
      },
      {
        text_title: 'An unforgettable visual tone',
        text_title_estonian: 'Unustamatu visuaalne toon',
        text_english:
          'Perfect for couples who want storybook romance, theatrical detail and a celebration guests will remember.',
        text_estonian:
          'Ideaalne paaridele, kes tahavad muinasjutulist romantikat, teatraalseid detaile ja pidu, mis jaab kulalistele meelde.',
        text_image: createImage(weddingChampions, 'weddings-champions.png'),
      },
    ],
  },
};

const transformForLanguage = (service, language) => ({
  ...service,
  title: language === 'ee' ? service.title_estonian || service.title : service.title,
  title_estonian: language === 'ee' ? service.title : service.title_estonian,
  intro: language === 'ee' ? service.intro_estonian || service.intro : service.intro,
  intro_estonian: language === 'ee' ? service.intro : service.intro_estonian,
  review: language === 'ee' ? service.review_estonian || service.review : service.review,
  review_estonian: language === 'ee' ? service.review : service.review_estonian,
  review_author:
    language === 'ee'
      ? service.review_author_estonian || service.review_author
      : service.review_author,
  review_author_estonian:
    language === 'ee' ? service.review_author : service.review_author_estonian,
  texts: service.texts.map((text) => ({
    ...text,
    text_title:
      language === 'ee' ? text.text_title_estonian || text.text_title : text.text_title,
    text_title_estonian:
      language === 'ee' ? text.text_title : text.text_title_estonian,
    text_english:
      language === 'ee' ? text.text_estonian || text.text_english : text.text_english,
    text_estonian:
      language === 'ee' ? text.text_english : text.text_estonian,
  })),
});

export const getFallbackService = (name, language = 'en') => {
  const service = services[name] || services.team;
  return transformForLanguage(service, language);
};
