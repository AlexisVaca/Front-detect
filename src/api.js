// src/api.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://prueba-five-iota.vercel.app/', // URL base de tu API
    
    //baseURL: 'https://prueba-dkz9jlzsd-alexisvacas-projects.vercel.app/',
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

export default instance;
