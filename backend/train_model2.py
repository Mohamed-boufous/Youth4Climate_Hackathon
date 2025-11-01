from pathlib import Path
import json
import os
import sys
import pandas as pd
import numpy as np
import joblib
import sklearn  # pour afficher la version
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# -------------------------------------------------------------------
# INFOS VERSION
# -------------------------------------------------------------------
try:
  print("===========================================================")
  print(f"Utilisation de scikit-learn version : {sklearn.__version__}")
  print("Le modèle .pkl sera créé avec cette version.")
  print("===========================================================")
except Exception as e:
  print(f"Erreur lors de l'import de sklearn : {e}")
  print("Activez votre venv puis: pip install scikit-learn pandas joblib")
  sys.exit(1)

# -------------------------------------------------------------------
# CHEMINS (robustes, relatifs à ce fichier)
# -------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_PATH = SCRIPT_DIR / "data"
CROP_FILE = DATA_PATH / "Crop_recommendation.csv"

MODEL_DIR = SCRIPT_DIR
CROP_MODEL_FILE = MODEL_DIR / "crop_recommendation_model.pkl"
META_FILE = MODEL_DIR / "crop_recommendation_model.meta.json"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET = "label"

def save_metadata(path: Path, features, target, sklearn_version: str, classes):
  meta = {
    "features": features,
    "target": target,
    "sklearn_version": sklearn_version,
    "classes": list(map(str, classes)),
  }
  path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
  print(f"Méta‑données sauvegardées dans : {path}")

def train_crop_model():
  """
  Entraîne un modèle de classification (RandomForest) pour recommander la culture.
  Entrées: N, P, K, temperature, humidity, ph, rainfall.
  Cible: label.
  """
  print("\n--- 1) Chargement des données ---")
  if not CROP_FILE.exists():
    print(f"ERREUR : Fichier introuvable : {CROP_FILE}")
    print(f"Placez 'Crop_recommendation.csv' dans {DATA_PATH}")
    return

  try:
    df = pd.read_csv(CROP_FILE)
    print(f"Fichier chargé : {CROP_FILE}")
  except Exception as e:
    print(f"Erreur de lecture CSV : {e}")
    return

  # Vérifs colonnes
  missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
  if missing:
    print(f"ERREUR : Colonnes manquantes : {missing}")
    print(f"Colonnes trouvées : {df.columns.tolist()}")
    return

  # Nettoyage
  df_cleaned = df.dropna(subset=FEATURES + [TARGET])
  if df_cleaned.empty:
    print("ERREUR : Aucune donnée après nettoyage (NaN).")
    return

  X = df_cleaned[FEATURES]
  y = df_cleaned[TARGET]

  print("\n--- 2) Split train/test ---")
  try:
    X_train, X_test, y_train, y_test = train_test_split(
      X,
      y,
      test_size=0.2,
      random_state=42,
      stratify=y,
    )
    print(f"Taille totale : {len(X)}")
    print(f"Train : {len(X_train)} | Test : {len(X_test)}")
  except Exception as e:
    print(f"Erreur split : {e}")
    return

  print("\n--- 3) Entraînement du modèle ---")
  model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,           # paralléliser
    class_weight=None    # ajustez à 'balanced' si fort déséquilibre
  )
  model.fit(X_train, y_train)
  print("Modèle entraîné.")

  print("\n--- 4) Évaluation ---")
  y_pred = model.predict(X_test)
  acc = accuracy_score(y_test, y_pred)
  print("===========================================================")
  print(f"✅ Accuracy test : {acc*100:.2f}%")
  print("-----------------------------------------------------------")
  print("Classification report:")
  print(classification_report(y_test, y_pred, digits=3))
  print("===========================================================")

  print("\n--- 5) Sauvegarde ---")
  joblib.dump(model, CROP_MODEL_FILE, compress=3)
  print(f"Modèle sauvegardé : {CROP_MODEL_FILE}")

  # Méta‑données utiles pour l’inférence
  save_metadata(
    META_FILE,
    FEATURES,
    TARGET,
    sklearn.__version__,
    getattr(model, "classes_", []),
  )

  print("\n--- Terminé ---")

if __name__ == "__main__":
  if not DATA_PATH.exists():
    print(f"ERREUR : Dossier data introuvable : {DATA_PATH}")
    print("Créez-le et placez-y 'Crop_recommendation.csv'.")
    sys.exit(1)

  train_crop_model()
  print("\n===========================================================")
  print("✅ Entraînement complet. Le fichier .pkl est prêt.")
  print(f"Modèle : {CROP_MODEL_FILE}")
  print(f"Méta :   {META_FILE}")
  print(f"scikit-learn : {sklearn.__version__}")
  print("===========================================================")