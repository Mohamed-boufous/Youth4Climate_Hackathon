import random
import sys
import pygame
import math

# --- Initialisation de Pygame ---
pygame.init()
pygame.font.init()

# --- Constantes de l'Affichage ---
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Simulation de Serre Intelligente")
clock = pygame.time.Clock()
UI_FONT = pygame.font.SysFont('Arial', 20)
UI_FONT_SMALL = pygame.font.SysFont('Arial', 16)
PLANT_FONT = pygame.font.SysFont('Arial', 10)

# --- CHEMINS D'ACCÈS AUX IMAGES (REMPLISSEZ CECI) ---
# 2. Mettez les chemins d'accès à vos images locales ici
DRONE_IMAGE_PATH = "img/drone.png" # <-- METTEZ VOTRE CHEMIN ICI
PLANT_IMAGE_PATH = "img/plant.png" # <-- METTEZ VOTRE CHEMIN ICI

# --- Couleurs ---
COLOR_WHITE = (255, 255, 255)
COLOR_BLACK = (0, 0, 0)
COLOR_GREEN = (40, 180, 99)
COLOR_DRY = (240, 230, 140) # Jaune/Kaki
COLOR_BLUE_CHANNEL_OFF = (0, 0, 139) # Bleu foncé
COLOR_BLUE_CHANNEL_ON = (0, 255, 255) # Cyan
COLOR_DRONE_PATH = (255, 182, 193) # Rose clair
COLOR_DRONE_FALLBACK = (30, 30, 30)
COLOR_UI_BOX = (230, 230, 230)
COLOR_UI_BOX_BORDER = (100, 100, 100)
COLOR_GREENHOUSE_BG = (245, 245, 245)
COLOR_GREENHOUSE_BORDER = (50, 50, 50)
COLOR_ROOF_SLIDER_BG = (200, 200, 200)
COLOR_ROOF_SLIDER_FG = (0, 120, 255)
COLOR_SENSOR_BLINK = (255, 0, 0) # Rouge pour le capteur
COLOR_IRRIGATION_ACTIVE = (0, 100, 255) # Bleu pour le texte d'irrigation

# --- Chargement des Images (Point 2) ---
try:
    DRONE_IMG = pygame.image.load(DRONE_IMAGE_PATH)
    
    DRONE_IMG = pygame.transform.scale(DRONE_IMG, (50, 50))
    print(f"Image du drone chargée depuis : {DRONE_IMAGE_PATH}")
except Exception as e:
    print(f"Erreur chargement image drone ({e}). Utilisation du carré par défaut.")
    DRONE_IMG = None

try:
    PLANT_IMG = pygame.image.load(PLANT_IMAGE_PATH)
    PLANT_IMG = pygame.transform.scale(PLANT_IMG, (40, 40))
    print(f"Image de plante chargée depuis : {PLANT_IMAGE_PATH}")
except Exception as e:
    print(f"Erreur chargement image plante ({e}). Utilisation des cercles par défaut.")
    PLANT_IMG = None


# --- Classes de Simulation (Modifiées pour le visuel) ---

