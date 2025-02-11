// src/components/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Elimina el token del localStorage
        localStorage.removeItem('token');
        // Redirige a la página de inicio de sesión
        navigate('/');
    }, [navigate]);

    return null;
};

export default Logout;
