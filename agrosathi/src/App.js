import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import VoiceInput from "./components/VoiceInput";
import ImageUpload from "./components/ImageUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/voice" element={<VoiceInput />} />
        <Route path="/upload" element={<ImageUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
