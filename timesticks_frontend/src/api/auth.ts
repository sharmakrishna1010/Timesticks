import api from './axios.js';

export const authApi = {
  signup: (data: { fullName: string; email: string; password: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  verifyOTP: (data: { userId: string; otp: string }) =>
    api.post('/auth/verifyOTP', data),

  resendOTP: (data: { userId: string; email: string }) =>
    api.post('/auth/resendOTP', data),
};
