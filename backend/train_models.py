import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import sys
import os

# -------------------------------------------------------------------
# AFFICHER LA VERSION POUR CONFIRMER LA COMPATIBILITÉ
# -------------------------------------------------------------------
try:
    import sklearn
    print(f"===========================================================")
    print(f"Utilisation de scikit-learn version : {sklearn.__version__}")
    print(f"Les modèles .pkl seront créés avec cette version.")
    print(f"===========================================================")
except ImportError:
    print("Erreur : scikit-learn n'est pas installé.")
    print("Veuillez activer votre venv et faire : pip install scikit-learn")
    sys.exit()

# -------------------------------------------------------------------
# CHEMINS DES FICHIERS
# -------------------------------------------------------------------
DATA_PATH = 'data'
CLIMATE_FILE = os.path.join(DATA_PATH, '20210703_greenhouse_data.csv')
IRRIGATION_FILE = os.path.join(DATA_PATH, 'data.csv')

MODEL_PATH = '.' 
VENTS_MODEL_FILE = os.path.join(MODEL_PATH, 'climate_vents_model.pkl')
SHADE_MODEL_FILE = os.path.join(MODEL_PATH, 'climate_shade_model.pkl')
IRRIGATION_MODEL_FILE = os.path.join(MODEL_PATH, 'irrigation_model.pkl')

def train_climate_models():
    """
    Entraîne les 2 modèles de CLASSIFICATION pour le climat 
    (Ouvrants et Ombrage).
    """
    print("\n--- 1. Entraînement des Modèles Climatiques (Classification) ---")
    
    # 1. Charger les données de la serre
    try:
        df = pd.read_csv(
            CLIMATE_FILE, 
            delimiter=';', 
            decimal=','
        )
        print(f"Fichier chargé : {CLIMATE_FILE}")
    except FileNotFoundError:
        print(f"ERREUR : Fichier non trouvé : {CLIMATE_FILE}")
        return
    except Exception as e:
        print(f"Erreur de lecture : {e}")
        return

    # 2. Sélectionner les colonnes (Features X)
    try:
        df_climate = df[[
            'greenhous_temperature_celsius', 
            'greenhouse_humidity_percentage', 
            'greenhouse_illuminance_lux'
        ]].copy()
        df_climate.columns = ['Tair', 'rH', 'PARin']
        
    except KeyError:
        print("ERREUR : Noms de colonnes introuvables dans le fichier serre.")
        print(f"Noms trouvés : {df.columns.tolist()}")
        return

    df_climate = df_climate.dropna()
    print("Données climatiques nettoyées.")
    
    # --- CORRECTION ICI ---
    # Définir X *avant* de créer les colonnes y
    # X_climate ne doit contenir que les 3 features d'entrée
    X_climate = df_climate[['Tair', 'rH', 'PARin']]
    # ----------------------

    print(f"Features climatiques (X) préparées avec {X_climate.shape[1]} colonnes.")

    # 3. Créer les Cibles (y)
    df_climate['y_vents'] = ((df_climate['Tair'] > 28) | (df_climate['rH'] > 80)).astype(int)
    y_vents = df_climate['y_vents']
    
    df_climate['y_ombrage'] = ((df_climate['Tair'] > 26) & (df_climate['PARin'] > 800)).astype(int)
    y_ombrage = df_climate['y_ombrage']
    
    print("Cibles climatiques (y_vents, y_ombrage) créées.")

    # 4. Entraîner et Sauvegarder Modèle A (Ouvrants)
    print("Entraînement Modèle A (Ouvrants)...")
    model_vents = RandomForestClassifier(random_state=42)
    # Entraîner X_climate (3 features) sur y_vents
    model_vents.fit(X_climate, y_vents)
    joblib.dump(model_vents, VENTS_MODEL_FILE)
    print(f"Modèle sauvegardé ici : {VENTS_MODEL_FILE}")

    # 5. Entraîner et Sauvegarder Modèle B (Ombrage)
    print("Entraînement Modèle B (Ombrage)...")
    model_shade = RandomForestClassifier(random_state=42)
    # Entraîner X_climate (3 features) sur y_ombrage
    model_shade.fit(X_climate, y_ombrage)
    joblib.dump(model_shade, SHADE_MODEL_FILE)
    print(f"Modèle sauvegardé ici : {SHADE_MODEL_FILE}")
    print("--- Modèles climatiques terminés. ---")


def train_irrigation_model():
    """
    Entraîne le modèle de RÉGRESSION pour le volume d'irrigation.
    """
    print("\n--- 2. Entraînement du Modèle d'Irrigation (Régression) ---")
    
    # 1. Charger les données d'irrigation
    try:
        df_irrigation = pd.read_csv(IRRIGATION_FILE)
        print(f"Fichier chargé : {IRRIGATION_FILE}")
    except FileNotFoundError:
        print(f"ERREUR : Fichier non trouvé : {IRRIGATION_FILE}")
        return
    except Exception as e:
        print(f"Erreur de lecture : {e}")
        return

    # 2. Sélectionner les colonnes (Features X)
    try:
        df_irrigation = df_irrigation[['moisture', 'temp']].dropna()
    except KeyError:
        print("ERREUR : Noms 'moisture' ou 'temp' introuvables.")
        print(f"Noms trouvés : {df_irrigation.columns.tolist()}")
        return
        
    print("Données d'irrigation nettoyées.")

    # --- CORRECTION ICI ---
    # Définir X *avant* de créer la colonne y_volume
    # X_irrigation ne doit contenir que les 2 features d'entrée
    X_irrigation = df_irrigation[['moisture', 'temp']]
    # ----------------------

    print(f"Features d'irrigation (X) préparées avec {X_irrigation.shape[1]} colonnes.")

    # 3. Créer la Cible (y) - Volume d'eau (L/m²)
    SET_POINT = 900
    WATER_FACTOR = 0.05 

    df_irrigation['deficit'] = SET_POINT - df_irrigation['moisture']
    df_irrigation['y_volume'] = df_irrigation['deficit'] * WATER_FACTOR
    df_irrigation['y_volume'] = df_irrigation['y_volume'].apply(lambda x: max(0, x))
    
    y_volume = df_irrigation['y_volume']
    print("Cible d'irrigation (y_volume) créée.")

    # 4. Entraîner et Sauvegarder le Modèle 3 (Irrigation)
    print("Entraînement Modèle C (Irrigation)...")
    model_irrigation = RandomForestRegressor(random_state=42)
    # Entraîner X_irrigation (2 features) sur y_volume
    model_irrigation.fit(X_irrigation, y_volume)
    joblib.dump(model_irrigation, IRRIGATION_MODEL_FILE)
    print(f"Modèle sauvegardé ici : {IRRIGATION_MODEL_FILE}")
    print("--- Modèle d'irrigation terminé. ---")


# -------------------------------------------------------------------
# EXÉCUTER L'ENTRAÎNEMENT
# -------------------------------------------------------------------
if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        print(f"ERREUR : Le dossier '{DATA_PATH}' est introuvable.")
        print("Veuillez le créer dans 'backend/' et y placer vos CSV.")
    else:
        train_climate_models()
        train_irrigation_model()
        print("\n===========================================================")
        print("✅ Entraînement complet. Vos 3 fichiers .pkl corrigés sont prêts !")
        print(f"Version scikit-learn : {sklearn.__version__} (Compatible)")
        print("===========================================================")