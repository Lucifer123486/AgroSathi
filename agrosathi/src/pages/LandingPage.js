import React from "react";
import GradientText from "../components/GradientText";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero"
    style={{
    backgroundImage: `url("/bg.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}>
    

      {/* Overlay for dark effect */}
      <div className="overlay"></div>

      {/* Main hero content */}
      <div className="content">

        <GradientText
          colors={["#ffffff", "#40ffaa", "#ffffff", "#40ffaa", "#ffffff"]}
          animationSpeed={6}
          showBorder={false}
          className="custom-class"
        >
          AGROSATHI
        </GradientText>
        <div className="subtitle">Empowering Farmers with AI Wisdom</div>


        <div className="buttons">
          <button onClick={() => navigate("/voice")}>🎤 Ask Voice</button>
          <button onClick={() => navigate("/upload")}>📷 Upload Image</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
