import React from 'react';

export default function SensorSettings({ frequency, onChangeFrequency, intervalSeconds }) {
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

  const styles = {
    outer: {
      background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
      padding: 1,
      borderRadius: 20,
    },
    panel: {
      background: theme.white,
      borderRadius: 19,
      padding: 18,
      boxShadow: '0 10px 30px rgba(34,197,94,0.12)',
    },
    header: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: { margin: 0, fontSize: 16, fontWeight: 800, color: theme.text },
    subtitle: { margin: 0, fontSize: 12, color: theme.subtext, fontWeight: 600 },
    group: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12,
      marginTop: 8,
    },
    card: (active) => ({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      background: theme.white,
      border: `1px solid ${active ? theme.green : theme.border}`,
      boxShadow: active ? '0 10px 24px rgba(34,197,94,0.18)' : '0 4px 14px rgba(0,0,0,0.04)',
      cursor: 'pointer',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
    }),
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
      flexShrink: 0,
    },
    textCol: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: 13, fontWeight: 800, color: theme.text },
    hint: { fontSize: 12, fontWeight: 600, color: theme.subtext, marginTop: 2 },
    check: (active) => ({
      position: 'absolute',
      top: 10,
      right: 10,
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: `2px solid ${active ? theme.greenDark : theme.border}`,
      background: active ? `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})` : theme.white,
      boxShadow: active ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
    }),
    input: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none',
    },
  };

  const OptionCard = ({ value, icon, title, hint }) => {
    const active = frequency === value;
    return (
      <label style={styles.card(active)} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { onChangeFrequency(value); e.preventDefault(); }
      }} tabIndex={0}>
        <input
          style={styles.input}
          type="radio"
          value={value}
          checked={active}
          onChange={(e) => onChangeFrequency(e.target.value)}
        />
        <div style={styles.icon}>{icon}</div>
        <div style={styles.textCol}>
          <span style={styles.label}>{title}</span>
          <span style={styles.hint}>{hint}</span>
        </div>
        <span aria-hidden style={styles.check(active)} />
      </label>
    );
  };

  return (
    <div style={styles.outer}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h4 style={styles.title}>Fréquence des Prédictions</h4>
          <p style={styles.subtitle}>Capteurs • Vert = actif</p>
        </div>
        <div style={styles.group}>
          <OptionCard
            value="instant"
            icon="⚡"
            title="Instantanée"
            hint={`Chaque ${intervalSeconds}s`}
          />
          <OptionCard
            value="interval"
            icon="⏱️"
            title="Intervalle"
            hint="Chaque 30 min"
          />
        </div>
      </div>
    </div>
  );
}