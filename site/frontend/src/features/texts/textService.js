import { getFallbackTextsForCategory } from '../../content/fallbackContent';

const getTextByCategory = async (category) => {
  const language = localStorage.getItem('language') || 'en';
  return getFallbackTextsForCategory(category, language);
};

const textService = {
  getTextByCategory,
};

export default textService;
