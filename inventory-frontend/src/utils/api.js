import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem("refresh");
                if (!refresh) throw new Error("No refresh token");

                const res = await axios.post(
                    `${BASE_URL}/api/token/refresh/`,
                    {
                        refresh,
                    }
                );

                localStorage.setItem("access", res.data.access);
                if (res.data.refresh) {
                    localStorage.setItem("refresh", res.data.refresh);
                }

                api.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${res.data.access}`;

                originalRequest.headers[
                    "Authorization"
                ] = `Bearer ${res.data.access}`;

                return api(originalRequest);
            } catch (err) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.replace("/");
            }
        }

        return Promise.reject(error);
    }
);

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;