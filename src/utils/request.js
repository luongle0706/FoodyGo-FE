import axios from 'axios';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';

const request = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
    // withCredentials: true,
});

export const get = async (url, params = {}) => {
    const response = await request.get(url, params);

    return response.data;
};

export const post = async (url, params = {}) => {
    const response = await request.post(url, params);

    return response.data;
};

export const put = async (url, params = {}) => {
    const response = await request.put(url, params);

    return response.data;
};

const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:8080/api/v1/public/refresh-token', {}, {
            headers: { 'RefreshToken': refreshToken }
        });

        localStorage.setItem('accessToken', response.data.token);
        return response.data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return null;
    }
};

request.interceptors.request.use(async function (config) {
    const publicUrls = [
        '/api/v1/public/login',
        '/api/v1/public/register',
        '/api/v1/public/refresh-token',
        '/api/v1/public/logout',
        '/api/v1/public//oauth2-token'
    ];

    if (publicUrls.some(url => config.url.includes(url))) {
        return config;
    }

    let token = localStorage.getItem('accessToken');

    if (token) {
        const user = jwtDecode(token);
        
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        console.log("token het han r", isExpired);

        if (isExpired) {
            token = await refreshAccessToken();
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});


// request.interceptors.response.use(response => {
//     return response.data;
// }, error => {
//     return Promise.reject(error);
// });
