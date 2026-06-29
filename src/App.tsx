import React, { useState } from "react";
import IntroScreen from "./components/IntroScreen";
import QuizStep from "./components/QuizStep";
import VoiceStylist from "./components/VoiceStylist";
import FitRecommendation from "./components/FitRecommendation";
import { FitProfile, INITIAL_FIT_PROFILE } from "./types";

type FlowMode = "intro" | "manual" | "voice" | "recommendation";

export default function App() {
  const [flowMode, setFlowMode] = useState<FlowMode>("intro");
  const [profile, setProfile] = useState<FitProfile>(INITIAL_FIT_PROFILE);

  const handleStartManual = () => {
    setProfile(INITIAL_FIT_PROFILE);
    setFlowMode("manual");
  };

  const handleStartVoice = () => {
    setProfile(INITIAL_FIT_PROFILE);
    setFlowMode("voice");
  };

  const handleProfileChange = (updatedProfile: FitProfile) => {
    setProfile(updatedProfile);
  };

  const handleComplete = () => {
    setFlowMode("recommendation");
  };

  const handleBackToHome = () => {
    setFlowMode("intro");
  };

  return (
    <div className="min-h-screen bg-raw-silk text-[#1b1b1b]">
      {flowMode === "intro" && (
        <IntroScreen
          onStartManual={handleStartManual}
          onStartVoice={handleStartVoice}
        />
      )}

      {flowMode === "manual" && (
        <QuizStep
          profile={profile}
          onChangeProfile={handleProfileChange}
          onComplete={handleComplete}
          onBackToHome={handleBackToHome}
        />
      )}

      {flowMode === "voice" && (
        <VoiceStylist
          profile={profile}
          onChangeProfile={handleProfileChange}
          onComplete={handleComplete}
          onBackToHome={handleBackToHome}
        />
      )}

      {flowMode === "recommendation" && (
        <FitRecommendation
          profile={profile}
          onReset={handleBackToHome}
        />
      )}
    </div>
  );
}
