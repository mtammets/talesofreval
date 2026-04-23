import axios from 'axios';
import { getFallbackTours } from '../../content/fallbackTours';
import { getEffectiveFreeTourSlots } from '../../utils/freeTourSchedule';

const getDates = async () => {
  try {
    const response = await axios.get('/api/site-settings');
    return getEffectiveFreeTourSlots(response.data?.freeTourSchedule);
  } catch (_error) {
    return getFallbackTours();
  }
};

const initiateSripe = async () => {
  const data = {
    storyId: 401,
    connectUrl: 'http://talesofreval.ee/',
  };

  const response = await axios.post(
    'https://leplace.leplace-api.com/business/payment/stripe/create-payment-checkout-session',
    data
  );

  return response.data;
};

const tourService = {
  getDates,
  initiateSripe,
};

export default tourService;
