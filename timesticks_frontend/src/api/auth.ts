import api from './axios.ts';

export const authApi = {
  signup: (data: { fullName: string; email: string; password: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  verifyMe: () => api.get('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),

  verifyOTP: (data: { userId: string; otp: string }) =>
    api.post('/auth/verifyOTP', data),

  resendOTP: (data: { userId: string; email: string }) =>
    api.post('/auth/resendOTP', data),

  resetPassword: (data: { email: string }) =>
    api.post('/auth/resetPassword', data),

  resetPasswordVerification: (data: { userId: string; otp: string; newPassword: string }) =>
    api.post('/auth/resetPasswordVerification', data),
};
