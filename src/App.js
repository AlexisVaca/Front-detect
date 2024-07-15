// src/App.js
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Upload from './components/googleDrive';
import Dashboard from './pages/Dashboard';
import PrivateRoutes from './components/PrivateRoutes';
import Logout from './components/Logout';
import Register from './components/Register';
import EspecieDetail from './pages/Especie'; // Asumiendo que este es tu componente de detalle de especie
import 'leaflet/dist/leaflet.css';

function App(){
    return (
      <div className='App'>
        <Router>
          <Routes>
            <Route exact path='/' Component={Login}/>
            <Route path='/register' Component={Register}/>
            <Route element={<PrivateRoutes/>}>
              <Route element={<Dashboard/>} path='dashboard' />
            </Route>
            <Route element={<PrivateRoutes/>}>
              <Route element={<Upload/>} path='upload' />
            </Route>
            <Route element={<PrivateRoutes/>}>
              <Route element={<EspecieDetail/>} path='especie/:idEspecie' />
            </Route>
            <Route path="/logout" element={<Logout />} />
            </Routes>
      </Router>
      </div>
    );
};

export default App;
