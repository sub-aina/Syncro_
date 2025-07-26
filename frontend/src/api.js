// api.js
import axios from "axios";

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Update with your backend URL
    withCredentials: true,
});

// Attach token automatically to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
