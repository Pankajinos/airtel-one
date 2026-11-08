import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const businessAPI = {
  createProfile: (data) => api.post('/business', data),
  getProfile: (id) => api.get(`/business/${id}`),
  getSampleLeads: () => api.get('/business/sample-leads'),
  generateProblems: (data) => api.post('/business/generate-problems', data),
  saveSelectedProducts: (data) => api.post('/business/save-selection', data),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
};

export const recommendationsAPI = {
  getRecommendations: (profile) => api.post('/recommendations', profile),
};

export const kycAPI = {
  uploadDocument: (formData) => api.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verify: (data) => api.post('/kyc/verify', data),
  getSpecimens: () => api.get('/kyc/specimens'),
  loadSpecimen: (specimenId) => api.post('/kyc/load-specimen', { specimenId }),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  getAllOrders: () => api.get('/orders'),
  updateProductStatus: (orderId, productId, stageIndex, customStatus) =>
    api.patch(`/orders/${orderId}/product-status`, { productId, stageIndex, customStatus }),
};

export default api;
