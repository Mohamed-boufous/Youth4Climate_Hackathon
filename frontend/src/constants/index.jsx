import { Cpu, Activity, Radar, Bell, BarChart3, LayoutGrid } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Simulation", href: "/simulation" },
  { label: "About Us", href: "/about" },
];

export const testimonials = [
  {
    user: "Amina B.",
    company: "Ferme Oasis",
    image: user1,
    text: "GreenBrain a réduit notre consommation d’eau de 28% tout en stabilisant la production sous serre. Les alertes nous évitent les pics de chaleur.",
  },
  {
    user: "Karim M.",
    company: "AgriSud Serres",
    image: user2,
    text: "L’IA planifie l’irrigation selon la météo et le stade de culture. On gagne du temps et on évite le stress hydrique.",
  },
  {
    user: "Sofia L.",
    company: "BioGreen Coop",
    image: user3,
    text: "La prévisualisation en temps réel des décisions (ouvrants, ventilation) nous aide à comprendre et ajuster rapidement.",
  },
  {
    user: "Hassan T.",
    company: "Atlas Horticulture",
    image: user4,
    text: "Les templates par culture sont très utiles. Démarrage rapide et paramètres cohérents dès le premier jour.",
  },
  {
    user: "Nadia R.",
    company: "AgroTech Lab",
    image: user5,
    text: "Le tableau de bord eau/énergie est clair. Nous suivons l’efficacité par parcelle et saison sans effort.",
  },
  {
    user: "Youssef K.",
    company: "Serres du Littoral",
    image: user6,
    text: "Super système d’alertes: capteurs défaillants, surchauffe, tout est détecté à temps. Zéro perte cette saison.",
  },
];

export const features = [
  {
    icon: <Cpu size={20} />,
    text: "AI Integration Système",
    description:
      "Moteur d’IA qui planifie l’irrigation et le climat (ombrage, ouvrants, ventilation) selon la culture, la météo et l’historique.",
  },
  {
    icon: <Activity size={20} />,
    text: "Real-Time Preview",
    description:
      "Aperçu en temps réel des décisions et états des actionneurs avec mises à jour instantanées.",
  },
  {
    icon: <Radar size={20} />,
    text: "Multi-capteurs Sources",
    description:
      "Agrégation de capteurs (humidité du sol, température, hygrométrie, rayonnement, vent) + données météo externes.",
  },
  {
    icon: <Bell size={20} />,
    text: "Alert Système Intégration",
    description:
      "Alertes intelligentes (stress hydrique, surchauffe, pannes capteurs) par e‑mail/SMS pour interventions rapides.",
  },
  {
    icon: <BarChart3 size={20} />,
    text: "Analytics Dashboard",
    description:
      "Suivi de la consommation d’eau, efficacité énergétique, rendements et historiques par parcelle/saison.",
  },
  {
    icon: <LayoutGrid size={20} />,
    text: "Built‑in Templates",
    description:
      "Modèles prêts à l’emploi par type de culture et saison pour un démarrage rapide et des réglages fiables.",
  },
];

// Optionnel: autres sections (non utilisées par l’interface actuelle), adaptées au contexte
export const checklistItems = [
  {
    title: "Connexion des capteurs",
    description: "Humidité du sol, température, hygrométrie, rayonnement, vent.",
  },
  {
    title: "Configuration de la culture",
    description: "Type de culture, stade, sol et objectifs d’irrigation/climat.",
  },
  {
    title: "Supervision en temps réel",
    description: "Décisions IA, états des actionneurs et historique récent.",
  },
  {
    title: "Rapports & analytics",
    description: "Consommation d’eau/énergie et rendements par parcelle.",
  },
];

// Conservés pour compatibilité si utilisés ailleurs
export const pricingOptions = [
  {
    title: "Starter",
    price: "€0",
    features: [
      "Simulation en ligne",
      "1 serre",
      "Vue basique capteurs",
      "Alertes e‑mail",
    ],
  },
  {
    title: "Pro",
    price: "€29",
    features: [
      "Jusqu’à 5 serres",
      "Templates cultures",
      "Analytics avancés",
      "Alertes e‑mail/SMS",
    ],
  },
  {
    title: "Enterprise",
    price: "Sur devis",
    features: [
      "Serres illimitées",
      "Intégration API/SCADA",
      "SLA et support dédié",
      "Modèles IA sur mesure",
    ],
  },
];

export const resourcesLinks = [
  { href: "#simulation", text: "Simulation en ligne" },
  { href: "#home", text: "Guide de démarrage" },
  { href: "#about", text: "À propos" },
  { href: "#", text: "API (bientôt)" },
  { href: "#", text: "Communauté" },
];

export const platformLinks = [
  { href: "#home", text: "Fonctionnalités" },
  { href: "#", text: "Capteurs supportés" },
  { href: "#", text: "Exigences système" },
  { href: "#", text: "Téléchargements" },
  { href: "#", text: "Notes de version" },
];

export const communityLinks = [
  { href: "#", text: "Événements" },
  { href: "#", text: "Meetups" },
  { href: "#", text: "Conférences" },
  { href: "#", text: "Hackathons" },
  { href: "#", text: "Offres d’emploi" },
];
