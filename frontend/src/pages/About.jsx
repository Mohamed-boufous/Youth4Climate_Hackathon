import { Link } from "react-router-dom";
import {
  Brain,
  Droplets,
  ThermometerSun,
  Radar,
  Wind,
  Activity,
  Bell,
  BarChart3,
  LayoutGrid,
} from "lucide-react";

// Imports des images locales
import Oussama_Benzzi from "../assets/Oussama_Benzzi.jpeg";
import Mohamed_boufous from "../assets/Mohamed_boufous.jpg";
import laila_ililou from "../assets/laila_ililou.jpeg";
import houda_bamhine from "../assets/houda_bamhine.jpeg";
import Abdessalam_Ait_Oubanali from "../assets/ABDESSALAM _AIT_OUBANALI.jpg";

// Équipe (sans rôles)
const teamMembers = [
  { name: "Oussama Benzzi", image: Oussama_Benzzi },
  { name: "Mohamed Boufous", image: Mohamed_boufous },
  { name: "Laila Ililou", image: laila_ililou },
  { name: "Houda Bamhine", image: houda_bamhine },
  { name: "Abdessalam Ait Oubanali", image: Abdessalam_Ait_Oubanali },
];

const About = () => {
  return (
    <div className="max-w-5xl mx-auto pt-24 px-6">
      <h1 className="text-4xl sm:text-5xl text-white mb-6">
        À propos de{" "}
        <span className="bg-gradient-to-r from-green-500 to-green-800 text-transparent bg-clip-text">
          GreenBrain
        </span>
      </h1>

      <p className="text-neutral-300 leading-relaxed">
        GreenBrain est une solution d’intelligence artificielle dédiée aux serres
        intelligentes. Elle automatise la programmation de l’irrigation pour économiser
        l’eau, et pilote le climat de la serre (filets d’ombrage, ouverture/fermeture
        des ouvrants hauts, ventilation) à partir des capteurs et des données météo,
        afin d’optimiser les rendements en culture maraîchère et intensive.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/60 border border-green-800/50 rounded-xl p-5">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="text-green-500" size={20} />
            Notre mission
          </h2>
          <ul className="text-neutral-300 space-y-3">
            <li className="flex items-start gap-3">
              <Droplets size={18} className="text-green-500 mt-1" />
              <span>Réduire la consommation d’eau de 20–30% grâce à l’irrigation pilotée par IA.</span>
            </li>
            <li className="flex items-start gap-3">
              <ThermometerSun size={18} className="text-green-500 mt-1" />
              <span>Stabiliser le climat sous serre pour limiter le stress des plantes.</span>
            </li>
            <li className="flex items-start gap-3">
              <Brain size={18} className="text-green-500 mt-1" />
              <span>Simplifier l’exploitation avec des décisions automatiques et transparentes.</span>
            </li>
          </ul>
        </div>

        <div className="bg-neutral-900/60 border border-green-800/50 rounded-xl p-5">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Radar className="text-green-500" size={20} />
            Comment ça marche
          </h2>
          <ul className="text-neutral-300 space-y-3">
            <li className="flex items-start gap-3">
              <Radar size={18} className="text-green-500 mt-1" />
              <span>Connexion des capteurs: humidité du sol, T°, hygrométrie, rayonnement, vent.</span>
            </li>
            <li className="flex items-start gap-3">
              <Brain size={18} className="text-green-500 mt-1" />
              <span>Prédictions IA des besoins en eau et décisions d’irrigation/climat.</span>
            </li>
            <li className="flex items-start gap-3">
              <Wind size={18} className="text-green-500 mt-1" />
              <span>Actionneurs: ombrage, ouvrants, ventilation réglés automatiquement.</span>
            </li>
            <li className="flex items-start gap-3">
              <Activity size={18} className="text-green-500 mt-1" />
              <span>Supervision en temps réel et alertes en cas d’anomalies.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-neutral-900/60 border border-green-800/50 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="text-green-500" size={20} />
          Fonctionnalités clés
        </h2>
        <ul className="grid md:grid-cols-2 gap-3 text-neutral-300">
          <li className="flex items-start gap-3">
            <Brain size={18} className="text-green-500 mt-1" />
            <span>AI Integration Système (irrigation + climat).</span>
          </li>
          <li className="flex items-start gap-3">
            <Activity size={18} className="text-green-500 mt-1" />
            <span>Real-Time Preview des décisions et actionneurs.</span>
          </li>
          <li className="flex items-start gap-3">
            <Radar size={18} className="text-green-500 mt-1" />
            <span>Multi-capteurs Sources + météo externe.</span>
          </li>
          <li className="flex items-start gap-3">
            <Bell size={18} className="text-green-500 mt-1" />
            <span>Alert Système Intégration (stress hydrique, surchauffe, capteurs).</span>
          </li>
          <li className="flex items-start gap-3">
            <BarChart3 size={18} className="text-green-500 mt-1" />
            <span>Analytics Dashboard (eau, énergie, rendements).</span>
          </li>
          <li className="flex items-start gap-3">
            <LayoutGrid size={18} className="text-green-500 mt-1" />
            <span>Built‑in Templates par culture et saison.</span>
          </li>
        </ul>
      </div>

      {/* Bouton centré */}
      <div className="mt-10 flex justify-center">
        <Link
          to="/simulation"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-6 rounded-md shadow shadow-green-700/30 hover:from-green-400 hover:to-green-600 transition-colors"
        >
          <Activity size={18} />
          Lancer la simulation
        </Link>
      </div>

      {/* Section équipe (images locales, sans rôles) */}
      <div className="mt-16">
        <h2 className="text-2xl sm:text-3xl text-white mb-6">
          Notre{" "}
          <span className="bg-gradient-to-r from-green-500 to-green-800 text-transparent bg-clip-text">
            équipe
          </span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((m, i) => (
            <div
              key={i}
              className="bg-neutral-900/60 border border-green-800/50 rounded-xl p-5 flex items-center gap-4"
            >
              <img
                src={m.image}
                alt={m.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-600"
                loading="lazy"
              />
              <div>
                <div className="text-white font-semibold">{m.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;