import { FALLBACK_STORYTELLERS } from '../../content/fallbackContent';

const getStorytellers = async () => {
  return FALLBACK_STORYTELLERS;
};

const storytellerService = {
  getStorytellers,
};

export default storytellerService;
