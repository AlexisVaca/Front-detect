// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simulamos la autenticación, podrías reemplazarlo con tu lógica real
const isAuthenticated = () => {
    // Aquí puedes verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    return !!token; // Retorna true si hay un token, false si no lo hay
};

const PrivateRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
