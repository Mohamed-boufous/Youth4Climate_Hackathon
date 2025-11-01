import React, { useState, useEffect, useCallback, useRef } from 'react';
import ManualInputForm from './ManualInputForm.jsx';
import SensorSettings from './SensorSettings.jsx';
import SensorDisplay from './SensorDisplay.jsx';
import DecisionDisplay from './DecisionDisplay.jsx';
import { getAiDecisions } from './services/apiService.jsx';

// Valeurs initiales (simulées)
const initialSensors = {
  Tair: 30,
  rH: 60.0,
  PARin: 300.0,
  moisture: 640,
  temp_sol: 20.0,
};

// Valeurs initiales des décisions
const initialDecisions = {
  decision_vents: 0,
  decision_ombrage: 0,
  decision_volume_eau: 0.0,
};

// Intervalle de 30 minutes en millisecondes
const THIRTY_MIN_INTERVAL = 1000 * 60 * 30;
const SIMULATION_INTERVAL = 5000; // 5 secondes

function Simulation() {
  const [liveSensors, setLiveSensors] = useState({ ...initialSensors, source: 'simulation' });
  const [manualSensors, setManualSensors] = useState({ ...initialSensors, source: 'manual' });
  const [decisions, setDecisions] = useState(initialDecisions);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState('sensors'); // 'sensors' | 'manual'
  const [updateFrequency, setUpdateFrequency] = useState('instant'); // 'instant' | 'interval'

  const sensorsRef = useRef(liveSensors);
  useEffect(() => { sensorsRef.current = liveSensors; }, [liveSensors]);

  const fetchDecisions = useCallback((dataToApi) => {
    const { source, ...apiData } = dataToApi;
    getAiDecisions(apiData)
      .then(response => {
        setDecisions(response.data);
        setError(null);
      })
      .catch(err => {
        console.error("Erreur lors de l'appel API:", err);
        setError("Échec de la connexion au serveur IA.");
      });
  }, []);

  // Simulation capteurs (UI)
  useEffect(() => {
    if (inputMode !== 'sensors') return;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const simulationTimer = setInterval(() => {
      setLiveSensors(prev => ({
        Tair: parseFloat((prev.Tair + Math.random() * 2 - 1).toFixed(1)),
        moisture: clamp(prev.moisture - 5, 0, 1023),
        rH: clamp(parseFloat((prev.rH + Math.random() * 4 - 2).toFixed(1)), 0, 100),
        PARin: Math.max(0, parseFloat((prev.PARin + Math.random() * 10 - 5).toFixed(1))),
        temp_sol: prev.temp_sol,
        source: 'simulation',
      }));
    }, SIMULATION_INTERVAL);
    return () => clearInterval(simulationTimer);
  }, [inputMode]);

  // Appel API: mode instantané
  useEffect(() => {
    if (inputMode === 'sensors' && updateFrequency === 'instant') {
      fetchDecisions(liveSensors);
    }
  }, [inputMode, updateFrequency, liveSensors, fetchDecisions]);

  // Appel API: mode intervalle (30 min)
  useEffect(() => {
    if (inputMode !== 'sensors' || updateFrequency !== 'interval') return;
    fetchDecisions(sensorsRef.current);
    const apiTimer = setInterval(() => {
      fetchDecisions(sensorsRef.current);
    }, THIRTY_MIN_INTERVAL);
    return () => clearInterval(apiTimer);
  }, [inputMode, updateFrequency, fetchDecisions]);

  // Soumission manuelle
  const handleManualSubmit = (manualData) => {
    const dataWithSource = { ...manualData, source: 'manual' };
    setManualSensors(dataWithSource);
    fetchDecisions(dataWithSource);
  };

  // Rafraîchir en changeant de mode
  useEffect(() => {
    if (inputMode === 'sensors') fetchDecisions(liveSensors);
    if (inputMode === 'manual') fetchDecisions(manualSensors);
  }, [inputMode]); // volontairement minimal

  const fields = Object.keys(initialSensors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
            Dashboard Serre Intelligente
          </h1>
          <p className="text-sm text-gray-600 font-semibold">Système de gestion par Intelligence Artificielle</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span>
              Configuration de l'Entrée
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4">
              <label
                className={`flex-1 min-w-[200px] cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  inputMode === 'sensors'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="sensors"
                    checked={inputMode === 'sensors'}
                    onChange={(e) => setInputMode(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <span>📡</span>
                      Utiliser les capteurs
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Données en temps réel</div>
                  </div>
                </div>
              </label>

              <label
                className={`flex-1 min-w-[200px] cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  inputMode === 'manual'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="manual"
                    checked={inputMode === 'manual'}
                    onChange={(e) => setInputMode(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <span>✍️</span>
                      Saisie manuelle
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Entrée personnalisée</div>
                  </div>
                </div>
              </label>
            </div>

            {inputMode === 'sensors' && (
              <div className="pt-4 border-t border-gray-200">
                <SensorSettings
                  frequency={updateFrequency}
                  onChangeFrequency={setUpdateFrequency}
                  intervalSeconds={SIMULATION_INTERVAL / 1000}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-y-8 lg:gap-y-0 lg:gap-x-24 xl:gap-x-32">
          <div className="flex-1 max-w-3xl space-y-6">
            {inputMode === 'manual' ? (
              <ManualInputForm
                initialData={manualSensors}
                onSubmit={handleManualSubmit}
                fields={fields}
              />
            ) : (
              <SensorDisplay sensors={liveSensors} />
            )}
          </div>

          <div className="w-full lg:w-auto lg:ml-auto space-y-6">
            <DecisionDisplay decisions={decisions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Simulation;