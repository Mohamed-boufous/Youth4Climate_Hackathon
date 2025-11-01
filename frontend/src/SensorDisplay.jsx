import React from 'react';

export default function SensorDisplay({ sensors }) {
  const isManual = sensors?.source === 'manual';
  const sourceText = isManual ? 'Manuel' : 'Simulation en direct';

  const theme = {
    green: '#22c55e',
    greenDark: '#16a34a',
    greenSoft: '#e9f9f0',
    greenSoft2: '#f0fff4',
    white: '#ffffff',
    text: '#0f172a',
    subtext: '#3f3f46',
    border: '#d1fadf',
  };

  const clamp = (v, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));

  const rH = Number(sensors?.rH ?? 0);
  const moisture = Number(sensors?.moisture ?? 0);
  const par = Number(sensors?.PARin ?? 0);
  const tair = Number(sensors?.Tair ?? 0);
  const tsol = Number(sensors?.temp_sol ?? 0);

  // Normalize humidity and moisture, refine PAR scale for visual clarity
  const humidityPct = clamp(rH);
  const moisturePct = clamp((moisture / 1023) * 100); // raw (0–1023) -> percentage
  const parPct = clamp((par / 2000) * 100); // scale 0–2000 lux => 0–100%

  // Simple status helpers (green-focused)
  const status = (ok) => (ok ? { label: 'OK', variant: 'ok' } : { label: 'Attention', variant: 'warn' });
  const tempAirStatus = status(tair >= 18 && tair <= 28);
  const rhStatus = status(rH >= 40 && rH <= 80);
  const soilMoistStatus = status(moisturePct >= 30 && moisturePct <= 70);
  const soilTempStatus = status(tsol >= 15 && tsol <= 25);

  const styles = {
    outer: {
      background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
      padding: 1,
      borderRadius: 20,
      overflow: 'hidden',
    },
    panel: {
      background: theme.white,
      borderRadius: 19,
      padding: 20,
      boxShadow: '0 10px 30px rgba(34,197,94,0.12)',
      minHeight: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 800,
      color: theme.text,
      margin: 0,
    },
    subtitle: { fontSize: 12, color: theme.subtext, fontWeight: 600, marginTop: 2 },
    pill: {
      padding: '6px 10px',
      borderRadius: 999,
      background: isManual ? theme.greenSoft : theme.greenSoft2,
      color: theme.greenDark,
      border: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      fontWeight: 700,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: theme.greenDark,
      boxShadow: `0 0 0 3px ${theme.greenSoft}`,
      animation: 'pulseDot 1.6s ease-in-out infinite',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12,
    },
    card: {
      background: theme.white,
      border: `1px solid ${theme.border}`,
      borderRadius: 16,
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 6px 20px rgba(34,197,94,0.08)',
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.greenSoft,
      color: theme.greenDark,
      fontSize: 20,
    },
    metric: { display: 'flex', flexDirection: 'column', flex: 1 },
    labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontSize: 12, color: theme.subtext, fontWeight: 700, letterSpacing: 0.3 },
    chip: (variant) => ({
      marginLeft: 8,
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      border: `1px solid ${variant === 'ok' ? theme.greenDark : theme.border}`,
      background: variant === 'ok' ? theme.greenSoft : theme.greenSoft2,
      color: variant === 'ok' ? theme.greenDark : '#64748b',
      whiteSpace: 'nowrap',
    }),
    valueRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
    value: { fontSize: 22, fontWeight: 800, color: theme.text },
    unit: { fontSize: 12, color: theme.subtext, fontWeight: 700 },

    ring: (percent) => ({
      width: 54,
      height: 54,
      borderRadius: '50%',
      background: `conic-gradient(${theme.green} ${percent}%, ${theme.greenSoft} 0)`,
      display: 'grid',
      placeItems: 'center',
      border: `2px solid ${theme.white}`,
    }),
    ringInner: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: theme.white,
      display: 'grid',
      placeItems: 'center',
      fontSize: 12,
      fontWeight: 800,
      color: theme.greenDark,
      border: `1px solid ${theme.border}`,
    },
    barWrap: {
      width: '100%',
      height: 8,
      background: theme.greenSoft,
      borderRadius: 999,
      overflow: 'hidden',
      border: `1px solid ${theme.border}`,
    },
    barFill: (percent) => ({
      width: `${percent}%`,
      height: '100%',
      background: `linear-gradient(90deg, ${theme.green}, ${theme.greenDark})`,
      transition: 'width 600ms ease',
    }),
  };

  return (
    <>
      {/* Local keyframes for pulsing source dot */}
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.25); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>
      <div style={styles.outer}>
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Capteurs</h2>
              <div style={styles.subtitle}>Vert = optimal</div>
            </div>
            <span style={styles.pill}>
              <span style={styles.dot} />
              {sourceText}
            </span>
          </div>

          <div style={styles.grid}>
            {/* Température Air */}
            <div style={styles.card}>
              <div style={styles.icon}>🌡️</div>
              <div style={styles.metric}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>Température Air</span>
                  <span style={styles.chip(tempAirStatus.variant)}>{tempAirStatus.label}</span>
                </div>
                <div style={styles.valueRow}>
                  <span style={styles.value}>
                    {Number.isFinite(tair) ? tair.toFixed(1) : '--'}
                  </span>
                  <span style={styles.unit}>°C</span>
                </div>
              </div>
            </div>

            {/* Humidité Air (anneau) */}
            <div style={styles.card}>
              <div style={styles.ring(humidityPct)}>
                <div style={styles.ringInner}>{Math.round(humidityPct)}%</div>
              </div>
              <div style={styles.metric}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>Humidité Air</span>
                  <span style={styles.chip(rhStatus.variant)}>{rhStatus.label}</span>
                </div>
                <div style={styles.valueRow}>
                  <span style={styles.value}>
                    {Number.isFinite(rH) ? rH.toFixed(1) : '--'}
                  </span>
                  <span style={styles.unit}>%</span>
                </div>
              </div>
            </div>

            {/* Luminosité (barre) */}
            <div style={styles.card}>
              <div style={styles.icon}>☀️</div>
              <div style={styles.metric}>
                <span style={styles.label}>Luminosité (PAR)</span>
                <div style={styles.valueRow}>
                  <span style={styles.value}>
                    {Number.isFinite(par) ? par.toFixed(1) : '--'}
                  </span>
                  <span style={styles.unit}>lux</span>
                </div>
                <div style={{ marginTop: 8, ...styles.barWrap }}>
                  <div style={styles.barFill(parPct)} />
                </div>
              </div>
            </div>

            {/* Humidité Sol (anneau) */}
            <div style={styles.card}>
              <div style={styles.ring(moisturePct)}>
                <div style={styles.ringInner}>{Math.round(moisturePct)}%</div>
              </div>
              <div style={styles.metric}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>Humidité Sol</span>
                  <span style={styles.chip(soilMoistStatus.variant)}>{soilMoistStatus.label}</span>
                </div>
                <div style={styles.valueRow}>
                  <span style={styles.value}>
                    {Number.isFinite(moisturePct) ? moisturePct.toFixed(0) : '--'}
                  </span>
                  <span style={styles.unit}>%</span>
                </div>
              </div>
            </div>

            {/* Température du sol */}
            <div style={styles.card}>
              <div style={styles.icon}>🌱</div>
              <div style={styles.metric}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>Température du sol</span>
                  <span style={styles.chip(soilTempStatus.variant)}>{soilTempStatus.label}</span>
                </div>
                <div style={styles.valueRow}>
                  <span style={styles.value}>
                    {Number.isFinite(tsol) ? tsol.toFixed(1) : '--'}
                  </span>
                  <span style={styles.unit}>°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}