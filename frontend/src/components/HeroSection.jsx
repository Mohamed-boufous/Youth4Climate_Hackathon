import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide text-white">
        GreenBrain
        <span className="bg-gradient-to-r from-green-400 to-green-700 text-transparent bg-clip-text">
          {" "}
          — IA pour serres intelligentes
        </span>
      </h1>

      <p className="mt-10 text-lg text-center text-neutral-300 max-w-4xl">
        GreenBrain est un projet d’IA qui automatise la programmation de
        l’irrigation pour économiser l’eau, particulièrement dans les serres
        maraîchères et la culture intensive. Le système contrôle aussi le climat
        de la serre (filets d’ombrage, ouverture/fermeture des ouvrants hauts,
        ventilation) en s’appuyant sur des capteurs et des modèles
        prédictifs pour optimiser rendement et consommation d’eau.
      </p>

      <div className="flex justify-center my-10">
        <Link
          to="/simulation"
          className="bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-5 mx-3 rounded-md shadow shadow-green-700/30 hover:from-green-400 hover:to-green-600 transition-colors"
        >
          Simulation en ligne
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row mt-10 justify-center w-full">
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-full sm:w-1/2 border border-green-700 shadow-sm shadow-green-500/40 mx-0 sm:mx-2 my-4"
        >
          <source src={video1} type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-full sm:w-1/2 border border-green-700 shadow-sm shadow-green-500/40 mx-0 sm:mx-2 my-4"
        >
          <source src={video2} type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
      </div>
    </div>
  );
};

export default HeroSection;
