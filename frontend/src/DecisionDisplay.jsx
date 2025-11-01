import React from 'react';

export default function DecisionDisplay({ decisions }) {
  const clamp = (v, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));

  const ventOpen = Number(decisions?.decision_vents ?? 0) === 1;
  const shadeActive = Number(decisions?.decision_ombrage ?? 0) === 1;
  const irrigation = Number.isFinite(Number(decisions?.decision_volume_eau))
    ? Number(decisions.decision_volume_eau)
    : 0;

  // Débit d’eau (L/min·m²)
  const DEFAULT_FLOW = 5; // L/min·m² (défaut si non fourni)
  const flowProvided = Number.isFinite(Number(decisions?.debit_eau_lpm2));
  const flowRate = flowProvided ? Number(decisions.debit_eau_lpm2) : DEFAULT_FLOW;

  // Temps d’irrigation (minutes) = Volume (L/m²) / Débit (L/min·m²)
  const timeMinutes = flowRate > 0 ? irrigation / flowRate : 0;

  const formatDuration = (mins) => {
    const totalSec = Math.round(mins * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const irrigationMax = 30;
  const irrigationPct = clamp((irrigation / irrigationMax) * 100);

  const badgeClass = (active) =>
    `rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white
     ${active
        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_6px_20px_rgba(16,185,129,0.35)]'
        : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_6px_20px_rgba(239,68,68,0.35)]'}
     transition`;

  const iconBoxClass = (active) =>
    `grid h-12 w-12 place-content-center rounded-xl text-2xl transition
     ${active ? 'bg-emerald-100' : 'bg-rose-100'}`;

  const Section = ({ icon, label, active }) => (
    <div className="mb-4 flex cursor-pointer items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className={iconBoxClass(active)}>{icon}</div>
        <span className="text-[15px] font-bold text-slate-800">{label}</span>
      </div>
      <span className={badgeClass(active)}>{active ? '✓ Actif' : '✗ Inactif'}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="mb-6 border-b-2 border-slate-200 pb-5">
        <h2 className="mb-2 flex items-center gap-3 text-2xl font-black text-slate-800">
          <span className="bg-gradient-to-br from-emerald-500 to-emerald-600 bg-clip-text text-2xl text-transparent">🌱</span>
          Décisions de l'IA
        </h2>
        <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Actif</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Inactif</span>
          </div>
        </div>
      </div>

      {/* Ouvrants */}
      <Section icon="🌬️" label="Ouvrants (Aération)" active={ventOpen} />

      {/* Ombrage */}
      <Section icon="🕶️" label="Filet d'Ombrage" active={shadeActive} />

      {/* Irrigation (Temps basé sur le débit) */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-content-center rounded-xl bg-emerald-100 text-2xl">💧</div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-800">Irrigation (Temps)</span>
            <div className="mt-1 flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${flowProvided ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                Débit: {flowRate} L/min·m²{flowProvided ? '' : ' (défaut)'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Volume cible: {irrigation.toFixed(2)} L/m²
              </span>
            </div>
          </div>
        </div>

        <div className="w-[48%] text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{formatDuration(timeMinutes)}</span>
            <span className="text-[13px] font-bold text-slate-500">temps</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-slate-200 bg-blue-50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${irrigationPct}%` }}
            />
          </div>
          <div className="mt-2 text-center text-[11px] font-semibold text-slate-500">
            Échelle volume: 0–30 L/m²
          </div>
        </div>
      </div>
    </div>
  );
}