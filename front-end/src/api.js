import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
    baseURL: "/api"
});

api.interceptors.request.use(async(config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if(user) {
        const token = user ? await user.getIdToken() : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;