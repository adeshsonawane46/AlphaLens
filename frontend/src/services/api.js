import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, fullName) => api.post('/auth/register', { email, password, fullName })
};

export const analysisService = {
  analyze: (ticker) => api.post('/analysis/analyze', { ticker }),
  getReport: (ticker) => api.get(`/analysis/report/${ticker}`),
  getLogs: (ticker) => api.get(`/analysis/logs/${ticker}`),
  getHistory: () => api.get('/analysis/history'),
  autocomplete: (query) => api.get(`/analysis/autocomplete?q=${query}`),
  compareCompanies: () => api.get('/analysis/compare'),
  ask: (ticker, question) => api.post('/analysis/ask', { ticker, question })
};

export const watchlistService = {
  get: (userId) => api.get(`/watchlist/${userId}`),
  add: (userId, companyId) => api.post('/watchlist/add', { userId, companyId }),
  remove: (userId, companyId) => api.post('/watchlist/remove', { userId, companyId })
};

export const simulationService = {
  get: (userId) => api.get(`/simulation/${userId}`),
  save: (userId, companyId, parameters, resultScore) => 
    api.post('/simulation/save', { userId, companyId, parameters, resultScore })
};

export default api;
