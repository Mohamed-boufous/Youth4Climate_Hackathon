import os
import json
import random
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from flask import send_file
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import io

# ---------------------------------------------------------
# Init
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app)

BASE = Path(__file__).resolve().parent

# ---------------------------------------------------------
# Chargement modèles CLIMAT/IRRIGATION (simulation)
# ---------------------------------------------------------
MODEL_VENTS_PATH = BASE / "climate_vents_model.pkl"
MODEL_SHADES_PATH = BASE / "climate_shade_model.pkl"
MODEL_IRRIG_PATH = BASE / "irrigation_model.pkl"

def safe_load(path: Path):
    try:
        if path.exists():
            return joblib.load(path)
        print(f"[WARN] Modèle introuvable: {path.name}")
        return None
    except Exception as e:
        print(f"[ERROR] Chargement {path.name}: {e}")
        return None

model_vents = safe_load(MODEL_VENTS_PATH)
model_ombrage = safe_load(MODEL_SHADES_PATH)
model_irrigation = safe_load(MODEL_IRRIG_PATH)

# ---------------------------------------------------------
# Chargement modèle CULTURE (crop)
# ---------------------------------------------------------
CROP_MODEL_PATH = BASE / "crop_recommendation_model.pkl"
CROP_META_PATH = BASE / "crop_recommendation_model.meta.json"

crop_model = safe_load(CROP_MODEL_PATH)
try:
    if CROP_META_PATH.exists():
        crop_meta = json.loads(CROP_META_PATH.read_text(encoding="utf-8"))
    else:
        crop_meta = {"features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"], "classes": []}
except Exception as e:
    print(f"[WARN] Lecture méta: {e}")
    crop_meta = {"features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"], "classes": []}

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def decisions_fallback(data):
    # Règles simples
    Tair = float(data.get("Tair", 0))
    rH = float(data.get("rH", 0))
    PARin = float(data.get("PARin", 0))
    moisture = float(data.get("moisture", 0))
    decision_vents = 1 if (Tair > 30 or rH > 85) else 0
    decision_ombrage = 1 if (PARin > 600 or Tair > 32) else 0
    dryness = max(0.0, 700.0 - moisture) / 700.0
    decision_volume_eau = round(2.0 * dryness, 2)
    return {
        "decision_vents": int(decision_vents),
        "decision_ombrage": int(decision_ombrage),
        "decision_volume_eau": float(decision_volume_eau),
    }

def decisions_ml(data):
    # Vérif champs
    for k in ("Tair", "rH", "PARin", "moisture"):
        if k not in data:
            raise KeyError(k)
    # Climat
    df_climat = pd.DataFrame([[data["Tair"], data["rH"], data["PARin"]]], columns=["Tair", "rH", "PARin"])
    # Irrigation (moisture + temp= Tair)
    df_irrig = pd.DataFrame([[data["moisture"], data["Tair"]]], columns=["moisture", "temp"])
    pred_vents = int(model_vents.predict(df_climat)[0])
    pred_ombrage = int(model_ombrage.predict(df_climat)[0])
    pred_volume = float(model_irrigation.predict(df_irrig)[0])
    return {
        "decision_vents": pred_vents,
        "decision_ombrage": pred_ombrage,
        "decision_volume_eau": round(pred_volume, 2),
    }

def _gen_irrigation_timeseries(hours=24, step_minutes=15):
    now = datetime.utcnow()
    periods = int(hours * 60 / step_minutes)
    times = pd.date_range(end=now, periods=periods, freq=f"{step_minutes}min")
    moisture, irr_on, irr_lph = [], [], []
    level = 60.0
    for _ in range(periods):
        on = 1 if level < 45 else 0
        irr_on.append(on)
        flow = 2.0 if on else 0.0
        irr_lph.append(flow)
        evap = 0.25
        level = max(20.0, min(95.0, level - evap + (3.0 if on else 0.0)))
        moisture.append(round(level + random.uniform(-0.8, 0.8), 1))
    df = pd.DataFrame({"time": times, "moisture": moisture, "irrigation_on": irr_on, "irrigation_lph": irr_lph})
    return df

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "climate_models": {
            "vents": model_vents is not None,
            "ombrage": model_ombrage is not None,
            "irrigation": model_irrigation is not None,
        },
        "crop_model_loaded": crop_model is not None,
        "features": crop_meta.get("features", []),
    })

