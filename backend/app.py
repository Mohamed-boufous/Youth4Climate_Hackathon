import os
import json
import random
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

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

# ---------------------------------------------------------
# Run
# ---------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    print(f"Flask prêt sur http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)