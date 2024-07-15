// src/App.js
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Upload from './components/googleDrive';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PrivateRoutes from './components/PrivateRoutes';
import Logout from './components/Logout';
import Register from './components/Register';

function App(){
    return (
      <div className='App'>
        <Router>
          <Routes>
            <Route exact path='/' Component={Login}/>
            <Route path='/home' Component={Home}/>
            <Route path='/upload' Component={Upload}/>
            <Route path='/register' Component={Register}/>
            <Route element={<PrivateRoutes/>}>
              <Route element={<Dashboard/>} path='dashboard' />
            </Route>
            <Route path="/logout" element={<Logout />} />
            </Routes>
      </Router>
      </div>
    );
};

export default App;
