import { Cpu, Activity, Radar, Bell, BarChart3, LayoutGrid } from "lucide-react";

const features = [
  {
    text: "AI Integration Système",
    description:
      "Moteur d’IA pour planifier automatiquement l’irrigation et le climat de la serre selon la culture, la météo et l’historique.",
    icon: <Cpu size={20} />,
  },
  {
    text: "Real-Time Preview",
    description:
      "Aperçu en temps réel des décisions (débit d’eau, ouverture des ouvrants, ventilation) avec mise à jour instantanée.",
    icon: <Activity size={20} />,
  },
  {
    text: "Multi-capteurs Sources",
    description:
      "Agrégation de multiples capteurs (humidité du sol, température, hygrométrie, rayonnement, vent) et données météo externes.",
    icon: <Radar size={20} />,
  },
  {
    text: "Alert Système Intégration",
    description:
      "Alertes intelligentes en cas d’anomalies (stress hydrique, surchauffe, pannes capteurs).",
    icon: <Bell size={20} />,
  },
  {
    text: "Analytics Dashboard",
    description:
      "Tableaux de bord pour suivre consommation d’eau, efficacité énergétique, rendements et historiques par parcelle.",
    icon: <BarChart3 size={20} />,
  },
  {
    text: "Built‑in Templates",
    description:
      "Modèles prêts à l’emploi par type de culture et saison pour un démarrage rapide et paramétrages cohérents.",
    icon: <LayoutGrid size={20} />,
  },
];

const FeatureSection = () => {
  return (
    <div className="relative mt-20 border-b border-green-800/60 min-h-[800px]">
      <div className="text-center">
        <span className="bg-neutral-900 text-green-500 rounded-full h-6 text-sm font-medium px-2 py-1 uppercase">
          Fonctionnalités
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking-wide text-white">
          Optimisez vos serres{" "}
          <span className="bg-gradient-to-r from-green-500 to-green-800 text-transparent bg-clip-text">
            avec GreenBrain
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap mt-10 lg:mt-20">
        {features.map((feature, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3">
            <div className="flex p-2">
              <div className="flex mx-6 h-10 w-10 p-2 bg-neutral-900 text-green-600 justify-center items-center rounded-full border border-green-800/50">
                {feature.icon}
              </div>
              <div>
                <h5 className="mt-1 mb-3 text-xl text-white">{feature.text}</h5>
                <p className="text-md p-2 mb-14 text-neutral-300">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;
