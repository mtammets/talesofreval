import { configureStore } from '@reduxjs/toolkit';
import eventReducer from '../features/events/eventSlice';
import textReducer from '../features/texts/textSlice';
import serviceReducer from '../features/services/serviceSlice';
import emailReducer from '../features/email/emailSlice';
import tourReducer from '../features/tour/tourSlice';
import storytellerReducer from '../features/storytellers/storytellerSlice';

export const store = configureStore({
  reducer: {
    services: serviceReducer,
    events: eventReducer,
    texts: textReducer,
    email: emailReducer,
    tour: tourReducer,
    storytellers: storytellerReducer,
  },
});
