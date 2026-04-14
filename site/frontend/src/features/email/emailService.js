import axios from 'axios';

const API_URL = '/email/';

const sendBooking = async (mailData) => {
  const response = await axios.post(API_URL, mailData);
  return response.data;
};

const sendContact = async (mailData) => {
  const response = await axios.post(`${API_URL}contact`, mailData);
  return response.data;
};

const sendFreeTour = async (mailData) => {
  const response = await axios.post(`${API_URL}free-tour`, mailData);
  return response.data;
};

const emailService = {
  sendBooking,
  sendContact,
  sendFreeTour,
};

export default emailService;
