import { useEffect, useMemo, useState } from "react";

const CANDIDATES = [
  import.meta.env.VITE_API_URL?.trim(),
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "http://127.0.0.1:8000",
  "http://localhost:8000",
].filter(Boolean);

async function pickBase() {
  for (const base of CANDIDATES) {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${base}/health`, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(id);
      if (r.ok) return base;
    } catch {}
  }
  throw new Error("Aucun backend joignable (5000/8000).");
}

export default function Analytics() {
  const [apiBase, setApiBase] = useState(null);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [hours, setHours] = useState(24);
  const [sim, setSim] = useState({ crop: "tomate", soil: "limoneux", target_moisture: 55 });
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [view, setView] = useState("simple"); // 'simple' | 'avancee'

  const plotMoistureUrl = useMemo(
    () => (apiBase ? `${apiBase}/api/analytics/irrigation/plot?kind=moisture&hours=${hours}` : ""),
    [apiBase, hours]
  );
  const plotIrrigUrl = useMemo(
    () => (apiBase ? `${apiBase}/api/analytics/irrigation/plot?kind=irrigation&hours=${hours}` : ""),
    [apiBase, hours]
  );

  useEffect(() => {
    pickBase()
      .then(setApiBase)
      .catch((e) => setErr(e.message || "Backend non joignable"));
  }, []);

  const loadData = async () => {
    if (!apiBase) return;
    setErr(null);
    const res = await fetch(`${apiBase}/api/analytics/irrigation?hours=${hours}`);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setSeries(data.series || []);
    setStats(data.stats || null);
  };

  useEffect(() => {
    if (apiBase) loadData().catch((e) => setErr(e.message || "Erreur de chargement"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, hours]);

  const runSim = async () => {
    if (!apiBase) return;
    setLoading(true);
    setSimResult(null);
    try {
      const res = await fetch(`${apiBase}/api/analytics/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sim),
      });
      if (!res.ok) throw new Error(await res.text());
      setSimResult(await res.json());
    } catch (e) {
      setErr(e?.message || "Erreur simulation");
    } finally {
      setLoading(false);
    }
  };

  // Interprétation simple pour agriculteurs
  const last = series.length ? series[series.length - 1] : null;
  const status = (() => {
    if (!last) return { label: "—", detail: "En attente de données.", color: "text-green-200" };
    const m = last.moisture;
    if (m < 45) return { label: "Sol sec", detail: "Arrosage recommandé prochain créneau.", color: "text-amber-300" };
    if (m > 75) return { label: "Trop humide", detail: "Suspendre l’arrosage temporairement.", color: "text-cyan-300" };
    return { label: "Optimal", detail: "Niveau d’humidité satisfaisant.", color: "text-emerald-300" };
  })();

  return (
    <div className="min-h-screen bg-black text-green-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-5xl text-center">
          Analyses <span className="bg-gradient-to-r from-green-500 to-emerald-700 text-transparent bg-clip-text">Irrigation</span>
        </h1>
        <p className="text-green-300/70 text-center mt-3">
          Visualisation des données capteurs et recommandations simplifiées.
        </p>

        {/* Sélecteur de vue */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            className={`px-4 py-2 rounded-md border ${view==="simple"?"border-green-500 bg-green-900/30":"border-green-800 hover:bg-green-900/10"}`}
            onClick={() => setView("simple")}
          >
            Vue simple
          </button>
          <button
            className={`px-4 py-2 rounded-md border ${view==="avancee"?"border-green-500 bg-green-900/30":"border-green-800 hover:bg-green-900/10"}`}
            onClick={() => setView("avancee")}
          >
            Vue avancée
          </button>
        </div>

        {!apiBase && !err && <p className="text-center mt-6">Recherche du backend...</p>}
        {err && <div className="mt-6 text-center text-red-300">{err}</div>}

        {apiBase && (
          <>
            {/* Vue simple (cartes) */}
            {view === "simple" && (
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-neutral-900/60 border border-green-800/50">
                  <div className="text-green-300/80 text-sm">État du sol</div>
                  <div className={`text-2xl mt-1 ${status.color}`}>{status.label}</div>
                  <div className="text-sm text-green-300/80 mt-1">{status.detail}</div>
                  <div className="text-xs text-green-400/70 mt-2">
                    Dernière mesure: {last ? `${last.moisture}%` : "—"}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-neutral-900/60 border border-green-800/50">
                  <div className="text-green-300/80 text-sm">Volume total (période)</div>
                  <div className="text-2xl mt-1">{stats ? `${stats.total_liters} L` : "—"}</div>
                  <div className="text-xs text-green-400/70 mt-2">
                    Événements d’arrosage: {stats ? stats.irrigation_events : "—"}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-neutral-900/60 border border-green-800/50">
                  <div className="text-green-300/80 text-sm">Conseil du jour</div>
                  <div className="text-sm mt-2">
                    Utilisez la simulation simplifiée pour obtenir les minutes/jour et créneaux proposés selon votre culture et sol.
                  </div>
                  <button
                    onClick={() => runSim()}
                    disabled={loading}
                    className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-black font-medium py-2 px-4 rounded-md border border-green-700/60 hover:from-green-500 hover:to-emerald-600 disabled:opacity-60"
                  >
                    {loading ? "Calcul..." : "Obtenir une recommandation"}
                  </button>
                </div>
              </div>
            )}

            {/* Période + Graphes (vue avancée) */}
            {view === "avancee" && (
              <>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="text-green-300/80">Période:</span>
                  {[6, 12, 24, 48].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHours(h)}
                      className={`px-3 py-1 rounded-md border ${hours===h?"border-green-500 bg-green-900/30":"border-green-800 hover:bg-green-900/10"}`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>

                {/* Deux graphes par ligne (taille moyenne) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-green-800/50 bg-neutral-900/50 p-5">
                    <h3 className="text-lg mb-3 text-green-300">Humidité du sol (%)</h3>
                    <img
                      src={plotMoistureUrl}
                      alt="Humidité du sol"
                      className="w-full rounded-md border border-green-900 shadow-lg object-contain"
                    />
                  </div>
                  <div className="rounded-xl border border-green-800/50 bg-neutral-900/50 p-5">
                    <h3 className="text-lg mb-3 text-green-300">Débit d’arrosage (L/h)</h3>
                    <img
                      src={plotIrrigUrl}
                      alt="Débit d’arrosage"
                      className="w-full rounded-md border border-green-900 shadow-lg object-contain"
                    />
                  </div>
                </div>

                {stats && (
                  <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-md bg-neutral-900/50 border border-green-800/50">
                      <div className="text-green-300/80 text-sm">Humidité moyenne</div>
                      <div className="text-2xl">{stats.avg_moisture}%</div>
                    </div>
                    <div className="p-4 rounded-md bg-neutral-900/50 border border-green-800/50">
                      <div className="text-green-300/80 text-sm">Min - Max</div>
                      <div className="text-2xl">{stats.min_moisture}% – {stats.max_moisture}%</div>
                    </div>
                    <div className="p-4 rounded-md bg-neutral-900/50 border border-green-800/50">
                      <div className="text-green-300/80 text-sm">Événements d’arrosage</div>
                      <div className="text-2xl">{stats.irrigation_events}</div>
                    </div>
                    <div className="p-4 rounded-md bg-neutral-900/50 border border-green-800/50">
                      <div className="text-green-300/80 text-sm">Volume total</div>
                      <div className="text-2xl">{stats.total_liters} L</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Simulation simplifiée */}
            <div className="mt-10 rounded-2xl border border-green-800/60 bg-neutral-900/50 p-6">
              <h2 className="text-xl mb-4">Simulation simplifiée</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm text-green-300/80">Culture</span>
                  <select
                    className="mt-1 w-full bg-black text-green-100 border border-green-800 rounded-md px-3 py-2"
                    value={sim.crop}
                    onChange={(e) => setSim((s) => ({ ...s, crop: e.target.value }))}
                  >
                    <option>tomate</option>
                    <option>salade</option>
                    <option>piment</option>
                    <option>générique</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-green-300/80">Type de sol</span>
                  <select
                    className="mt-1 w-full bg-black text-green-100 border border-green-800 rounded-md px-3 py-2"
                    value={sim.soil}
                    onChange={(e) => setSim((s) => ({ ...s, soil: e.target.value }))}
                  >
                    <option value="sableux">sableux</option>
                    <option value="limoneux">limoneux</option>
                    <option value="argileux">argileux</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-green-300/80">Humidité cible (%)</span>
                  <input
                    type="range"
                    min={40}
                    max={80}
                    step={1}
                    value={sim.target_moisture}
                    onChange={(e) => setSim((s) => ({ ...s, target_moisture: Number(e.target.value) }))}
                    className="mt-3 w-full"
                  />
                  <div className="text-sm mt-1">{sim.target_moisture}%</div>
                </label>
              </div>

              <div className="mt-4">
                <button
                  onClick={runSim}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-black font-medium py-2 px-4 rounded-md border border-green-700/60 hover:from-green-500 hover:to-emerald-600 disabled:opacity-60"
                >
                  {loading ? "Calcul..." : "Calculer la recommandation"}
                </button>
              </div>

              {simResult && (
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-black/60 border border-green-800/50">
                    <div className="text-green-300/80 text-sm">Durée totale conseillée</div>
                    <div className="text-2xl">{simResult.minutes_per_day} min/jour</div>
                  </div>
                  <div className="p-4 rounded-md bg-black/60 border border-green-800/50">
                    <div className="text-green-300/80 text-sm">Créneaux</div>
                    <ul className="mt-1">
                      {simResult.suggested_slots.map((s, i) => (
                        <li key={i} className="text-green-100">
                          {s.time} → {s.minutes} min
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}