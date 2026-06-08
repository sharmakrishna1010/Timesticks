import axios from 'axios';

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'x-timezone': userTimezone,
    }
});

export default api;