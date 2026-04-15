import axios from 'axios';

const API_URL = '/api/site-settings';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Basic ${token}`,
  },
});

export const getSiteSettings = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getAdminSiteSettings = async (token) => {
  const response = await axios.get(`${API_URL}/admin`, authHeaders(token));
  return response.data;
};

export const updateHeroSiteSettings = async (token, formData) => {
  const response = await axios.put(`${API_URL}/admin/hero`, formData, authHeaders(token));
  return response.data;
};

export const updateServicesSiteSettings = async (token, formData) => {
  const response = await axios.put(`${API_URL}/admin/services`, formData, authHeaders(token));
  return response.data;
};

export const updateTeamSiteSettings = async (token, formData) => {
  const response = await axios.put(`${API_URL}/admin/team`, formData, authHeaders(token));
  return response.data;
};

export const updateReviewSiteSettings = async (token, formData) => {
  const response = await axios.put(`${API_URL}/admin/review`, formData, authHeaders(token));
  return response.data;
};

export const updateFooterSiteSettings = async (token, formData) => {
  const response = await axios.put(`${API_URL}/admin/footer`, formData, authHeaders(token));
  return response.data;
};

const siteSettingsService = {
  getSiteSettings,
  getAdminSiteSettings,
  updateHeroSiteSettings,
  updateServicesSiteSettings,
  updateTeamSiteSettings,
  updateReviewSiteSettings,
  updateFooterSiteSettings,
};

export default siteSettingsService;
