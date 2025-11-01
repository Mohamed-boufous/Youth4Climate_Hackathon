import { useEffect, useState } from "react";
import { Sprout, Activity, Satellite, Keyboard } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:5000";

const initFactors = () => ({
  N: Math.floor(Math.random() * 141),
  P: Math.floor(Math.random() * 141),
  K: Math.floor(Math.random() * 201),
  temperature: parseFloat((10 + Math.random() * 30).toFixed(1)),
  humidity: parseFloat((30 + Math.random() * 65).toFixed(1)),
  ph: parseFloat((4 + Math.random() * 4).toFixed(2)),
  rainfall: parseFloat((10 + Math.random() * 300).toFixed(1)),
});

export default function CropRecommendation() {
  // Démarre par les capteurs
  const [inputMode, setInputMode] = useState("sensors"); // 'sensors' | 'manual'
  const [factors, setFactors] = useState(initFactors());
  const [prediction, setPrediction] = useState(null);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSensors, setFetchingSensors] = useState(false);
  const [error, setError] = useState(null);

  const fields = [
    { key: "N", label: "Azote (N)", step: 1 },
    { key: "P", label: "Phosphore (P)", step: 1 },
    { key: "K", label: "Potassium (K)", step: 1 },
    { key: "temperature", label: "Température (°C)", step: 0.1 },
    { key: "humidity", label: "Humidité (%)", step: 0.1 },
    { key: "ph", label: "pH", step: 0.01 },
    { key: "rainfall", label: "Pluviométrie (mm)", step: 0.1 },
  ];

  const fetchFromSensors = async () => {
    setFetchingSensors(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/crop/factors`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET /api/crop/factors -> ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
      const missing = keys.filter((k) => !(k in data));
      if (missing.length) throw new Error(`Champs manquants: ${missing.join(", ")}`);
      setFactors({
        N: Number(data.N),
        P: Number(data.P),
        K: Number(data.K),
        temperature: Number(data.temperature),
        humidity: Number(data.humidity),
        ph: Number(data.ph),
        rainfall: Number(data.rainfall),
      });
    } catch (e) {
      setError(e?.message || "Erreur lors du chargement des capteurs.");
    } finally {
      setFetchingSensors(false);
    }
  };

  useEffect(() => {
    if (inputMode === "sensors") fetchFromSensors();
  }, [inputMode]);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setTop3([]);
    try {
      const res = await fetch(`${API_BASE}/api/crop/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(factors),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST /api/crop/recommend -> ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      setPrediction(data.label || null);
      setTop3(Array.isArray(data.top3) ? data.top3 : []);
    } catch (e) {
      setError(e?.message || "Erreur de connexion au backend.");
    } finally {
      setLoading(false);
    }
  };

  const isSensors = inputMode === "sensors";

  return (
    <div className="min-h-screen bg-black text-green-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-5xl text-center">
          Recommandation{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
            de culture (IA)
          </span>
        </h1>
        <p className="text-green-300/70 text-center mt-3">
          Commencez avec les données capteurs ou passez en simulation manuelle.
        </p>

        {/* Sélecteur de mode */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setInputMode("sensors")}
            className={`px-4 py-2 rounded-md border transition-colors inline-flex items-center gap-2 ${
              isSensors
                ? "border-green-500 bg-green-900/30 text-green-100"
                : "border-green-800 text-green-300 hover:bg-green-900/10"
            }`}
          >
            <Satellite size={16} className="text-green-400" />
            Données capteurs
          </button>
          <button
            onClick={() => setInputMode("manual")}
            className={`px-4 py-2 rounded-md border transition-colors inline-flex items-center gap-2 ${
              !isSensors
                ? "border-green-500 bg-green-900/30 text-green-100"
                : "border-green-800 text-green-300 hover:bg-green-900/10"
            }`}
          >
            <Keyboard size={16} className="text-green-400" />
            Simulation manuelle
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-green-800/40 bg-black/60 shadow-[0_0_30px_-12px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-green-900/40">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Activity className="text-green-500" size={20} />
              Facteurs d’entrée
            </h2>

            {isSensors ? (
              <button
                onClick={fetchFromSensors}
                disabled={fetchingSensors}
                className="text-sm px-3 py-2 rounded-md border border-green-700/70 text-green-200 hover:bg-green-900/20 transition-colors disabled:opacity-60"
              >
                {fetchingSensors ? "Lecture capteurs..." : "Recharger depuis capteurs"}
              </button>
            ) : (
              <button
                onClick={() => setFactors(initFactors())}
                className="text-sm px-3 py-2 rounded-md border border-green-700/70 text-green-200 hover:bg-green-900/20 transition-colors"
              >
                Valeurs aléatoires
              </button>
            )}
          </div>

          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="text-sm text-green-300/80">{f.label}</span>
                <input
                  type="number"
                  step={f.step}
                  value={factors[f.key]}
                  onChange={(e) =>
                    setFactors((prev) => ({
                      ...prev,
                      [f.key]: Number(e.target.value),
                    }))
                  }
                  disabled={isSensors}
                  className={`mt-1 w-full bg-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-600/60 ${
                    isSensors
                      ? "text-green-300 border-green-900 cursor-not-allowed"
                      : "text-green-100 border-green-800 focus:border-green-500"
                  }`}
                />
              </label>
            ))}
          </div>

          {isSensors && (
            <div className="px-5 pb-2 text-xs text-green-300/70">
              Source: valeurs issues des capteurs (GET /api/crop/factors).
            </div>
          )}

          <div className="px-5 pb-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-black font-medium py-3 px-6 rounded-md shadow shadow-emerald-800/30 hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-60"
            >
              <Sprout size={18} className="text-black" />
              {loading ? "Prédiction..." : "Prédire la culture"}
            </button>
          </div>

          {error && (
            <div className="mx-5 mb-5 rounded-md border border-red-600/40 bg-red-950/40 text-red-300 px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-green-800/40 bg-black/60 p-6">
          <h3 className="text-xl mb-3 text-center text-green-300">Résultat</h3>
          {prediction ? (
            <>
              <p className="text-2xl text-center font-semibold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text capitalize">
                {prediction}
              </p>
              {top3.length > 0 && (
                <div className="mt-5">
                  <p className="text-green-300/80 mb-2 text-center">Top 3 (probabilités)</p>
                  <ul className="grid sm:grid-cols-3 gap-3">
                    {top3.map((t, i) => (
                      <li
                        key={i}
                        className="text-center rounded-md p-3 border border-green-800/50 bg-black/60"
                      >
                        <div className="capitalize text-green-100">{t.label}</div>
                        <div className="text-sm text-green-300/80">
                          {(t.proba * 100).toFixed(1)}%
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-green-300/70 text-center">Aucune prédiction encore.</p>
          )}
        </div>
      </div>
    </div>
  );
}