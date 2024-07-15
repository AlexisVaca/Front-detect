import React, { useState } from 'react';
import axios from '../api'; // Asegúrate de tener axios configurado correctamente
import { useNavigate } from 'react-router-dom'; // Importa useNavigate desde react-router-dom
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Obtiene la función navigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/login', {
                email,
                contraseña: password,
            });
            const { token } = response.data; // Extrae el token de la respuesta
            console.log('Login exitoso. Token:', token);

            // Guarda el token en localStorage
            localStorage.setItem('token', token);

            // Redirige a la página de Dashboard o Home
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al hacer login:', error);
            setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
        }
    };

    const handleRegister = () => {
        navigate('/register'); // Navega a la página de registro
    };

    return (
        <div className="login-container">
            <div className="content-container">
                <div className="welcome-banner">
                    <h1>Bienvenido</h1>
                    <p>Estamos encantados de verte de nuevo. Por favor, inicia sesión para continuar.</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-container">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required 
                        />
                    </div>
                    <div className="input-container">
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Contraseña" 
                            required 
                        />
                    </div>
                    <button type="submit" className="login-button">Iniciar Sesión</button>
                    <button type="button" className="register-button" onClick={handleRegister}>Registrarse</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