class Plant:
    """ Composant 2: Plante avec capteur ET position visuelle """
    def __init__(self, plant_id, row, x, y):
        self.id = plant_id
        self.row = row
        self.x = x
        self.y = y
        self.radius = 12
        self.soil_humidity = 70.0  
        
    def update(self, temperature, water_channel_status):
        # Ralentissement de la simulation pour la rendre plus visible
        drying_rate = (0.5 + (temperature / 50.0)) * 0.1
        if self.soil_humidity > 0:
            self.soil_humidity -= drying_rate
            
        if water_channel_status == "ON":
            self.receive_water(2.0 * 0.1)
            
    def receive_water(self, amount):
        self.soil_humidity = min(100.0, self.soil_humidity + amount)

    def get_humidity_data(self):
        simulated_noise = random.uniform(-3.0, 3.0)
        sensor_reading = self.soil_humidity + simulated_noise
        return {
            "plant_id": self.id,
            "row": self.row,
            "humidity": sensor_reading
        }

    def draw(self, surface):
        if PLANT_IMG:
            # 2. Dessine l'image si elle est chargée
            img_copy = PLANT_IMG.copy()
            # Change l'opacité/couleur en fonction de l'humidité
            humidity_percent = max(0, min(1, self.soil_humidity / 100.0))
            # 100 = sec (jaune/pâle), 255 = sain
            alpha = 100 + (155 * humidity_percent) 
            img_copy.set_alpha(int(alpha))
            surface.blit(img_copy, (self.x - self.radius, self.y - self.radius))
        else:
            # Fallback : Dessine un cercle
            humidity_percent = max(0, min(1, self.soil_humidity / 100.0))
            r = COLOR_DRY[0] + (COLOR_GREEN[0] - COLOR_DRY[0]) * humidity_percent
            g = COLOR_DRY[1] + (COLOR_GREEN[1] - COLOR_DRY[1]) * humidity_percent
            b = COLOR_DRY[2] + (COLOR_GREEN[2] - COLOR_DRY[2]) * humidity_percent
            pygame.draw.circle(surface, (int(r), int(g), int(b)), (self.x, self.y), self.radius)
        
        # --- AJOUT DU CAPTEUR CLIGNOTANT ---
        # Fait clignoter le capteur toutes les 500ms (demi-seconde)
        if (pygame.time.get_ticks() // 500) % 2 == 0:
            sensor_pos = (self.x, self.y + self.radius + 5) # Juste en dessous du centre
            pygame.draw.circle(surface, COLOR_SENSOR_BLINK, sensor_pos, 3) # Dessine un petit point rouge
        # --- FIN DE L'AJOUT ---

        # Affiche l'ID de la plante
        id_text = PLANT_FONT.render(self.id, True, COLOR_BLACK)
        surface.blit(id_text, (self.x + self.radius, self.y + self.radius + 10))

class Sunroof:
    """ Composant 3: Toit ouvrant (logique inchangée) """
    def __init__(self):
        self.open_percentage = 0  # Commence fermé

    def open(self, value):
        self.open_percentage = max(0, self.open_percentage - value)

    def close(self, value):
        self.open_percentage = min(100, self.open_percentage + value)

class Basin:
    """ Composant 7: Bassin d'eau (logique inchangée) """
    def __init__(self, initial_water_liters):
        self.water_level = initial_water_liters

    def request_water(self, liters):
        if self.water_level >= liters:
            self.water_level -= liters
            return True
        else:
            return False

class Greenhouse:
    """ Composant 1: Serre (gère maintenant la disposition visuelle) """
    def __init__(self):
        print("[Greenhouse] Construction de la serre visuelle.")
        self.plants = []
        self.water_channels = {} 
        
        # 1. --- Définition de la disposition (basée sur l'image) ---
        self.num_rows = 6
        self.plants_per_row = 4 # 3 ou 4 dans l'image, 3 est plus simple
        
        # 1. Coordonnées de la serre (pour le dessin)
        self.greenhouse_rect = pygame.Rect(50, 80, 600, 480)
        self.roof_points = [
            (self.greenhouse_rect.left, self.greenhouse_rect.top),
            (self.greenhouse_rect.left + 50, self.greenhouse_rect.top - 30),
            (self.greenhouse_rect.right - 50, self.greenhouse_rect.top - 30),
            (self.greenhouse_rect.right, self.greenhouse_rect.top)
        ]

        start_x = self.greenhouse_rect.left + 80
        start_y = self.greenhouse_rect.top + 100
        row_spacing = (self.greenhouse_rect.width - 160) / (self.num_rows - 1)
        plant_spacing = (self.greenhouse_rect.height - 200) / (self.plants_per_row - 1)

        self.plant_coords = []
        self.channel_coords = []

        for r in range(self.num_rows):
            self.water_channels[r] = "OFF"
            channel_x = int(start_x + r * row_spacing)
            # Coords pour la *ligne* visuelle du canal
            self.channel_coords.append(
                ( (channel_x, start_y - 20), (channel_x, start_y + (self.plants_per_row - 1) * plant_spacing + 20) )
            )
            
            for p in range(self.plants_per_row):
                plant_id = f"P{r+1}-{p+1}"
                pos_x = channel_x
                pos_y = int(start_y + p * plant_spacing)
                self.plants.append(Plant(plant_id, row=r, x=pos_x, y=pos_y))
        
        self.sunroof = Sunroof()
        self.internal_temperature = 20.0 
        
    def update_environment(self):
        """ Met à jour l'état interne (température, plantes) """
        # La simulation est maintenant 10x plus lente (0.1)
        temp_change = 0.0
        if self.sunroof.open_percentage > 50:
            temp_change = -0.5 * 0.1
        else:
            temp_change = 1.0 * 0.1
        
        self.internal_temperature += temp_change
        self.internal_temperature = max(10.0, min(45.0, self.internal_temperature))
        
        for plant in self.plants:
            channel_status = self.water_channels[plant.row]
            plant.update(self.internal_temperature, channel_status)

    def draw(self, surface):
        # 1. Dessine le fond de la serre (rect)
        pygame.draw.rect(surface, COLOR_GREENHOUSE_BG, self.greenhouse_rect, border_radius=5)
        
        # 1. Dessine le toit (polygone)
        pygame.draw.polygon(surface, COLOR_GREENHOUSE_BG, self.roof_points)
        pygame.draw.lines(surface, COLOR_GREENHOUSE_BORDER, False, self.roof_points, 2)
        
        # 1. Dessine le contour de la serre
        pygame.draw.rect(surface, COLOR_GREENHOUSE_BORDER, self.greenhouse_rect, 2, border_radius=5)

        # Dessine les canaux d'eau
        for i, (start_pos, end_pos) in enumerate(self.channel_coords):
            color = COLOR_BLUE_CHANNEL_ON if self.water_channels[i] == "ON" else COLOR_BLUE_CHANNEL_OFF
            pygame.draw.line(surface, color, start_pos, end_pos, 3)

        # Dessine les plantes
        for plant in self.plants:
            plant.draw(surface)

class Controller:
    """ Composant 5: Boîtier de contrôle (logique inchangée) """
    def __init__(self, greenhouse, basin):
        self.greenhouse = greenhouse
        self.basin = basin
        self.pump_status = "OFF"

    def set_water_channel_status(self, row, status):
        if status == "ON" and self.greenhouse.water_channels.get(row) == "OFF":
            if self.basin.request_water(5): 
                self.greenhouse.water_channels[row] = "ON"
                print(f"[Controller] Pompe activée pour la rangée {row}.")
            else:
                print(f"[Controller] Échec (rangée {row}). Bassin vide.")
        elif status == "OFF":
            if self.greenhouse.water_channels.get(row) == "ON":
                print(f"[Controller] Pompe désactivée pour la rangée {row}.")
            self.greenhouse.water_channels[row] = "OFF"

    def control_sunroof(self, command, value):
        if command == "OPEN_TO_INCREASE":
            self.greenhouse.sunroof.close(value)
        elif command == "CLOSE_TO_DECREASE":
            self.greenhouse.sunroof.open(value)

class Station:
    """ Composant 6: Station d'analyse (logique inchangée) """
    def __init__(self, controller):
        self.controller = controller
        print("[Station] Initialisée. Prête à analyser.")
        
    def analyze_data(self, data_from_drone, current_temperature):
        print(f"\n[Station] Analyse des données reçues...")
        
        if not data_from_drone:
            print("[Station] Aucune donnée reçue.")
            return

        humidity_by_row = {}
        for data in data_from_drone:
            row = data["row"]
            if row not in humidity_by_row:
                humidity_by_row[row] = []
            humidity_by_row[row].append(data["humidity"])
            
        for row, humidities in humidity_by_row.items():
            if not humidities: continue
            avg_humidity = sum(humidities) / len(humidities)
            print(f"[Station] Rangée {row}: Humidité moyenne = {avg_humidity:.2f}%")
            
            if avg_humidity < 40.0:
                print(f"[Station] DÉCISION: Humidité basse (Rangée {row}). Activation.")
                self.controller.set_water_channel_status(row, "ON")
            elif avg_humidity > 75.0:
                print(f"[Station] DÉCISION: Humidité OK (Rangée {row}). Arrêt.")
                self.controller.set_water_channel_status(row, "OFF")

        print(f"[Station] Température serre: {current_temperature:.2f}°C")
        if current_temperature > 30.0:
            print("[Station] DÉCISION: Température élevée. Ouverture toit.")
            self.controller.control_sunroof("OPEN_TO_INCREASE", 20)
        elif current_temperature < 22.0:
            print("[Station] DÉCISION: Température basse. Fermeture toit.")
            self.controller.control_sunroof("CLOSE_TO_DECREASE", 10)

class Drone:
    """ Composant 4: Drone de surveillance (avec logique de mouvement) """
    def __init__(self, station):
        self.station = station
        self.speed = 4.0 # pixels par frame
        self.is_on_mission = False
        self.mission_data = {}
        
        # 1. --- Trajectoire (basée sur la nouvelle disposition) ---
        start_x = 150
        start_y = 120
        end_y = 450
        row_spacing = (600 - 160) / 5
        
        self.path = []
        self.path.append((50, 120)) # Point de départ
        for i in range(6): # 6 rangées
            x = int(start_x - 70 + i * row_spacing)
            if i % 2 == 0:
                self.path.append((x, start_y))
                self.path.append((x, end_y))
            else:
                self.path.append((x, end_y))
                self.path.append((x, start_y))
        
        self.path.append((int(start_x - 70 + 5 * row_spacing), 80)) # Point de sortie
        
        self.path_index = 0
        (self.x, self.y) = self.path[0]

    def start_mission(self, greenhouse):
        if self.is_on_mission: return
        print("\n[Drone] Décollage... Mission de collecte de données.")
        self.is_on_mission = True
        self.path_index = 0
        self.mission_data = {}
        self.greenhouse_ref = greenhouse # Référence pour l'analyse
        (self.x, self.y) = self.path[0]

    def update(self, plants):
        if not self.is_on_mission:
            return

        # 1. Atteindre le prochain point de la trajectoire
        if self.path_index >= len(self.path):
            self.end_mission()
            return

        target_x, target_y = self.path[self.path_index]
        
        # Mouvement vers la cible
        dx = target_x - self.x
        dy = target_y - self.y
        dist = math.sqrt(dx**2 + dy**2)
        
        if dist < self.speed:
            # Point atteint
            self.x = target_x
            self.y = target_y
            self.path_index += 1
        else:
            # Déplacement
            self.x += (dx / dist) * self.speed
            self.y += (dy / dist) * self.speed
            
        # 2. Scanner les plantes à proximité
        for plant in plants:
            scan_dist = math.sqrt((self.x - plant.x)**2 + (self.y - plant.y)**2)
            if scan_dist < 40 and plant.id not in self.mission_data:
                # Scanne la plante si elle est proche ET pas déjà scannée
                data = plant.get_humidity_data()
                print(f"  [Drone] Scan {data['plant_id']}: {data['humidity']:.2f}%")
                self.mission_data[plant.id] = data

    def end_mission(self):
        print("[Drone] Mission terminée. Envoi des données à la station.")
        self.is_on_mission = False
        data_list = list(self.mission_data.values())
        temp = self.greenhouse_ref.internal_temperature
        self.station.analyze_data(data_list, temp)

    def draw(self, surface):
        if self.is_on_mission:
            if DRONE_IMG:
                # 2. Dessine l'image si elle est chargée
                surface.blit(DRONE_IMG, (self.x - 15, self.y - 15))
            else:
                # Fallback : Dessine un rectangle
                pygame.draw.rect(surface, COLOR_DRONE_FALLBACK, (self.x - 10, self.y - 10, 20, 20))
                pygame.draw.rect(surface, COLOR_WHITE, (self.x - 10, self.y - 10, 20, 20), 1)

    def draw_path(self, surface):
        if len(self.path) > 1:
            # 1. Ajustement de la trajectoire pour la nouvelle disposition
            pygame.draw.lines(surface, COLOR_DRONE_PATH, False, self.path, 3)

# --- Fonction d'aide pour dessiner le texte de l'UI ---
def draw_text(text, x, y, surface, font=UI_FONT, color=COLOR_BLACK):
    text_obj = font.render(text, True, color)
    surface.blit(text_obj, (x, y))

# 3. --- Nouvelle fonction pour dessiner la barre du toit ouvrant ---
def draw_sunroof_slider(surface, x, y, width, height, percentage):
    # Dessine le rail
    pygame.draw.rect(surface, COLOR_ROOF_SLIDER_BG, (x, y, width, height), border_radius=4)
    # Calcule la largeur de la partie remplie
    fill_width = (percentage / 100) * width
    pygame.draw.rect(surface, COLOR_ROOF_SLIDER_FG, (x, y, fill_width, height), border_radius=4)
    # Calcule la position du curseur
    cursor_x = int(x + fill_width)
    pygame.draw.circle(surface, COLOR_WHITE, (cursor_x, y + height // 2), height)
    # Dessine le texte
    draw_text(f"{percentage:.0f}% Ouvert", x + width + 10, y, surface, font=UI_FONT_SMALL)

# --- Boucle Principale de Simulation (ex-run_simulation) ---
def main_simulation_loop():
    print("--- DÉMARRAGE DE LA SIMULATION VISUELLE ---")
    
    # 1. Initialisation des composants
    basin = Basin(initial_water_liters=1000)
    greenhouse = Greenhouse()
    controller = Controller(greenhouse, basin)
    station = Station(controller)
    drone = Drone(station)
    
    # 2. Variables de temps de simulation
    current_hour = 0
    # 1 heure de sim = 2000 ms (2 secondes)
    SIM_HOUR_MS = 2000  
    last_hour_update = pygame.time.get_ticks()
    
    drone_mission_hour_trigger = 4 # Toutes les 4 heures
    drone_mission_triggered_for_hour = False
    
    running = True
    while running:
        # --- Gestion des Événements ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        current_time = pygame.time.get_ticks()

        # --- Logique de Simulation (basée sur le temps) ---
        if current_time - last_hour_update > SIM_HOUR_MS:
            # Une "heure" s'est écoulée
            greenhouse.update_environment()
            current_hour = (current_hour + 1) % 24
            last_hour_update = current_time
            drone_mission_triggered_for_hour = False # Réinitialise le trigger
            print(f"--- Heure {current_hour} ---")

        # --- Logique du Drone ---
        if (current_hour % drone_mission_hour_trigger == 0 and 
            not drone.is_on_mission and 
            not drone_mission_triggered_for_hour):
            
            drone.start_mission(greenhouse)
            drone_mission_triggered_for_hour = True
        
        # Met à jour la position du drone (à chaque frame)
        drone.update(greenhouse.plants)

        # --- Affichage (Dessin) ---
        screen.fill(COLOR_WHITE)
        
        # Dessine les composants statiques (schéma)
        drone.draw_path(screen)
        greenhouse.draw(screen)
        
        # Dessine le drone
        drone.draw(screen)

        # 1. --- Dessine l'UI (Bassin, Contrôleur, Station) selon la nouvelle disposition ---
        ui_box_x = 680
        ui_box_width = 200
        
        # Boîte Bassin
        pygame.draw.rect(screen, COLOR_BLACK, (ui_box_x, 100, ui_box_width, 80), 2, border_radius=5)
        draw_text("Bassin", ui_box_x + 20, 110, screen)
        draw_text(f"{basin.water_level} L", ui_box_x + 40, 140, screen)

        # Boîte Contrôleur
        pygame.draw.rect(screen, COLOR_BLACK, (ui_box_x, 220, ui_box_width, 80), 2, border_radius=5)
        draw_text("Controlleur", ui_box_x + 20, 230, screen)
        # CORRECTION: Utilisation d'un argument nommé (keyword argument) pour la couleur
        draw_text("ACTIF", ui_box_x + 40, 260, screen, color=(0, 150, 0))

        # Boîte PC Central
        pygame.draw.rect(screen, COLOR_BLACK, (ui_box_x, 340, ui_box_width, 80), 2, border_radius=5)
        draw_text("PC Central (Station)", ui_box_x + 20, 350, screen)
        draw_text("Analyse...", ui_box_x + 40, 380, screen)
        
        # Lignes de connexion
        pygame.draw.line(screen, COLOR_BLACK, (ui_box_x + 100, 180), (ui_box_x + 100, 220), 2)
        pygame.draw.line(screen, COLOR_BLACK, (ui_box_x + 100, 300), (ui_box_x + 100, 340), 2)
        
        # Connexion à la serre
        pygame.draw.line(screen, COLOR_BLUE_CHANNEL_OFF, (greenhouse.greenhouse_rect.right, 260), (ui_box_x, 260), 4)

        # --- VÉRIFICATION DE L'IRRIGATION (POUR L'AFFICHAGE) ---
        is_irrigating = False
        for status in greenhouse.water_channels.values():
            if status == "ON":
                is_irrigating = True
                break
        # --- FIN VÉRIFICATION ---

        # 1. & 3. --- Dessine l'état de la serre (Température et Toit) selon l'image ---
        draw_text(f"Heure: {current_hour}:00", 20, 20, screen)
        
        # --- AJOUT DU TEXTE D'IRRIGATION ---
        if is_irrigating:
            draw_text("IRRIGATION EN COURS", 150, 20, screen, color=COLOR_IRRIGATION_ACTIVE)
        # --- FIN DE L'AJOUT ---

        # Température (style de l'image)
        pygame.draw.rect(screen, COLOR_WHITE, (greenhouse.greenhouse_rect.right - 70, greenhouse.greenhouse_rect.top + 10, 60, 30), border_radius=5)
        pygame.draw.rect(screen, COLOR_BLACK, (greenhouse.greenhouse_rect.right - 70, greenhouse.greenhouse_rect.top + 10, 60, 30), 1, border_radius=5)
        draw_text(f"{greenhouse.internal_temperature:.1f}°C", greenhouse.greenhouse_rect.right - 65, greenhouse.greenhouse_rect.top + 12, screen, font=UI_FONT_SMALL)

        # Toit (style de l'image)
        draw_sunroof_slider(screen, greenhouse.roof_points[1][0] + 10, greenhouse.roof_points[1][1] + 10, 100, 10, greenhouse.sunroof.open_percentage)

        # --- Mettre à jour l'écran ---
        pygame.display.flip()
        
        # Limite à 60 FPS
        clock.tick(60) 

    pygame.quit()
    sys.exit()

# --- Point d'entrée du script ---
if __name__ == "__main__":
    main_simulation_loop()

