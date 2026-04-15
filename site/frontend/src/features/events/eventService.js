import axios from 'axios';
import { getFallbackEvents } from '../../content/fallbackEvents';

const API_URL = '/api/story-events';

const getEvents = async () => {
  const language = localStorage.getItem('language') || 'en';

  try {
    const response = await axios.get(API_URL, {
      params: { language },
    });
    return response.data;
  } catch (_error) {
    return getFallbackEvents(language);
  }
};

const eventService = {
  getEvents,
};

export default eventService;
