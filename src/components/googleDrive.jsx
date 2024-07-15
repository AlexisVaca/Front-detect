import axios from '../api';
import React, { useState, useCallback, useEffect } from 'react';
import Menu from '../components/menu';
import '../styles/googleDrive.css';

const FileUploadComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [detectionResults, setDetectionResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [totalFileSizeMB, setTotalFileSizeMB] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);


  const resultsPerPage = 6;

  useEffect(() => {
    // Función para obtener la ubicación actual del usuario
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    // Llamar a la función para obtener la ubicación al cargar el componente
    fetchLocation();
  }, []);

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(Array.from(files));
    calculateTotalFileSize(files);
  };

  const calculateTotalFileSize = (files) => {
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
    }
    const totalSizeMB = totalSize / (1024 * 1024);
    setTotalFileSizeMB(totalSizeMB.toFixed(2));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    setSelectedFiles(Array.from(files));
    setIsDragging(false);
    calculateTotalFileSize(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      alert(`No se seleccionó ningún archivo`);
      return;
    }

    if (!locationName.trim()) {
      alert(`El campo Nombre de la ubicación es requerido`);
      return;
    }
    if (latitude === 0 || longitude === 0) {
      alert(`Los campos Latitud y Longitud son requeridos`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = Array.from(selectedFiles);
      const detectionPromises = totalFiles.map(async (file) => {
        if (file.size > 4.5 * 1024 * 1024) {
          alert(`El archivo ${file.name} supera el límite permitido de 4.5MB`);
          return null; // Skip processing this file
        }

        const formData = new FormData();
        formData.append('image', file);

        const uploadResponse = await axios.post('/api/uploadDrive', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        });

        const thumbnailURL = uploadResponse.data.humbnailURL;

        const userId = localStorage.getItem('userId');
        console.log("usuario", userId);

        const detectResponse = await axios.post('/api/detect', {
          urlImagen: thumbnailURL,
          idUsuario: userId, // Replace with actual user ID or handle authentication properly
          ubicacion: locationName,
          latitud: latitude,
          longitud: longitude, // Location from where the species is detected
        });

        return detectResponse.data;
      });

      const detectionResponses = await Promise.all(detectionPromises.filter((promise) => promise !== null));
      setDetectionResults(detectionResponses.flatMap((response) => response.detections));
    } catch (error) {
      console.error('Error uploading or detecting files:', error);
      alert(`Error al procesar archivos. Por favor, intenta de nuevo más tarde.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFiles, locationName, latitude, longitude]); // Dependencia añadida a useCallback

  const handleUploadButtonClick = () => {
    handleUpload();
    clearSelectedFiles();
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setTotalFileSizeMB(0);
  }

  // Calcular índices de inicio y fin para la paginación
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = detectionResults.slice(indexOfFirstResult, indexOfLastResult);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Menu/>
      <div className="upload-page">
        <div className="file-upload-container">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
          ><label>
              Arrastra y suelta archivos aquí o haz clic para&nbsp;

              <span className="file-upload-text">Seleccionar archivos</span>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className='file-upload'
              />
            </label>
            <p>Tamaño total de archivos: {totalFileSizeMB} MB</p>
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>Archivos seleccionados:</h4>
                <ul>
                  {selectedFiles.slice(0, 4).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
                {selectedFiles.length > 4 && (
                  <p>y {selectedFiles.length - 4} archivo(s) más</p>
                )}
              </div>
            )}
          </div>



          <p />
          <div className='upload-form'>
            <div className='input-container'>
              <label>
                Nombre de la ubicación:
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Nombre de la ubicación"
                  className='full-width'
                  required
                />
              </label>
            </div>
            <div className="input-container inline">
              <label>
                Latitud:
                <div className="number-input">
                  <button onClick={() => setLatitude((prev) => parseFloat((prev - 0.1).toFixed(6)))}>-</button>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    placeholder="Latitud"
                    step="any"
                    required
                  />
                  <button onClick={() => setLatitude((prev) => parseFloat((prev + 0.1).toFixed(6)))}>+</button>
                </div>
              </label>
              <label>
                Longitud:
                <div className="number-input">
                  <button onClick={() => setLongitude((prev) => parseFloat((prev - 0.1).toFixed(6)))}>-</button>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    placeholder="Longitud"
                    step="any"
                    required
                  />
                  <button onClick={() => setLongitude((prev) => parseFloat((prev + 0.1).toFixed(6)))}>+</button>
                </div>
              </label>
            </div>

          </div>
          <div className='upload-buttons'>
            <button onClick={handleUploadButtonClick} disabled={isUploading} className='upload-button'>
              {isUploading ? 'Subiendo...' : 'Subir y Detectar'}
            </button>
            <button onClick={clearSelectedFiles} disabled={isUploading} className='cancel-button'>
              Cancelar
            </button>
          </div>

          {isUploading &&
            (<div className='file-upload-container'><progress className='file-upload-progress' value={uploadProgress} max="100">{uploadProgress}%</progress>
            </div>)}

          {detectionResults.length > 0 && (
            <div className='detection-results'>
              <h3>Resultados de Detección:</h3>
              <div className='detection-results-scrollable'>
                <div className='detection-container'>
                  {currentResults.map((result, index) => (
                    <div key={index} className='detection-item'>
                      <h4>Especie {index + 1}:</h4>
                      <div className='species-container'>
                        <img
                          src={result.urlImagen || ''}
                          alt={`Species ${index + 1}`}
                          className='species-image'
                        />
                        {result.box && (
                          <div
                            className='bounding-box'
                            style={{
                              left: `${result.box[0]}px`,
                              top: `${result.box[1]}px`,
                              width: `${result.box[2] - result.box[0]}px`,
                              height: `${result.box[3] - result.box[1]}px`,
                            }}
                          ></div>
                        )}
                      </div>
                      <p>Nombre: {result.nombreComun}</p>
                      <p>Confianza: {(result.confidence * 100).toFixed(2)}%</p>
                      <p>Bounding Box: {result.box.join(', ')}</p>
                      {/* Render bounding boxes on the image based on result.box */}
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  {Array.from({ length: Math.ceil(detectionResults.length / resultsPerPage) }, (_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)} style={{ margin: '5px' }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div>
  );
};

export default FileUploadComponent;
