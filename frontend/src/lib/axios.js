import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});


export const useAxiosInterceptor = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return () => axiosInstance.interceptors.request.eject(interceptor);
  }, [getToken]);
};

export default axiosInstance;