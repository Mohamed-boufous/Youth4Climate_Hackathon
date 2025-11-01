import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Simulation from "./simulation";
import About from "./pages/About";
import CropRecommendation from "./CropRecommendation.jsx";
import Analytics from "./pages/Analytics.jsx";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/about" element={<About />} />
        <Route path="/crop" element={<CropRecommendation />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </>
  );
};

export default App;