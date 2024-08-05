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
  //const [currentPage, setCurrentPage] = useState(1);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [noDetectionFiles, setNoDetectionFiles] = useState([]);
  const [noDetectionsMessage, setNoDetectionsMessage] = useState('');

  //const resultsPerPage = 6;

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
    if (files.length + selectedFiles.length > 10) {
      alert('No puedes subir más de 10 archivos.');
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
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
    if (files.length + selectedFiles.length > 10) {
      alert('No puedes subir más de 10 archivos.');
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
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

  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, { type: file.type });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
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
    setNoDetectionFiles([]); // Limpiar lista de imágenes sin detección

    try {
      const totalFiles = Array.from(selectedFiles);
      const detectionPromises = totalFiles.map(async (file) => {
        try {
          const compressedFile = await compressImage(file);
          if (compressedFile.size > 4.5 * 1024 * 1024) {
            alert(`El archivo ${compressedFile.name} supera el límite permitido de 4.5MB`);
            return null; // Skip processing this file
          }
          const formData = new FormData();
          formData.append('image', compressedFile);

          const uploadResponse = await axios.post('/api/uploadDrive', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            },
          });
          const fileId = uploadResponse.data.fileId;
          const thumbnailURL = `https://lh3.googleusercontent.com/d/${fileId}=w800`;

          const userId = localStorage.getItem('userId');
          const detectResponse = await axios.post('/api/detect', {
            urlImagen: thumbnailURL,
            idUsuario: userId, // Replace with actual user ID or handle authentication properly
            ubicacion: locationName,
            latitud: latitude,
            longitud: longitude, // Location from where the species is detected
          });
          const detections = detectResponse.data.detections;

          if (detections.length === 0) {
            // Si no hay detecciones, añade la imagen a noDetectionFiles
            return { file, detections: [] };
          } else {
            return { file, detections };
          }

        } catch (error) {
          console.error('Error uploading or detecting file:', error);
        }
      });

      const detectionResponses = await Promise.all(detectionPromises);

      const flatDetectionResults = detectionResponses.flatMap((response) => response?.detections || []);
      const noDetectionFilesList = detectionResponses
        .filter((response) => response?.detections.length === 0)
        .map((response) => ({
          name: response.file.name,
          url: URL.createObjectURL(response.file),
        }));

      if (flatDetectionResults.length === 0 && noDetectionFilesList.length === 0) {
        setNoDetectionsMessage('No se detectaron especies en las imágenes subidas.');
      } else {
        setDetectionResults(flatDetectionResults);
        setNoDetectionFiles(noDetectionFilesList); // Actualiza la lista de imágenes sin detección
      }

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
  //const indexOfLastResult = currentPage * resultsPerPage;
  //const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  //const currentResults = detectionResults.slice(indexOfFirstResult, Math.min(indexOfLastResult, detectionResults.length));

  /*const handlePageChange = (page) => {
    if (page < 1) return; // No permitir páginas menores a 1
    if (page > Math.ceil(detectionResults.length / resultsPerPage)) return; // No permitir páginas mayores al total de páginas

    setCurrentPage(page);
  };*/


  const handleBoundingBoxStyle = (boundingBox, imageWidth, imageHeight) => {
    const [x1, y1, x2, y2] = boundingBox;
    const width = x2 - x1;
    const height = y2 - y1;

    return {
      left: `${(x1 / imageWidth) * 100}%`,
      top: `${(y1 / imageHeight) * 100}%`,
      width: `${(width / imageWidth) * 100}%`,
      height: `${(height / imageHeight) * 100}%`,
    };
  };

  return (
    <div>
      <div className='pegote'>
      <Menu/>
      </div>
      
      <div className='body'>
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

                    {selectedFiles.length > 4 && (
                      <p>y {selectedFiles.length - 4} archivo(s) más</p>
                    )}
                  </ul>
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
                {isUploading ? `Subiendo...  ${uploadProgress}%` : 'Subir Imagenes'}
              </button>
              <button onClick={clearSelectedFiles} disabled={isUploading} className='cancel-button'>
                Cancelar
              </button>

            </div>
            {isUploading &&
              (<div className='file-upload-container'><progress className='file-upload-progress' value={uploadProgress} max="100">{uploadProgress}%</progress>
              </div>)}
            {noDetectionsMessage && <p>{noDetectionsMessage}</p>}


            <div className='detection-results'>
              {detectionResults.length > 0 && (
                <div>
                  <h3>Resultados de Detección:</h3>
                  <div className='detection-results-scrollable'>
                    <div className='detection-container'>
                      {detectionResults.map((result, index) => (
                        <div key={index} className='detection-item'>
                          <div className='species-container'>
                            <div className='card'>
                              <div className='image-box'>
                              
                                <img
                                  src={result.urlImagen || ''}  
                                  alt={`Species ${index + 1}`}
                                  className="result-image"
                                  id={`image-${index}`}
                                  onLoad={(e) => {
                                    const imgElement = e.target;
                                    const boundingBoxStyle = handleBoundingBoxStyle(result.box, imgElement.naturalWidth, imgElement.naturalHeight);
                                    const boundingBox = imgElement.nextElementSibling;
                                    if (boundingBox) {
                                      Object.assign(boundingBox.style, boundingBoxStyle);
                                    }
                                  }}
                                />

                                {result.box && (
                                  <div
                                    className='bounding-box'
                                  ></div>
                                )}
                              </div>
                              <div className='content'>
                                <h2>{result.nombreComun}</h2>
                                <p>Confianza: {(result.confidence * 100).toFixed(2)}%</p>
                                <p>Bounding Box: {result.box.join(', ')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Render bounding boxes on the image based on result.box */}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              )}
              {noDetectionFiles.length > 0 && (
                <div>
                  <h3>Imágenes sin detección:</h3>

                  <div className='detection-results-scrollable'>
                    <div className='detection-container'>
                      {noDetectionFiles.map((file, index) => (
                        <div key={index} className='detection-item'>
                          <div className='species-container'>
                            <div className='card'>
                              <div className='image-box'>
                                <img src={file.url} alt={`Sin detección ${index + 1}`} className="result-image" />

                              </div>
                              <div className='content'>
                                <p>{file.name}</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </div>
  );
};

export default FileUploadComponent;