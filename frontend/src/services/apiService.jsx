import axios from 'axios';

// L'URL de votre API Flask.
// 'http://127.0.0.1:5000' est l'adresse de votre backend
const API_URL = 'http://127.0.0.1:5000';

/**
 * Appelle l'API de prédiction avec les données des capteurs.
 * @param {object} sensorData - Les données des capteurs
 * @returns {Promise<object>} - La réponse JSON de l'API avec les décisions
 */
export const getAiDecisions = (sensorData) => {
  return axios.post(`${API_URL}/predict`, sensorData);
};