# Simulation (compatibilité: /predict + /api/decisions)
@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}
    try:
        if all([model_vents, model_ombrage, model_irrigation]):
            return jsonify(decisions_ml(data))
        return jsonify(decisions_fallback(data))
    except KeyError as e:
        return jsonify({"erreur": f"Donnée manquante: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"erreur": f"Erreur serveur: {e}"}), 500

@app.post("/api/decisions")
def api_decisions():
    return predict()

# Données capteurs simulées pour la page culture (évite 404)
@app.get("/api/crop/factors")
def crop_factors():
    data = {
        "N": random.randint(0, 140),
        "P": random.randint(0, 140),
        "K": random.randint(0, 200),
        "temperature": round(18 + random.random() * 15, 1),  # 18-33°C
        "humidity": round(40 + random.random() * 50, 1),     # 40-90%
        "ph": round(5 + random.random() * 2.5, 2),           # 5.00-7.50
        "rainfall": round(20 + random.random() * 250, 1),    # 20-270 mm
    }
    return jsonify(data)

# Prédiction culture
@app.post("/api/crop/recommend")
def crop_recommend():
    if not crop_model:
        return jsonify({"erreur": "Modèle de culture non chargé. Exécutez train_model2.py"}), 503
    payload = request.get_json(silent=True) or {}
    feats = crop_meta.get("features", ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"])
    try:
        x = [[float(payload[f]) for f in feats]]
    except KeyError as e:
        return jsonify({"erreur": f"Champ manquant: {e}", "requis": feats}), 400
    except ValueError as e:
        return jsonify({"erreur": f"Valeur invalide: {e}"}), 400
    try:
        pred = crop_model.predict(x)[0]
        res = {"label": str(pred)}
        if hasattr(crop_model, "predict_proba"):
            proba = crop_model.predict_proba(x)[0]
            classes = crop_meta.get("classes", [])
            if classes and len(classes) == len(proba):
                top3 = sorted(zip(classes, proba), key=lambda t: t[1], reverse=True)[:3]
                res["top3"] = [{"label": str(c), "proba": float(p)} for c, p in top3]
        return jsonify(res)
    except Exception as e:
        return jsonify({"erreur": f"Erreur prédiction: {e}"}), 500

@app.get("/api/analytics/irrigation")
def analytics_irrigation():
    hours = int(request.args.get("hours", 24))
    df = _gen_irrigation_timeseries(hours=hours)
    stats = {
        "avg_moisture": float(round(df["moisture"].mean(), 2)),
        "min_moisture": float(df["moisture"].min()),
        "max_moisture": float(df["moisture"].max()),
        "irrigation_events": int((df["irrigation_on"].diff().gt(0)).sum()),
        "total_liters": float(round((df["irrigation_lph"] * (15/60)).sum(), 2)),
    }
    return jsonify({
        "series": [
            {"t": r.time.isoformat(), "moisture": float(r.moisture), "irrigation_on": int(r.irrigation_on), "irrigation_lph": float(r.irrigation_lph)}
            for r in df.itertuples(index=False)
        ],
        "stats": stats
    })

@app.get("/api/analytics/irrigation/plot")
def analytics_irrigation_plot():
    kind = request.args.get("kind", "moisture")
    hours = int(request.args.get("hours", 24))
    df = _gen_irrigation_timeseries(hours=hours)

    sns.set_theme(style="darkgrid", rc={
        "axes.facecolor": "#0b0b0b",
        "figure.facecolor": "#0b0b0b",
        "axes.edgecolor": "#9ca3af",
        "grid.color": "#1f2937",
        "text.color": "#ffffff",
        "axes.labelcolor": "#ffffff",
        "xtick.color": "#ffffff",
        "ytick.color": "#ffffff",
        "legend.edgecolor": "#9ca3af",
        "axes.titlesize": 16,
        "axes.labelsize": 14,
    })
    fig, ax = plt.subplots(figsize=(12, 4.5), dpi=150)  # taille moyenne

    if kind == "irrigation":
        ax.step(df["time"], df["irrigation_lph"], where="post", color="#10B981", linewidth=2.0, label="Débit arrosage (L/h)")
        ax.set_ylabel("L/h")
    else:
        ax.axhspan(50, 70, color="#10B981", alpha=0.08, label="Zone optimale (50-70%)")
        ax.plot(df["time"], df["moisture"], color="#10B981", linewidth=2.0, label="Humidité sol (%)")
        ax.set_ylabel("%")

    ax.set_xlabel("Temps (UTC)")
    ax.tick_params(axis="both", labelsize=12)
    ax.grid(True, alpha=0.25)
    leg = ax.legend(loc="upper left", framealpha=0.15)
    for text in leg.get_texts():
        text.set_color("#ffffff")
        text.set_fontsize(12)

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", facecolor="#0b0b0b", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return send_file(buf, mimetype="image/png")

@app.post("/api/analytics/simulate")
def analytics_simulate():
    p = request.get_json(silent=True) or {}
    crop = str(p.get("crop", "générique")).lower()
    soil = str(p.get("soil", "limoneux")).lower()
    target = float(p.get("target_moisture", 55))
    soil_factor = {"sableux": 1.3, "limoneux": 1.0, "argileux": 0.8}.get(soil, 1.0)
    crop_factor = 1.0
    if crop in ("tomate", "tomato"): crop_factor = 1.15
    if crop in ("salade", "lettuce"): crop_factor = 0.9
    if crop in ("piment", "pepper"): crop_factor = 1.1
    base_minutes = max(5, min(90, (target - 40) * 2.0))
    minutes_per_day = round(base_minutes * soil_factor * crop_factor, 0)
    if minutes_per_day <= 20:
        slots = [{"time": "06:00", "minutes": int(minutes_per_day)}]
    elif minutes_per_day <= 40:
        m = int(minutes_per_day // 2)
        slots = [{"time": "06:00", "minutes": m}, {"time": "18:00", "minutes": int(minutes_per_day - m)}]
    else:
        m = int(minutes_per_day // 3)
        slots = [{"time": "06:00", "minutes": m}, {"time": "12:00", "minutes": m}, {"time": "18:00", "minutes": int(minutes_per_day - 2*m)}]
    return jsonify({"crop": crop, "soil": soil, "target_moisture": target, "minutes_per_day": int(minutes_per_day), "suggested_slots": slots})
# ---------------------------------------------------------
# Run
# ---------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    print(f"Flask prêt sur http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)