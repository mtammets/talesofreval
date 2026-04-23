import axios from 'axios';

const API_URL = '/api/site-settings';

const adminRequest = (config) =>
  axios({
    withCredentials: true,
    ...config,
  });

const resolvePayload = (maybeToken, maybePayload) =>
  maybePayload === undefined ? maybeToken : maybePayload;

export const getSiteSettings = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const updateHeroSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/hero`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateStoryHeroSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/story-hero`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateServicePageHeroSiteSettings = async (
  serviceKey,
  tokenOrFormData,
  maybeFormData
) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/service-page-hero/${serviceKey}`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateServicePageContentSiteSettings = async (
  serviceKey,
  tokenOrFormData,
  maybeFormData
) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/service-page-content/${serviceKey}`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateServicesSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/services`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateTeamSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/team`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateReviewSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/review`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateContactPageSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/contact-page`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateFooterSiteSettings = async (tokenOrFormData, maybeFormData) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/footer`,
    data: resolvePayload(tokenOrFormData, maybeFormData),
  });
  return response.data;
};

export const updateFreeTourScheduleSiteSettings = async (tokenOrPayload, maybePayload) => {
  const response = await adminRequest({
    method: 'put',
    url: `${API_URL}/admin/free-tour-schedule`,
    data: resolvePayload(tokenOrPayload, maybePayload),
  });
  return response.data;
};

const siteSettingsService = {
  getSiteSettings,
  updateHeroSiteSettings,
  updateStoryHeroSiteSettings,
  updateServicePageHeroSiteSettings,
  updateServicePageContentSiteSettings,
  updateServicesSiteSettings,
  updateTeamSiteSettings,
  updateReviewSiteSettings,
  updateContactPageSiteSettings,
  updateFooterSiteSettings,
  updateFreeTourScheduleSiteSettings,
};

export default siteSettingsService;
