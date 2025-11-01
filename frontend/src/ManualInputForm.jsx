import React, { useEffect, useState } from 'react';

export default function ManualInputForm({ initialData, onSubmit, fields }) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (initialData?.source !== 'manual') {
      setFormData(initialData);
    }
  }, [initialData]);

  const labels = {
    Tair: 'Température Air (°C)',
    rH: 'Humidité Air (%)',
    PARin: 'Luminosité (lux)',
    moisture: 'Humidité Sol (0-1023)',
    temp_sol: 'Température du sol (°C)',
  };

  const steps = {
    Tair: '0.1',
    rH: '0.1',
    PARin: '1',
    moisture: '1',
    temp_sol: '0.1',
  };

  const icons = {
    Tair: '🌡️',
    rH: '💧',
    PARin: '☀️',
    moisture: '🌿',
    temp_sol: '🌱',
  };

  const units = {
    Tair: '°C',
    rH: '%',
    PARin: 'lux',
    moisture: '',
    temp_sol: '°C',
  };

  const inputBounds = {
    Tair: { min: -20, max: 60 },
    rH: { min: 0, max: 100 },
    PARin: { min: 0, max: 200000 },
    moisture: { min: 0, max: 1023 },
    temp_sol: { min: -10, max: 60 },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsed = name === 'moisture' ? parseInt(value || 0, 10) : parseFloat(value || 0);
    setFormData((prev) => ({ ...prev, [name]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-700 p-[1.5px] shadow-2xl shadow-green-500/20">
      <div className="rounded-3xl bg-white/90 p-5 md:p-6 shadow-xl shadow-green-500/10 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="m-0 text-lg font-extrabold text-slate-900">Saisie Manuelle</h2>
          <p className="mt-1 text-xs font-semibold text-zinc-700 sm:mt-0">
            Ajustez les valeurs puis lancez les prédictions
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Grid des inputs */}
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((key) => (
              <div
                key={key}
                className="group flex items-start gap-3 rounded-2xl border border-green-200/70 bg-white p-3.5 shadow-sm transition-all hover:shadow-md focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/30"
              >
                {/* Icon */}
                <div className="grid h-11 w-11 shrink-0 place-content-center rounded-xl bg-green-50 text-xl text-green-700 transition-transform group-hover:scale-105">
                  {icons[key] || '🧪'}
                </div>

                {/* Input section */}
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={key}
                    className="mb-1.5 block text-xs font-bold tracking-wide text-zinc-700"
                  >
                    {labels[key] || key}
                  </label>

                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-2.5 py-1.5 transition-colors focus-within:border-green-400">
                    <input
                      type="number"
                      id={key}
                      name={key}
                      value={formData?.[key] ?? ''}
                      onChange={handleChange}
                      step={steps[key] || '0.1'}
                      min={inputBounds[key]?.min}
                      max={inputBounds[key]?.max}
                      placeholder="0"
                      className="w-full bg-transparent text-base font-extrabold text-slate-900 outline-none placeholder:text-zinc-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      inputMode="decimal"
                    />
                    {units[key] && (
                      <span className="whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-extrabold text-green-700">
                        {units[key]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-4 w-full cursor-pointer rounded-2xl bg-gradient-to-br from-green-500 to-green-700 px-3.5 py-3 text-sm font-extrabold text-white shadow-lg shadow-green-500/25 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            🚀 Calculer Prédictions
          </button>
        </form>
      </div>
    </div>
  );
}