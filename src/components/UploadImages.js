import axios from 'axios';

const uploadFileToDrive = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Realiza la solicitud POST al endpoint /api/uploadDrive
        const response = await axios.post('https://prueba-five-iota.vercel.app/api/uploadDrive', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Manejar la respuesta
        console.log('File uploaded successfully:', response.data);
        const { message, fileId, webViewLink, webContentLink, thumbnailURL } = response.data;

        // Puedes utilizar estos valores según lo necesites en tu aplicación
        console.log(`Message: ${message}`);
        console.log(`File ID: ${fileId}`);
        console.log(`Web View Link: ${webViewLink}`);
        console.log(`Web Content Link: ${webContentLink}`);
        console.log(`Thumbnail URL: ${thumbnailURL}`);

        // Retorna los datos de la respuesta si es necesario
        return response.data;

    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export default uploadFileToDrive;
