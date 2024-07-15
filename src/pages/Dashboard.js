// frontend/src/components/Statistics.js

import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Dashboard.</p>
      <Link to="/logout">Cerrar Sesión</Link>
    </div>
  );
};

export default Dashboard;
