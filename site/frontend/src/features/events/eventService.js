import { getFallbackEvents } from '../../content/fallbackEvents';

const getEvents = async () => {
  const language = localStorage.getItem('language') || 'en';
  return getFallbackEvents(language);
};

const eventService = {
  getEvents,
};

export default eventService;
