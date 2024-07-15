// src/components/Statistics.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const Statistics = () => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/statistics');
                const data = response.data;

                const species = data.map(item => item.species);
                const counts = data.map(item => item.count);

                setChartData({
                    labels: species,
                    datasets: [{
                        label: 'Número de avistamientos',
                        data: counts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)'
                    }]
                });
            } catch (error) {
                console.error('Error al obtener estadísticas:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <Bar data={chartData} />
        </div>
    );
};

export default Statistics;
