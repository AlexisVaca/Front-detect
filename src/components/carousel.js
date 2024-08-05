import React, { useState, useEffect } from 'react';
import axios from '../api';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageCarousel = ({ idEspecie }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true); // Añadido para manejar el estado de carga
  const [error, setError] = useState(null); // Añadido para manejar errores

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`/api/especies/${idEspecie}/imagenes`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching species images:', error);
        setError('Error fetching images');
      } finally {
        setLoading(false); // Establecer el estado de carga en falso después de la llamada
      }
    };

    fetchImages();
  }, [idEspecie]);

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) return <div>Cargando imágenes...</div>; // Mensaje de carga
  if (error) return <div>{error}</div>; // Mensaje de error

  if (images.length === 0) return <div>No hay imágenes disponibles.</div>; // Mensaje si no hay imágenes

  return (
    <Carousel interval={3000} pause="hover">
      {chunkArray(images, 3).map((imageGroup, index) => (
        <Carousel.Item key={index}>
          <div className="d-flex justify-content-around">
            {imageGroup.map((image, idx) => (
              isValidURL(image.imagen_url) ? (
                <img
                  key={idx}
                  className="d-block w-100"
                  src={image.imagen_url}
                  alt={`Imagen ${index * 3 + idx + 1}`}
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              ) : (
                <p key={idx}>Imagen no disponible</p>
              )
            ))}
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

const chunkArray = (array, size) => {
  return array.reduce((acc, _, index) => {
    if (index % size === 0) {
      acc.push(array.slice(index, index + size));
    }
    return acc;
  }, []);
};

export default ImageCarousel;
