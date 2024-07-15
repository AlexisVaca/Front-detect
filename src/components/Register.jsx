import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import '../styles/Register.css';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

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
        }

        // Validating email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Correo electrónico no válido';
            isValid = false;
        }

        // Validating password (at least 8 characters with upper/lowercase, numbers, special characters)
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%$#@!*\-+]).{8,}/.test(formData.contraseña)) {
            errors.contraseña = 'La contraseña debe contener al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales (%$#@!*-+)';
            isValid = false;
        }

        // Validating password confirmation
        if (formData.contraseña !== formData.confirmarContraseña) {
            errors.confirmarContraseña = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleSubmit = async (event) => {
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

            setSuccessMessage('¡Registro exitoso!');
            setErrorMessage('');
            setIsSuccess(true);

            // Revert the background color after 3 seconds
            setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'El correo electrónico ya está registrado') {
                setErrorMessage('El correo electrónico ya está registrado');
            } else {
                setErrorMessage('Error al registrar. Por favor, inténtalo de nuevo.');
            }
            setSuccessMessage('');
            setIsSuccess(false);
        }
    };

    return (
        <div className='register-container'>
            <div className={`registration-form-container ${isSuccess ? 'success-container' : ''}`}>
                <h2>Registro de Usuario</h2>

                <form onSubmit={handleSubmit} className="registration-form">
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="form-group">
                        <div className="input-container">
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre" 
                            required
                        />
                        </div>
                        {errors.nombre && <p className="error-message">{errors.nombre}</p>}
                    </div>
                    <div className="form-group">
                        <div className="input-container">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Correo Electrónico" 
                            required
                        />
                        </div>
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <div className="input-container">
                        <input
                            type="password"
                            id="contraseña"
                            name="contraseña"
                            value={formData.contraseña}
                            onChange={handleChange}
                            placeholder="Contraseña" 
                            required
                        />
                        </div>
                        {errors.contraseña && <p className="error-message">{errors.contraseña}</p>}
                    </div>
                    <div className="form-group">
                        <div className="input-container">
                        <input
                            type="password"
                            id="confirmarContraseña"
                            name="confirmarContraseña"
                            value={formData.confirmarContraseña}
                            onChange={handleChange}
                            placeholder="Confirmar Contraseña" 
                            required
                        />
                        </div>
                        {errors.confirmarContraseña && <p className="error-message">{errors.confirmarContraseña}</p>}
                    </div>
                    <button type="submit" className="submit-button">Registrarse</button>
                </form>
                <button onClick={() => navigate('/')} className="back-button">Volver al Login</button>
            </div>
        </div>
    );
};

export default RegistrationForm;
