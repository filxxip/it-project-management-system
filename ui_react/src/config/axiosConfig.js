import axios from "axios";
import config from "./config";

const api = axios.create({
  baseURL: config.BASE_URL,
  withCredentials: true,
});

const setupInterceptors = (startLoading, stopLoading, setError) => {
  api.interceptors.request.use(
    (config) => {
      startLoading();
      return config;
    },
    (error) => {
      stopLoading();
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => {
      stopLoading();
      return response;
    },
    (error) => {
      stopLoading();
      if (error.response && error.response.status === 403) {
        setError(true);
      }
      return Promise.reject(error);
    },
  );
};

export { api, setupInterceptors };
