import React, { useState, useEffect } from 'react';
import { getAiDecisions } from './services/apiService';

// Valeurs initiales (simulées)
const initialSensors = {
  Tair: 22.0,       // °C
  rH: 60.0,         // %
  PARin: 300.0,     // lux
  moisture: 700,    // 0-1023
  temp_sol: 20.0,   // °C (nommé 'temp' dans le dataset d'irrigation)
};

// Valeurs initiales des décisions (avant le premier appel)
const initialDecisions = {
  decision_vents: 0,
  decision_ombrage: 0,
  decision_volume_eau: 0.0,
};

function App() {
  const [sensors, setSensors] = useState(initialSensors);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [error, setError] = useState(null);

  // Ce 'useEffect' s'exécute toutes les 5 secondes pour simuler
  // de nouvelles données de capteurs et appeler l'IA.
  useEffect(() => {
    const interval = setInterval(() => {
      // --- 1. Simulation de nouvelles données ---
      const newSensors = {
        // La température fluctue
        Tair: parseFloat((sensors.Tair + Math.random() * 2 - 1).toFixed(1)), 
        // L'humidité du sol baisse lentement (sèche)
        moisture: Math.max(0, sensors.moisture - 5), 
        // L'humidité de l'air fluctue
        rH: parseFloat((sensors.rH + Math.random() * 4 - 2).toFixed(1)), 
        // La lumière fluctue
        PARin: parseFloat((sensors.PARin + Math.random() * 10 - 5).toFixed(1)),
        // La température du sol est stable
        temp_sol: sensors.temp_sol 
      };
      setSensors(newSensors);
      
      // --- 2. Appel à l'API Flask avec les nouvelles données ---
      getAiDecisions(newSensors)
        .then(response => {
          // Met à jour l'état avec les décisions de l'IA
          setDecisions(response.data);
          setError(null); // Efface les erreurs
        })
        .catch(err => {
          console.error("Erreur lors de l'appel API:", err);
          setError("Échec de la connexion au serveur IA.");
        });

    }, 5000); // Répète toutes les 5 secondes

    // Nettoyage de l'intervalle quand le composant est retiré
    return () => clearInterval(interval);

  }, [sensors]); // Se redéclenche si 'sensors' change

  // Fonctions d'aide pour l'affichage
  const formatVentStatus = (status) => 
    status === 1 ? <span className="decision-on">OUVERTS</span> : <span className="decision-off">FERMÉS</span>;
  
  const formatShadeStatus = (status) => 
    status === 1 ? <span className="decision-on">ACTIVÉ</span> : <span className="decision-off">DÉSACTIVÉ</span>;

  return (
    <div className="dashboard">
      <h1>Dashboard Serre Intelligente (IA)</h1>
      
      {error && <h3 style={{ color: 'red', textAlign: 'center' }}>{error}</h3>}

      <div className="panel-container">
        {/* Panneau 1: Données des capteurs en temps réel */}
        <div className="panel">
          <h2>Capteurs (Simulation en direct)</h2>
          <div className="sensor-grid">
            <div className="sensor-item">
              <strong>Température Air</strong>
              <span>{sensors.Tair.toFixed(1)} °C</span>
            </div>
            <div className="sensor-item">
              <strong>Humidité Air</strong>
              <span>{sensors.rH.toFixed(1)} %</span>
            </div>
            <div className="sensor-item">
              <strong>Luminosité (PAR)</strong>
              <span>{sensors.PARin.toFixed(1)} lux</span>
            </div>
            <div className="sensor-item">
              <strong>Humidité Sol</strong>
              <span>{sensors.moisture}</span>
            </div>
            <div className="sensor-item">
              <strong>Température Sol</strong>
              <span>{sensors.temp_sol.toFixed(1)} °C</span>
            </div>
          </div>
        </div>

        {/* Panneau 2: Décisions prises par l'IA */}
        <div className="panel">
          <h2>Décisions de l'IA (en direct)</h2>
          <div className="decision-grid">
            <div className="decision-item">
              <strong>Ouvrants (Aération)</strong>
              {formatVentStatus(decisions.decision_vents)}
            </div>
            <div className="decision-item">
              <strong>Filet d'Ombrage</strong>
              {formatShadeStatus(decisions.decision_ombrage)}
            </div>
            <div className="decision-item">
              <strong>Volume d'Irrigation</strong>
              <span className="decision-value">{decisions.decision_volume_eau} L/m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;