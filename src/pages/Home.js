import React from 'react';
import { FaCamera, FaMapMarkerAlt, FaChartBar, FaInfoCircle } from 'react-icons/fa'; // Íconos
import Menu from '../components/menu';
import '../styles/home.css'; 

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

        {/* Contenedor de características en tarjetas */}
        <section className="welcome-features">
          <div className="feature-card">
            <FaCamera />
            <span className="feature-text">Identificación de especies a través de imágenes</span>
          </div>
          <div className="feature-card">
            <FaMapMarkerAlt />
            <span className="feature-text">Registro de avistamientos con ubicación geográfica</span>
          </div>
          <div className="feature-card">
            <FaChartBar />
            <span className="feature-text">Visualización de estadísticas y gráficos</span>
          </div>
          <div className="feature-card">
            <FaInfoCircle />
            <span className="feature-text">Acceso a detalles específicos de cada especie</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Welcome;
