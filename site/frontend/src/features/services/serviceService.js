import { getFallbackService, getFallbackServices } from '../../content/fallbackServices';

const getServices = async () => {
  const language = localStorage.getItem('language') || 'en';
  return getFallbackServices(language);
};

const getService = async (name) => {
  const language = localStorage.getItem('language') || 'en';
  return getFallbackService(name, language);
};

const serviceService = {
  getServices,
  getService,
};

export default serviceService;
