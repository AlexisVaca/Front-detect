import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../api'; // Asegúrate de tener axios configurado correctamente
import { useNavigate } from 'react-router-dom'; // Importa useNavigate desde react-router-dom
import '../styles/Login.css';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    //login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

            // Decodifica el token para obtener el ID de usuario
            const decodedToken = parseJwt(token); // Implementa esta función según tu método de decodificación
            const userId = decodedToken.id; // Extrae el ID de usuario del token

            // Guarda el ID de usuario en localStorage (opcional, dependiendo de tu implementación)
            localStorage.setItem('userId', userId);
            console.log("usuario", userId);
            // Redirige a la página de Dashboard o Home
            navigate('/home');
        } catch (error) {
            console.error('Error al hacer login:', error);
            toast.error('Credenciales inválidas. Por favor, inténtalo de nuevo.');
        }
    };

    const handleRegister = () => {
        setIsRegistering(!isRegistering); // Navega a la página de registro
    };


    // Función para decodificar el token JWT (ejemplo básico)
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    //Registro
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: ''
    });
    const [errors, setErrors] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors({
            ...errors,
            [name]: ''
        });
    };

    const validateForm = () => {
        let isValid = true;
        const errors = {};

        // Validating name (no special characters or numbers)
        if (!/^[A-Za-z\s]+$/.test(formData.nombre)) {
            errors.nombre = 'El nombre solo puede contener letras y espacios';
            isValid = false;
            toast.error('El nombre solo puede contener letras y espacios');
        }

        // Validating email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Correo electrónico no válido';
            isValid = false;
            toast.error('Correo electrónico no válido');
        }

        // Validating password (at least 8 characters with upper/lowercase, numbers, special characters)
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%$#@!*\-+]).{8,}/.test(formData.contraseña)) {
            errors.contraseña = 'La contraseña debe contener al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales (%$#@!*-+)';
            isValid = false;
            toast.error('La contraseña debe contener al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales (%$#@!*-+)');
        }

        // Validating password confirmation
        if (formData.contraseña !== formData.confirmarContraseña) {
            errors.confirmarContraseña = 'Las contraseñas no coinciden';
            isValid = false;
            toast.error('Las contraseñas no coinciden');
        }
        return isValid;
    };

    const handleSubmitR = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }



        try {
            // Send registration data to the server
            await axios.post('/api/usuarios', {
                nombre: formData.nombre,
                email: formData.email,
                contraseña: formData.contraseña,
            });

            setFormData({
                nombre: '',
                email: '',
                contraseña: '',
                confirmarContraseña: ''
            });
            toast.success('¡Registro Exitoso!')
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'El correo electrónico ya está registrado') {
                toast.error('El correo electrónico ya está registrado');
            } else {
                toast.error('Error al registrar. Por favor, inténtalo de nuevo.');
            }
        }
    };


    return (
        <div className='body'>
        <div className={`formulario ${isRegistering ? 'modo-registro' : ''}`}>

            <div className='form-content sign-up'>
                <form onSubmit={handleSubmitR} className="registration-form">
                    <h2>Registro de Usuario</h2>
                    <br />
                    <div className="input-container">
                        <input
                            type="text"
                            id="nombreR"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className='input-container__input'
                            required
                        />
                        <label for="nombreR" className='input-container__label'>Nombre</label>

                    </div>
                    <div className="input-container">
                        <input
                            type="email"
                            id="emailR"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className='input-container__input'
                            required
                        />
                        <label for="emailR" className='input-container__label'>Email</label>

                    </div>
                    <div className="input-container">
                        <input
                            type="password"
                            id="contraseñaR"
                            name="contraseña"
                            value={formData.contraseña}
                            onChange={handleChange}
                            className='input-container__input'
                            required
                        />
                        <label for="contraseñaR" className='input-container__label'>Contraseña</label>
                    </div>
                    <div className="input-container">
                        <input
                            type="password"
                            id="confirmarContraseñaR"
                            name="confirmarContraseña"
                            value={formData.confirmarContraseña}
                            onChange={handleChange}
                            className='input-container__input'
                            required
                        />
                        <label for="confirmarContraseñaR" className='input-container__label'>Confirmar contraseña</label>
                    </div>

                    <button type="submit" className="buttonL">Registrarse</button>
                </form>

            </div>
            <ToastContainer />
            <div className='form-content sign-in'>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <br />
                    <div className="input-container">
                        <input
                            id='email'
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='input-container__input'
                            required
                        />
                        <label for="email" className='input-container__label'>Email</label>
                    </div>
                    <div className="input-container">
                        <input
                            id='password'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='input-container__input'
                            required
                        />
                        <label for="password" className='input-container__label'>Contraseña</label>
                    </div>
                    <button type="submit" className="buttonL">Iniciar Sesión</button>
                </form>

            </div>
            <div className='toggle-container'>
                <div className='toggle'>
                    <div className='toggle-panel toggle-right'>
                        <h1 className='etiquetas'>Hey quieres ser parte del cuidado!</h1>
                        <p className='etiquetas'>Registra tus datos y accede al sitio</p>
                        <button type="button" onClick={handleRegister} className="buttonLS">Registrar</button>
                    </div>
                    <div className='toggle-panel toggle-left'>
                        <h1 className='etiquetas'>Bienvenido!</h1>
                        <p className='etiquetas'>Rellena tu información de registro o puedes volver al ingreso.</p>
                        <button type='button' onClick={handleRegister} className="buttonLS">Volver al Login</button>
                    </div>

                </div>
            </div>
        </div>
        </div>
    );
};

export default Login;
