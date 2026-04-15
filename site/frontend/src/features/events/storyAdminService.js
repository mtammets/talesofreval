import axios from 'axios';

const API_URL = '/api/story-events/admin';
const STORAGE_KEY = 'storyAdminAuth';

export const getStoredStoryAdminAuth = () =>
  window.sessionStorage.getItem(STORAGE_KEY) || '';

export const setStoredStoryAdminAuth = (token) => {
  if (token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
};

const authHeaders = (token) => ({
  headers: {
    Authorization: `Basic ${token}`,
  },
});

const listStoryEvents = async (token) => {
  const response = await axios.get(API_URL, authHeaders(token));
  return response.data;
};

const createStoryEvent = async (token, formData) => {
  const response = await axios.post(API_URL, formData, authHeaders(token));
  return response.data;
};

const updateStoryEvent = async (token, id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, authHeaders(token));
  return response.data;
};

const deleteStoryEvent = async (token, id) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeaders(token));
  return response.data;
};

const storyAdminService = {
  listStoryEvents,
  createStoryEvent,
  updateStoryEvent,
  deleteStoryEvent,
};

export default storyAdminService;
