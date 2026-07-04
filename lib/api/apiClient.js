import axios from 'axios';
import Cookies from 'js-cookie';

// Setup base configuration to match your Express backend
const apiClient = axios.create({
  // Matches your PORT=8000 and the app.use('/api/v1', apiRoutes) in your app.js
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
  // Matches the credentials: true in your CORS config
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR (Auto-Refresh Logic)
// ==========================================
apiClient.interceptors.response.use(
  (response) => response.data, 
  
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 Unauthorized
    // IMPORTANT: Skip refresh for auth endpoints themselves (login returns 401 on wrong password!)
    const isAuthRoute = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        
        if (!refreshToken) {
          // No refresh token = guest user or truly logged out.
          // Reset the refresh state so future requests aren't stuck in the queue.
          isRefreshing = false;
          processQueue(new Error('No refresh token'), null);
          // Don't redirect to /login — just let the request fail silently
          // so the page can handle it gracefully (e.g. show sign-in prompt).
          return Promise.reject(error.response?.data || error);
        }

        // Hit the /api/v1/auth/refresh endpoint to get new tokens
        const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        Cookies.set('accessToken', newAccessToken, { expires: 1, secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Only redirect to login if we actually had a refresh token that failed —
        // meaning the session truly expired, not that the user is just a guest.
        if (typeof window !== 'undefined') {
          window.location.href = '/login'; 
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;