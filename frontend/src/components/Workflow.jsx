import { Radar, Sprout, Droplets, ThermometerSun, Activity, Bell } from "lucide-react";
import codeImg from "../assets/code.jpg";

const steps = [
  {
    title: "Connexion des capteurs",
    description:
      "Branchez et associez les capteurs (humidité du sol, température, hygrométrie, rayonnement, vent) ainsi que la météo externe.",
    icon: <Radar size={20} />,
  },
  {
    title: "Configuration de la culture",
    description:
      "Sélectionnez la culture, le stade de développement, le type de sol et vos objectifs d’irrigation et de climat.",
    icon: <Sprout size={20} />,
  },
  {
    title: "Prédiction IA & irrigation",
    description:
      "Le moteur d’IA prévoit les besoins en eau, planifie les horaires et ajuste les débits pour économiser l’eau.",
    icon: <Droplets size={20} />,
  },
  {
    title: "Contrôle du climat",
    description:
      "Pilotage automatique des filets d’ombrage, de l’ouverture/fermeture des ouvrants hauts et de la ventilation.",
    icon: <ThermometerSun size={20} />,
  },
  {
    title: "Supervision temps réel",
    description:
      "Aperçu instantané des décisions (irrigation, ouvrants, ventilation) et de l’état des actionneurs.",
    icon: <Activity size={20} />,
  },
  {
    title: "Alertes & analytics",
    description:
      "Alertes en cas d’anomalies (stress hydrique, surchauffe, capteur défaillant) et tableaux de bord eau/énergie/rendements.",
    icon: <Bell size={20} />,
  },
];

const Workflow = () => {
  return (
    <div className="mt-20">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mt-6 tracking-wide text-white">
        Comment fonctionne{" "}
        <span className="bg-gradient-to-r from-green-500 to-green-800 text-transparent bg-clip-text">
          GreenBrain
        </span>
      </h2>

      <div className="flex flex-wrap justify-center">
        <div className="p-2 w-full lg:w-1/2">
          <img
            src={codeImg}
            alt="Pilotage intelligent de serre"
            className="rounded-lg border border-green-700 shadow-sm shadow-green-500/40"
          />
        </div>

        <div className="pt-12 w-full lg:w-1/2">
          {steps.map((item, index) => (
            <div key={index} className="flex mb-12">
              <div className="text-green-400 mx-6 bg-neutral-900 h-10 w-10 p-2 flex justify-center items-center rounded-full border border-green-800/50">
                {item.icon}
              </div>
              <div>
                <h5 className="mt-1 mb-2 text-xl text-white">{item.title}</h5>
                <p className="text-md text-neutral-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;
