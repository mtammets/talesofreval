import axios from 'axios';

const ADMIN_API_URL = '/api/admin';
const STORY_EVENTS_API_URL = '/api/story-events/admin';
const STORAGE_KEY = 'storyAdminAuth';
const ACTIVE_SESSION_MARKER = 'active';

export const getStoredStoryAdminAuth = () =>
  window.sessionStorage.getItem(STORAGE_KEY) || '';

export const setStoredStoryAdminAuth = (token) => {
  if (token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
};

const adminRequest = (config) =>
  axios({
    withCredentials: true,
    ...config,
  });

const resolvePayload = (maybeToken, maybePayload) =>
  maybePayload === undefined ? maybeToken : maybePayload;

const login = async (password) => {
  const response = await adminRequest({
    method: 'post',
    url: `${ADMIN_API_URL}/login`,
    data: { password },
  });

  setStoredStoryAdminAuth(ACTIVE_SESSION_MARKER);
  return response.data;
};

const logout = async () => {
  try {
    const response = await adminRequest({
      method: 'post',
      url: `${ADMIN_API_URL}/logout`,
    });

    return response.data;
  } catch (_error) {
    return null;
  } finally {
    setStoredStoryAdminAuth('');
  }
};

const getAdminSession = async () => {
  const response = await adminRequest({
    method: 'get',
    url: `${ADMIN_API_URL}/me`,
  });

  return response.data;
};

const listStoryEvents = async () => {
  const response = await adminRequest({
    method: 'get',
    url: STORY_EVENTS_API_URL,
  });

  return response.data;
};

const createStoryEvent = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'post',
    url: STORY_EVENTS_API_URL,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });

  return response.data;
};

const updateStoryEvent = async (tokenOrId, maybeId, maybeFormData) => {
  const id = maybeFormData === undefined ? tokenOrId : maybeId;
  const formData = maybeFormData === undefined ? maybeId : maybeFormData;
  const response = await adminRequest({
    method: 'put',
    url: `${STORY_EVENTS_API_URL}/${id}`,
    data: formData,
  });

  return response.data;
};

const deleteStoryEvent = async (tokenOrId, maybeId) => {
  const id = maybeId === undefined ? tokenOrId : maybeId;
  const response = await adminRequest({
    method: 'delete',
    url: `${STORY_EVENTS_API_URL}/${id}`,
  });

  return response.data;
};

const storyAdminService = {
  getAdminSession,
  login,
  logout,
  listStoryEvents,
  createStoryEvent,
  updateStoryEvent,
  deleteStoryEvent,
};

export default storyAdminService;
