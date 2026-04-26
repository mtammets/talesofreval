import person1 from "../img/person1.webp";
import person2 from "../img/person2.webp";
import person3 from "../img/person3.webp";
import { createEmptyPaymentLinks } from "./paymentMethods";

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
  "eesti-keeles": "English",
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
  "have-a-look-at-what's-possible!": "Have a look at what's possible!",
  "destination-management-service-description-includes-in-the-following-pdf...":
    "Destination management service description is included in the following PDF.",
  "download-pdf": "Download PDF",
  "fantasy-weddings": "Fantasy Weddings",
  "our-story": "Our story",
  "our-story-home-blurb":
    "Tales of Reval creates immersive medieval experiences in Tallinn through guided tours, live performance and memorable storytelling for groups and travellers.",
  "customers-love-us": "Customers love us:",
  "review-text":
    "This was absolutely amazing. The tour guide was so interesting, enthusiastic and humorous with an amazing knowledge of Tallinn. The whole family thoroughly enjoyed it and we can't recommend it enough!",
  "reviewer-name": "Tripadvisor review",
  "our-team": "Our team",
  "contact-us": "Contact us",
  "say-hello!": "Say hello!",
  name: "Name",
  "e-mail": "E-mail",
  "write-something": "Write something",
  send: "Send",
  cancel: "Cancel",
  "thank-you": "Thank you!",
  close: "Close",
  "well-be-in-touch": "We'll be in touch soon!",
  "name-is-required": "Name is required.",
  "email-is-required": "Email is required.",
  "message-is-required": "Message is required.",
  "email-is-not-valid": "Email is not valid.",
  "free-tour-registration": "Free Tour Registration",
  "select-a-date": "Select a date:",
  "select-a-date-placeholder": "Select a date",
  "select-a-time": "Select a time:",
  "select-a-time-placeholder": "Select a time",
  "number-of-people": "Number of people:",
  "select-number-of-people": "Select number of people",
  "more-than-7": "More than 7",
  "date-is-required": "Date is required.",
  "time-is-required": "Time is required.",
  "please-select-a-valid-number-of-people": "Please select a valid number of people.",
  "for-groups-larger-than-7-please-use-the-main-booking-option":
    "For groups larger than 7 please use the main booking option.",
  "read-more": "Read more",
  "explore-alone": "Explore Alone,",
  "discover-more": "Discover More!",
  "explore-alone-discover-more": "Explore Alone, Discover More",
  "medieval-adventure-at-your-fingertips": "Medieval adventure at your fingertips",
  "location-based-app-guided-tours": "Location based app guided tours",
  "your-time-your-pace": "Your time, your pace!",
  "interactive-quizzes": "Interactive quizzes",
  "photo-challenges": "Photo challenges",
  "in-depth-tour-with-storytelling": "In-depth tour with storytelling",
  "what-is-leplace": "What is LePlace",
  "leplace-about-copy":
    "LePlace transforms local tourism with interactive outdoor exploration games on your mobile phone and connects creators and organizations with people and places worldwide.",
  "pay-now": "Pay now",
  "review-platform-prefix": "on",
  "review-rating-label": "5 out of 5 rating",
};

