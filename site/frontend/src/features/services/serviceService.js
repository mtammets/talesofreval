import { getFallbackService } from '../../content/fallbackServices';

const getService = async (name) => {
  const language = localStorage.getItem('language') || 'en';
  return getFallbackService(name, language);
};

const serviceService = {
  getService,
};

export default serviceService;
