// src/api.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://prueba-five-iota.vercel.app/', // URL base de tu API
    
    //baseURL: 'https://prueba-dkz9jlzsd-alexisvacas-projects.vercel.app/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;
