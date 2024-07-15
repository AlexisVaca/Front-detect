// Menu.jsx

import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from '../api';
import '../styles/menu.css'; // Importamos estilos CSS personalizados
const Menu = () => {
  const [especies, setEspecies] = useState([]);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  useEffect(() => {
    fetchEspecies();
  }, []);

  const fetchEspecies = async () => {
    try {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage
      const response = await axios.get('/api/especies', {
        headers: {
          Authorization: `Bearer ${token}` // Incluir el token en el encabezado
        }
      });
      setEspecies(response.data);
    } catch (error) {
      console.error('Error fetching especies:', error);
    }
  };

  return (
    <nav className="menu-container">
      <ul className="menu-list">
        <li className="menu-item">
          <Link to="/" className="menu-link">
            Inicio
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/dashboard" className="menu-link">
            Dashboard
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/upload" className="menu-link">
            Subir Archivos
          </Link>
        </li>
        <li
          className="menu-item"
          onMouseEnter={() => setIsSubMenuOpen(true)}
          onMouseLeave={() => setIsSubMenuOpen(false)}
        >
          <span className="menu-link">Estadísticas</span>
          {isSubMenuOpen && (
            <ul className="submenu-list">
              {especies.map((especie) => (
                <li key={especie.id} className="submenu-item">
                  <Link to={`/especie/${especie.id}`} className="submenu-link">
                    {especie.nombre_comun}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className="menu-item menu-item-right">
          <Link to="/logout" className="menu-link">
            Cerrar Sesión
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;