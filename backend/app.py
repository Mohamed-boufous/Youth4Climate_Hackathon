import joblib
import numpy as np
import pandas as pd  # <--- IMPORTEZ PANDAS
from flask import Flask, request, jsonify
from flask_cors import CORS

# 1. INITIALISATION
app = Flask(__name__)
CORS(app) 

# 2. CHARGEMENT DES MODÈLES
try:
    model_vents = joblib.load('climate_vents_model.pkl')
    model_ombrage = joblib.load('climate_shade_model.pkl')
    model_irrigation = joblib.load('irrigation_model.pkl')
    print("Les 3 modèles (.pkl) ont été chargés avec succès.")
    
except FileNotFoundError:
    print("ERREUR : Fichiers .pkl manquants. Veuillez lancer 'python train_models.py'")
    model_vents = model_ombrage = model_irrigation = None
except Exception as e:
    print(f"Erreur lors du chargement des modèles : {e}")
    model_vents = model_ombrage = model_irrigation = None


# 3. ROUTE DE PRÉDICTION
@app.route('/predict', methods=['POST'])
def predict():
    if not all([model_vents, model_ombrage, model_irrigation]):
        return jsonify({'erreur': 'Modèles non chargés, le serveur n\'est pas prêt.'}), 500
        
    try:
        # 1. Récupérer les données JSON de React
        data = request.json
        print(f"Données reçues : {data}")

        # 2. Préparer les données pour chaque modèle (AVEC NOMS DE COLONNES)
        
        # Modèles Climat (attendent 3 features: Tair, rH, PARin)
        # Nous créons un DataFrame pour garantir que les noms de colonnes sont corrects
        df_climat = pd.DataFrame(
            [[data['Tair'], data['rH'], data['PARin']]],  # Les données
            columns=['Tair', 'rH', 'PARin']              # Les noms
        )
        
        # Modèle Irrigation (attendent 2 features: moisture, temp)
        # Note: le 'temp' du fichier data.csv était la temp. de l'air (Tair)
        df_irrigation = pd.DataFrame(
            [[data['moisture'], data['Tair']]],          # Les données
            columns=['moisture', 'temp']                 # Les noms
        )
        
        # 3. Exécuter les 3 prédictions
        pred_vents = model_vents.predict(df_climat)[0]
        pred_ombrage = model_ombrage.predict(df_climat)[0]
        pred_volume_eau = model_irrigation.predict(df_irrigation)[0]
        
        # 4. Formater la réponse
        reponse = {
            'decision_vents': int(pred_vents),
            'decision_ombrage': int(pred_ombrage),
            'decision_volume_eau': round(float(pred_volume_eau), 2)
        }
        
        print(f"Réponse envoyée : {reponse}")
        return jsonify(reponse)
        
    except KeyError as e:
        print(f"Erreur de clé : {e} manquant dans les données reçues.")
        return jsonify({'erreur': f'Donnée manquante : {str(e)}'}), 400
    except Exception as e:
        print(f"Erreur serveur : {e}")
        return jsonify({'erreur': str(e)}), 500

# 4. DÉMARRAGE
if __name__ == '__main__':
    print("Démarrage du serveur Flask sur http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)