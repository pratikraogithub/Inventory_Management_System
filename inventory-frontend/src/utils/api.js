

import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api/", // adjust if needed
});

// Add interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // if unauthorized (401) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem("refresh");
                if (!refresh) throw new Error("No refresh token");

                const res = await axios.post("http://localhost:8000/api/token/refresh/", {
                    refresh,
                });

                localStorage.setItem("access", res.data.access);
                api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
                originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;

                return api(originalRequest); // retry original request
            } catch (err) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login"; // force logout
            }
        }

        return Promise.reject(error);
    }
);

// Always attach access token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

