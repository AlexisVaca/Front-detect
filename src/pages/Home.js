import React from 'react';
import { Link } from 'react-router-dom';
import Menu from '../components/menu';
import '../styles/home.css'; // Asegúrate de crear un archivo de estilos para la pantalla de bienvenida

const Welcome = () => {
  return (
    <div>
      <Menu />
      <div className="welcome-page">
        <header className="welcome-header">
          <h1>Bienvenido a Reconocimiento de Especies</h1>
        </header>
        <section className="welcome-description">
          <p>
            Esta aplicación te permite identificar y registrar avistamientos de diferentes especies
            utilizando imágenes. También puedes visualizar estadísticas detalladas y mapas de avistamientos.
          </p>
        </section>
        <section className="welcome-features">
          <h2>Características Principales</h2>
          <ul>
            <li>Identificación de especies a través de imágenes</li>
            <li>Registro de avistamientos con ubicación geográfica</li>
            <li>Visualización de estadísticas y gráficos</li>
            <li>Acceso a detalles específicos de cada especie</li>
          </ul>
        </section>
        <section className="welcome-get-started">
          <h2>Comienza Ahora</h2>
          <p>
            Para empezar, puedes crear una cuenta o iniciar sesión si ya tienes una.
          </p>
          <div className="welcome-buttons">
            <Link to="/register" className="btn btn-primary">Crear Cuenta</Link>
            <Link to="/" className="btn btn-secondary">Iniciar Sesión</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Welcome;