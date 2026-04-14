import person1 from "../img/person1.webp";
import person2 from "../img/person2.webp";
import person3 from "../img/person3.webp";

export function hasTextEntries(value) {
  return Boolean(value && Object.keys(value).length > 0);
}

const createEntries = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, text]) => [key, { text }])
  );

const HEADER_EN = {
  home: "Home",
  "our-story": "Our story",
  contacts: "Contacts",
  "eesti-keeles": "Eesti keeles",
  "book-now": "Book now",
};

const HEADER_EE = {
  home: "Avaleht",
  "our-story": "Meie lugu",
  contacts: "Kontakt",
  "eesti-keeles": "In English",
  "book-now": "Broneeri",
};

const HOME_EN = {
  storytelling: "Storytelling",
  reinvented: "Reinvented",
  "imagination-voice": "Let Your Imagination Find Its Voice!",
};

const HOME_EE = {
  storytelling: "Lugude jutustamine",
  reinvented: "uuesti loodud",
  "imagination-voice": "Lase oma kujutlusvõimel hääl leida!",
};

const MISC_EN = {
  "our-services": "Our services",
  "team-events": "Team events",
  "private-tour": "Private tour",
  "\"we-only-have-30-minutes!\"": "\"We Only Have 30 Minutes!\"",
  "destination-management": "Destination management",
  "fantasy-weddings": "Fantasy Weddings",
  "our-story": "Our story",
  "our-story-home-blurb":
    "Tales of Reval creates immersive medieval experiences in Tallinn through guided tours, live performance and memorable storytelling for groups and travellers.",
  "customers-love-us": "Customers love us:",
  "review-text":
    "This was absolutely amazing. The tour guide was so interesting, enthusiastic and humorous with an amazing knowledge of Tallinn. The whole family thoroughly enjoyed it and we can't recommend it enough!",
  "reviewer-name": "Tripadvisor review",
  "our-team": "Our team",
};

const MISC_EE = {
  "our-services": "Meie teenused",
  "team-events": "Tiimiüritused",
  "private-tour": "Privaattuur",
  "\"we-only-have-30-minutes!\"": "\"Meil on ainult 30 minutit!\"",
  "destination-management": "Sihtkoha haldus",
  "fantasy-weddings": "Fantaasiapulmad",
  "our-story": "Meie lugu",
  "our-story-home-blurb":
    "Tales of Reval loob Tallinnas kaasahaaravaid keskaegseid elamusi giidituuride, live-esituste ja meeldejääva jutustamise kaudu.",
  "customers-love-us": "Külastajad armastavad meid:",
  "review-text":
    "See oli täiesti imeline. Giid oli väga huvitav, entusiastlik ja humoorikas ning tundis Tallinna ajalugu suurepäraselt. Kogu pere nautis seda väga ja soovitame soojalt!",
  "reviewer-name": "Tripadvisori arvustus",
  "our-team": "Meie tiim",
};

const FOOTER_EN = {
  "join-our-free-tour:": "Join our free tour",
  "footer-first-time": "Daily 10:00",
  "footer-second-time": "and 13:00",
  "language-:-english": "Language: English",
  "duration:-90-minutes": "Duration: 90 minutes",
  "distance:-1.2-km": "Distance: 1.2 km",
  "starting-point:-niguliste-2": "Starting point: Niguliste 2",
  "open-map": "Open map",
  "our-gps-game": "Our GPS game",
  "very-fun-game-and-cool-stuff": "Very fun game and cool stuff",
  "try-it-out!": "Read more",
  "follow-us:": "Follow us",
  "contact-us:": "Contact us",
  "tax-address": "Sakala tn 7-2, 10141 Tallinn, Estonia",
};

const FOOTER_EE = {
  "join-our-free-tour:": "Liitu meie tasuta tuuriga",
  "footer-first-time": "Iga päev 10:00",
  "footer-second-time": "ja 13:00",
  "language-:-english": "Keel: inglise",
  "duration:-90-minutes": "Kestus: 90 minutit",
  "distance:-1.2-km": "Distants: 1.2 km",
  "starting-point:-niguliste-2": "Alguspunkt: Niguliste 2",
  "open-map": "Ava kaart",
  "our-gps-game": "Meie GPS-mäng",
  "very-fun-game-and-cool-stuff": "Väga lõbus mäng ja ägedad ülesanded",
  "try-it-out!": "Loe lähemalt",
  "follow-us:": "Jälgi meid",
  "contact-us:": "Võta ühendust",
  "tax-address": "Sakala tn 7-2, 10141 Tallinn, Eesti",
};

export const FALLBACK_HEADER_TEXTS = createEntries(HEADER_EN);
export const FALLBACK_HEADER_TEXTS_EE = createEntries(HEADER_EE);

export const FALLBACK_HOME_TEXTS = createEntries(HOME_EN);
export const FALLBACK_HOME_TEXTS_EE = createEntries(HOME_EE);

export const FALLBACK_MISC_TEXTS = createEntries(MISC_EN);
export const FALLBACK_MISC_TEXTS_EE = createEntries(MISC_EE);

export const FALLBACK_FOOTER_TEXTS = createEntries(FOOTER_EN);
export const FALLBACK_FOOTER_TEXTS_EE = createEntries(FOOTER_EE);

export const getFallbackTextsForCategory = (category, language = "en") => {
  const byLanguage = language === "ee"
    ? {
        header: FALLBACK_HEADER_TEXTS_EE,
        "home-page": FALLBACK_HOME_TEXTS_EE,
        misc: FALLBACK_MISC_TEXTS_EE,
        footer: FALLBACK_FOOTER_TEXTS_EE,
      }
    : {
        header: FALLBACK_HEADER_TEXTS,
        "home-page": FALLBACK_HOME_TEXTS,
        misc: FALLBACK_MISC_TEXTS,
        footer: FALLBACK_FOOTER_TEXTS,
      };

  return byLanguage[category] || {};
};

export const FALLBACK_STORYTELLERS = [
  {
    _id: "fallback-1",
    name: "Marek Tammets",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: [],
    image: { src: person1 },
  },
  {
    _id: "fallback-2",
    name: "Tales of Reval Team",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: [],
    image: { src: person2 },
  },
  {
    _id: "fallback-3",
    name: "Guest Experience Host",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: [],
    image: { src: person3 },
  },
];
