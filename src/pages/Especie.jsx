import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api';
import Chart from 'chart.js/auto';
import ImageCarousel from '../components/carousel';
import Menu from '../components/menu';
import '../styles/Especie.css';

const EspecieDetail = () => {
  const { idEspecie } = useParams();
  const [especie, setEspecie] = useState(null);
  const [images, setImages] = useState([]);
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    fetchEspecieData();
    fetchImages();
    fetchChartData();
  }, [idEspecie]);

  const fetchEspecieData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/especies/${idEspecie}`);
      setEspecie(response.data[0]);
    } catch (error) {
      console.error('Error fetching species data:', error);
    }
  }, [idEspecie]);

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`/api/especies/${idEspecie}/imagenes`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching species images:', error);
    }
  }, [idEspecie]);

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`/api/especies/${idEspecie}/chartdata`);
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching species chart data:', error);
    }
  };

  useEffect(() => {
    fetchEspecieData();
    fetchImages();

  }, [fetchEspecieData, fetchImages]);

  useEffect(() => {
    if (chartData.length > 0 && chartRef.current) {
      renderChart(chartData);
    }
  }, [chartData]);

  const renderChart = (data) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Destruir el gráfico existente
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => new Date(item.mes).toLocaleString('default', { month: 'long', year: 'numeric' })),
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
              text: 'Mes'
            }
          }
        }
      }
    });
  };

  if (!especie) return <div>Cargando...</div>;

  return (
    <div>
      <Menu/>
      <div className="especie-detail">
        <h2>{especie.nombre_cientifico} ({especie.nombre_comun})</h2>
        <p>{especie.descripcion}</p>
        <p><strong>Estado de conservación:</strong> {especie.estado_conservacion}</p>
        <p><strong>Hábitat:</strong> {especie.habitat}</p>

        <h3>Imágenes de la Especie</h3>
        <ImageCarousel idEspecie={idEspecie} />

        <h3>Gráfico de Avistamientos Mensuales</h3>
        <canvas ref={chartRef} id="myChart" width="400" height="200"></canvas>

        <Link to="/logout" className="link-logout">Cerrar Sesión</Link>
      </div>
    </div>
  );
};

export default EspecieDetail;