const MISC_EE = {
  "our-services": "Meie teenused",
  "team-events": "Tiimiüritused",
  "private-tour": "Privaattuur",
  "\"we-only-have-30-minutes!\"": "\"Meil on ainult 30 minutit!\"",
  "destination-management": "Sihtkoha haldus",
  "have-a-look-at-what's-possible!": "Vaata, mis on võimalik!",
  "destination-management-service-description-includes-in-the-following-pdf...":
    "Sihtkoha halduse teenuse kirjeldus on toodud allolevas PDF-is.",
  "download-pdf": "Laadi PDF alla",
  "fantasy-weddings": "Fantaasiapulmad",
  "our-story": "Meie lugu",
  "our-story-home-blurb":
    "Tales of Reval loob Tallinnas kaasahaaravaid keskaegseid elamusi giidituuride, live-esituste ja meeldejääva jutustamise kaudu.",
  "customers-love-us": "Külastajad armastavad meid:",
  "review-text":
    "See oli täiesti imeline. Giid oli väga huvitav, entusiastlik ja humoorikas ning tundis Tallinna ajalugu suurepäraselt. Kogu pere nautis seda väga ja soovitame soojalt!",
  "reviewer-name": "Tripadvisori arvustus",
  "our-team": "Meie tiim",
  "contact-us": "Kontakt",
  "say-hello!": "Ütle tere!",
  name: "Nimi",
  "e-mail": "E-post",
  "write-something": "Kirjuta midagi",
  send: "Saada",
  cancel: "Tühista",
  "thank-you": "Aitäh!",
  close: "Sulge",
  "well-be-in-touch": "Võtame peagi ühendust!",
  "name-is-required": "Nimi on kohustuslik.",
  "email-is-required": "E-post on kohustuslik.",
  "message-is-required": "Sõnum on kohustuslik.",
  "email-is-not-valid": "E-posti aadress ei ole korrektne.",
  "free-tour-registration": "Tasuta tuuri registreerimine",
  "select-a-date": "Vali kuupäev:",
  "select-a-date-placeholder": "Vali kuupäev",
  "select-a-time": "Vali kellaaeg:",
  "select-a-time-placeholder": "Vali kellaaeg",
  "number-of-people": "Inimeste arv:",
  "select-number-of-people": "Vali inimeste arv",
  "more-than-7": "Rohkem kui 7",
  "date-is-required": "Kuupäev on kohustuslik.",
  "time-is-required": "Kellaaeg on kohustuslik.",
  "please-select-a-valid-number-of-people": "Palun vali sobiv inimeste arv.",
  "for-groups-larger-than-7-please-use-the-main-booking-option":
    "Üle seitsmeliikmeliste gruppide jaoks kasuta palun peamist broneerimisvormi.",
  "read-more": "Loe lähemalt",
  "explore-alone": "Avasta omas tempos,",
  "discover-more": "avasta rohkem!",
  "explore-alone-discover-more": "Avasta omas tempos, avasta rohkem",
  "medieval-adventure-at-your-fingertips": "Keskaegne seiklus sinu käeulatuses",
  "location-based-app-guided-tours": "Asukohapõhised äpijuhitud tuurid",
  "your-time-your-pace": "Sinu aeg, sinu tempo!",
  "interactive-quizzes": "Interaktiivsed viktoriinid",
  "photo-challenges": "Fotoväljakutsed",
  "in-depth-tour-with-storytelling": "Põhjalik jutustav tuur",
  "what-is-leplace": "Mis on LePlace",
  "leplace-about-copy":
    "LePlace muudab kohaliku turismi mobiilis mängitavate interaktiivsete avastusmängudega ning ühendab loojad ja organisatsioonid inimeste ja paikadega üle kogu maailma.",
  "pay-now": "Maksa nüüd",
  "review-platform-prefix": "TripAdvisoris",
  "review-rating-label": "5 punkti 5-st",
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

export const getFallbackText = (
  category,
  key,
  language = "en",
  fallback = ""
) => getFallbackTextsForCategory(category, language)?.[key]?.text || fallback;

export const FALLBACK_STORYTELLERS = [
  {
    _id: "fallback-1",
    name: "Marek Tammets",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: createEmptyPaymentLinks(),
    image: { src: person1 },
  },
  {
    _id: "fallback-2",
    name: "Tales of Reval Team",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: createEmptyPaymentLinks(),
    image: { src: person2 },
  },
  {
    _id: "fallback-3",
    name: "Guest Experience Host",
    email: "info@talesofreval.ee",
    phone: "+372 5560 4421",
    payment_links: createEmptyPaymentLinks(),
    image: { src: person3 },
  },
];
