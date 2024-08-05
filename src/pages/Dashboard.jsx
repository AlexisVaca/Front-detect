import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import axios from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Menu from '../components/menu';
import '../styles/stadistics.css';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';
// Importación de las imágenes de los íconos
import markerIcon1 from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configura los iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon1,
  shadowUrl: markerShadow,
});

const Statistics = () => {
  const [chartData, setChartData] = useState([]);
  const [locations, setLocations] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchChartData();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get('/api/data');
      if (response.status !== 200) {
        throw new Error('Error al obtener datos');
      }
      const data = response.data;
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    if (chartData.length > 0) {
      renderChart(chartData);
    }
  }, [chartData]);

  const renderChart = (data) => {
    if (!data || !chartRef.current) return;

    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartRef.current.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.nombre_especie),
        datasets: [{
          label: 'Cantidad de Avistamientos',
          data: data.map(item => item.cantidad_avistamientos),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Avistamientos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Especies'
            }
          }
        }
      }
    });
  };

  const defaultCenter = [0.5, -78.5];

  return (
    <div className='top'>
      <div className='pegote'>
        <Menu/>
      </div>
      
      <div className='stats-page'>
        
        <div className='stats-page'>
          <h1>Estadísticas de Avistamientos por Especie</h1>
          <div className='chart-container'>
            <MapContainer center={defaultCenter} zoom={10} style={{ height: '400px' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MarkerClusterGroup>
        {locations.length > 0 && locations.map((location, index) => (
          (typeof location.latitud === 'number' && typeof location.longitud === 'number') &&
          <Marker key={index} position={[location.latitud, location.longitud]}>
            <Popup>
              <strong>Especie:</strong> {location.nombre_especie}<br />
              <strong>Ubicación: </strong> {location.nombre_ubicacion}<br />
              <strong>Cantidad de Avistamientos: </strong> {location.cantidad_avistamientos}<br />
              <Link to={`/especie/${location.id_especie}`}>Detalles</Link>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
            </MapContainer>
          </div>
          <div className='chart-container'>
            <canvas ref={chartRef} id='myChart' width='400' height='200'></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
