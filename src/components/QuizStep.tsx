import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Info, Check, CheckCircle } from "lucide-react";
import { FitProfile, QUIZ_QUESTIONS } from "../types";

interface QuizStepProps {
  profile: FitProfile;
  onChangeProfile: (p: FitProfile) => void;
  onComplete: () => void;
  onBackToHome: () => void;
}

export default function QuizStep({ profile, onChangeProfile, onComplete, onBackToHome }: QuizStepProps) {
  // We have 5 logical Steps in our Manual Flow, matching the gorgeous screenshots:
  // Step 1: Height & Weight (Physical Profile)
  // Step 2: Waist & Hip Measurements (Measurement Precision)
  // Step 3: Waist Fit, Waistband Sitting height, and Thigh Fit (Fit Preferences)
  // Step 4: Brand Calibration & Sizes
  // Step 5: Fit Frustration & Aesthetic Bento (Final Touches)
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!profile.height) {
        alert("Please select your height to continue.");
        return;
      }
    } else if (currentStep === 2) {
      if (!profile.waist || !profile.hips) {
        alert("Please select both waist and hip measurements.");
        return;
      }
    } else if (currentStep === 3) {
      if (!profile.waistFit || !profile.waistbandSit || !profile.thighFit) {
        alert("Please answer all fit preferences before proceeding.");
        return;
      }
    } else if (currentStep === 4) {
      if (profile.brands.length === 0) {
        alert("Please select at least one denim brand you have bought before.");
        return;
      }
      // Check that they picked a size for each selected brand
      const missingSizes = profile.brands.filter(b => !profile.brandSizes[b]);
      if (missingSizes.length > 0) {
        alert(`Please select your size for ${missingSizes[0]}.`);
        return;
      }
    } else if (currentStep === 5) {
      if (!profile.fitFrustration) {
        alert("Please select your biggest fit frustration.");
        return;
      }
      onComplete();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBackToHome();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectHeight = (val: string) => {
    onChangeProfile({ ...profile, height: val });
  };

  const handleInputWeight = (val: string) => {
    onChangeProfile({ ...profile, weight: val });
  };

  const handleSelectWaist = (val: string) => {
    onChangeProfile({ ...profile, waist: val });
  };

  const handleSelectHips = (val: string) => {
    onChangeProfile({ ...profile, hips: val });
  };

  const handleSelectWaistFit = (val: string) => {
    onChangeProfile({ ...profile, waistFit: val });
  };

  const handleSelectWaistbandSit = (val: string) => {
    onChangeProfile({ ...profile, waistbandSit: val });
  };

  const handleSelectThighFit = (val: string) => {
    onChangeProfile({ ...profile, thighFit: val });
  };

  const handleToggleBrand = (brandName: string) => {
    const existing = profile.brands.includes(brandName);
    let newBrands = [];
    let newSizes = { ...profile.brandSizes };
    if (existing) {
      newBrands = profile.brands.filter(b => b !== brandName);
      delete newSizes[brandName];
    } else {
      newBrands = [...profile.brands, brandName];
    }
    onChangeProfile({ ...profile, brands: newBrands, brandSizes: newSizes });
  };

  const handleSelectBrandSize = (brandName: string, size: string) => {
    onChangeProfile({
      ...profile,
      brandSizes: { ...profile.brandSizes, [brandName]: size }
    });
  };

  const handleSelectFrustration = (val: string) => {
    onChangeProfile({ ...profile, fitFrustration: val });
  };

  // Setup options matching types
  const heightOptions = QUIZ_QUESTIONS[0].options || [];
  const waistOptions = QUIZ_QUESTIONS[2].options || [];
  const hipOptions = QUIZ_QUESTIONS[3].options || [];
  const waistFitOptions = QUIZ_QUESTIONS[4].options || [];
  const waistbandSitOptions = QUIZ_QUESTIONS[5].options || [];
  const waistbandSitImages = QUIZ_QUESTIONS[5].images || {};
  const thighFitOptions = QUIZ_QUESTIONS[6].options || [];
  const brandsOptions = QUIZ_QUESTIONS[7].options || [];
  const frustrationsOptions = QUIZ_QUESTIONS[9].options || [];

  const progressPct = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-raw-silk text-[#1b1b1b] pb-24">
      {/* Header */}
      <header className="fixed top-0 w-full bg-raw-silk/80 backdrop-blur-md z-50 flex justify-between items-center px-6 h-16 border-b border-tailor-gray/10">
        <button
          onClick={handleBack}
          className="text-primary hover:opacity-80 active:scale-95 transition-transform duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-sans text-lg font-bold text-denim-ink tracking-tight uppercase">
          Perfect Fit AI
        </h1>
        <div className="w-5"></div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow pt-24 max-w-2xl mx-auto w-full px-6 flex flex-col justify-start">
        {/* Progress Tracker Bar */}
        <div className="mb-8 w-full">
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest font-semibold">
              Step 0{currentStep} / 05
            </span>
            <span className="font-mono text-[10px] text-primary font-bold">
              {progressPct}% Complete
            </span>
          </div>
          <div className="h-[2px] w-full bg-tertiary-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* Step Views */}
        {currentStep === 1 && (
          <div className="space-y-12 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-[0.2em] block mb-2">
                Physical Profile
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-denim-ink">
                Measurement Details
              </h2>
              <p className="font-sans text-xs text-tailor-gray mt-2">
                Let's calibrate your baseline dimensions to estimate your perfect fit.
              </p>
            </div>

            {/* Height Selector */}
            <div className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block text-center">
                Measurement A: Height
              </label>
              <div className="relative group max-w-xs mx-auto">
                <select
                  value={profile.height}
                  onChange={(e) => handleSelectHeight(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-tailor-gray/30 focus:border-primary focus:ring-0 font-sans text-lg text-center py-4 cursor-pointer hover:border-primary transition-colors appearance-none"
                >
                  <option value="" disabled>Select Height</option>
                  {heightOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <div className="absolute right-2 bottom-4 pointer-events-none text-tailor-gray group-hover:text-primary transition-colors">
                  <span className="text-xs">▼</span>
                </div>
              </div>
              <p className="text-center text-[11px] text-tailor-gray italic opacity-85">
                Drives inseam / length recommendation.
              </p>
            </div>

            {/* Weight Input */}
            <div className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block text-center">
                Measurement B (Optional): Weight
              </label>
              <div className="max-w-xs mx-auto relative group">
                <input
                  type="number"
                  placeholder="---"
                  value={profile.weight}
                  onChange={(e) => handleInputWeight(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-tailor-gray/30 focus:border-primary focus:ring-0 font-sans text-lg text-center py-4 placeholder:text-tailor-gray/30"
                />
                <span className="absolute right-2 bottom-4 font-mono text-[10px] text-tailor-gray">
                  LBS
                </span>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onChangeProfile({ ...profile, weight: "" })}
                  className="font-mono text-[11px] text-tailor-gray hover:text-primary underline underline-offset-4 decoration-tailor-gray/25"
                >
                  Skip weight entry
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-10 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-[0.2em] block mb-2">
                Measurement Precision
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-denim-ink">
                Body Dimension Details
              </h2>
              <p className="font-sans text-xs text-tailor-gray mt-2">
                Accurate numbers ensure a bespoke denim experience. Please select your measurements.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
              {/* Waist dropdown card */}
              <div className="bg-tertiary-cream/20 p-6 rounded-2xl border border-tailor-gray/10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-tailor-gray/5">
                    <span className="text-lg font-bold">W</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-tailor-gray uppercase">Question 03</span>
                    <h3 className="font-sans text-sm font-bold text-denim-ink">Waist Size</h3>
                  </div>
                </div>

                <div className="relative group">
                  <select
                    value={profile.waist}
                    onChange={(e) => handleSelectWaist(e.target.value)}
                    className="w-full bg-white border border-tailor-gray/20 focus:border-primary focus:ring-0 rounded-xl py-3 px-3 text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select waist (inches)</option>
                    {waistOptions.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tailor-gray text-xs">▼</span>
                </div>
                <p className="font-sans text-[10px] text-tailor-gray italic leading-relaxed">
                  * Measure around the narrowest part of your waistline.
                </p>
              </div>

              {/* Hip dropdown card */}
              <div className="bg-tertiary-cream/20 p-6 rounded-2xl border border-tailor-gray/10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-tailor-gray/5">
                    <span className="text-lg font-bold">H</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-tailor-gray uppercase">Question 04</span>
                    <h3 className="font-sans text-sm font-bold text-denim-ink">Hip Size</h3>
                  </div>
                </div>

                <div className="relative group">
                  <select
                    value={profile.hips}
                    onChange={(e) => handleSelectHips(e.target.value)}
                    className="w-full bg-white border border-tailor-gray/20 focus:border-primary focus:ring-0 rounded-xl py-3 px-3 text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select hips (inches)</option>
                    {hipOptions.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tailor-gray text-xs">▼</span>
                </div>
                <p className="font-sans text-[10px] text-tailor-gray italic leading-relaxed">
                  * Measure around the fullest part of your hips.
                </p>
              </div>
            </div>

            {/* Stylist illustration bento */}
            <div className="mt-6 bg-white rounded-2xl overflow-hidden border border-tailor-gray/10 shadow-sm flex flex-col md:flex-row">
              <div className="md:w-1/2 h-44 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 z-10"></div>
                <img
                  className="w-full h-full object-cover"
                  alt="Stylist Measurement Guidance"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6Lm7a3P2-FS9xYghzmuoyrVZroFA_dAayqePlxDzwUAWPTCto0oQ4zPxbDQgjujQY_nDxCs2TE4BzPIeoqVeabeWV2UxUZeBtcnRUf90KtQYc1wY8e_P7Z8NXmHOGMlXKOwU-B36wdL-dPIM_EdEaO4TGVBVrAaUvrtzTDQK9UMocjA7PDkReiPmqNkECrj51pHKusR9y9aL9OGwFiSpjCI9F1vEW2aV4PxISs6XOVPvEg2TIb04ekBctIzJWFDxXa46qyloILTHn"
                />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-center">
                <h4 className="font-mono text-[10px] text-primary mb-1 font-bold tracking-wider">
                  STYLIST TIP
                </h4>
                <p className="font-sans text-xs text-on-surface leading-relaxed mb-2">
                  For the most accurate "Perfect Fit" profile, keep the measuring tape level and snug, but not tight. Wear light clothing for best results.
                </p>
                <div className="flex items-center gap-1.5 text-tailor-gray">
                  <Info className="h-3 w-3" />
                  <span className="font-mono text-[9px]">Your data is encrypted & private.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-10 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-[0.2em] block mb-2">
                Step 03 / 05
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-denim-ink">
                Fit Preferences
              </h2>
            </div>

            {/* Q5 Waist fit option */}
            <section className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block">
                Question 5: How do you like jeans to fit at the waist?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {waistFitOptions.map((option) => {
                  const desc = (QUIZ_QUESTIONS[4].descriptions as Record<string, string>)[option];
                  const selected = profile.waistFit === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectWaistFit(option)}
                      className={`group flex items-center justify-between p-5 border rounded-2xl text-left transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-tailor-gray/20 bg-white hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <p className={`font-sans text-sm font-bold ${selected ? "text-primary" : "text-on-surface"}`}>
                          {option}
                        </p>
                        <p className="font-mono text-[10px] text-tailor-gray mt-1">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selected ? "border-primary bg-primary text-white" : "border-tailor-gray/30"
                      }`}>
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Q6 Rise option */}
            <section className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block">
                Question 6: Where should the waistband sit?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {waistbandSitOptions.map((option) => {
                  const selected = profile.waistbandSit === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectWaistbandSit(option)}
                      className={`flex flex-col items-center gap-3 p-3 border rounded-2xl transition-all ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-tailor-gray/20 bg-white hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="w-full h-24 bg-cover bg-center rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                        style={{ backgroundImage: `url('${(waistbandSitImages as Record<string, string>)[option]}')` }}
                      ></div>
                      <span className={`font-sans text-xs font-bold ${selected ? "text-primary" : "text-tailor-gray"}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Q7 Thigh preference fit */}
            <section className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block">
                Question 7: How should jeans fit through the thighs?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {thighFitOptions.map((option) => {
                  const desc = (QUIZ_QUESTIONS[6].descriptions as Record<string, string>)[option];
                  const selected = profile.thighFit === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectThighFit(option)}
                      className={`p-5 border rounded-2xl text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-tailor-gray/20 bg-white hover:border-primary/50"
                      }`}
                    >
                      <p className={`font-sans text-sm font-bold ${selected ? "text-primary" : "text-on-surface"}`}>
                        {option}
                      </p>
                      <p className="font-sans text-[10px] text-tailor-gray mt-1 leading-relaxed">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-10 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-[0.2em] block mb-2">
                Calibration Phase
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-denim-ink">
                Denim Brand Standards
              </h2>
            </div>

            {/* Brand multiselect */}
            <section className="space-y-4">
              <div className="mb-4">
                <h3 className="font-sans text-sm font-bold text-on-surface">
                  Which denim brands have you bought before?
                </h3>
                <p className="text-xs text-tailor-gray mt-1 leading-relaxed">
                  Select all that apply. This helps our AI calibrate your "Jackie Size" based on existing industry standards.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {brandsOptions.map((brand) => {
                  const selected = profile.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => handleToggleBrand(brand)}
                      className={`p-4 border rounded-2xl font-sans text-xs font-bold text-center transition-all ${
                        selected
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-tailor-gray/20 text-on-surface hover:border-primary/50"
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Size Mapping dependent section */}
            <section className={`transition-all duration-500 ${profile.brands.length === 0 ? "opacity-30 pointer-events-none" : ""}`}>
              <div className="mb-4">
                <h3 className="font-sans text-sm font-bold text-on-surface">
                  What size did you buy in those brands?
                </h3>
                <p className="text-xs text-tailor-gray mt-1 leading-relaxed">
                  Specify your most comfortable size for each selected brand to align our metrics.
                </p>
              </div>

              <div className="space-y-3">
                {profile.brands.length === 0 ? (
                  <div className="p-5 bg-tertiary-cream/20 border border-dashed border-tailor-gray/30 rounded-2xl text-center">
                    <p className="font-mono text-[10px] text-tailor-gray italic">
                      Select brands above to calibrate sizes
                    </p>
                  </div>
                ) : (
                  profile.brands.map((brand) => (
                    <div
                      key={brand}
                      className="p-5 bg-white border border-tailor-gray/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <span className="font-sans text-sm font-bold text-denim-ink">{brand}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "36"].map((sz) => {
                          const selected = profile.brandSizes[brand] === sz;
                          return (
                            <button
                              key={sz}
                              onClick={() => handleSelectBrandSize(brand, sz)}
                              className={`min-w-[36px] h-[36px] flex items-center justify-center border rounded-xl font-mono text-[10px] transition-all ${
                                selected
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white border-tailor-gray/20 text-on-surface hover:border-primary/50"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-10 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-[0.2em] block mb-2">
                Final Touches
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-denim-ink">
                Eliminate the Friction
              </h2>
              <p className="font-sans text-xs text-tailor-gray mt-1 italic">
                "Precision is in the details. Tell us your biggest struggle so we can eliminate it."
              </p>
            </div>

            {/* Q10 frustration option */}
            <section className="space-y-4">
              <label className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block">
                Question 10: Biggest fit frustration when buying jeans?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {frustrationsOptions.map((option) => {
                  const selected = profile.fitFrustration === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectFrustration(option)}
                      className={`flex items-center justify-between p-5 border rounded-2xl text-left transition-all hover:bg-primary/5 ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-tailor-gray/20 bg-white"
                      }`}
                    >
                      <span className="font-sans text-sm font-semibold">{option}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selected ? "bg-primary border-primary" : "border-tailor-gray/40"
                      }`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Aesthetic imagery grid */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="h-44 bg-tertiary-cream rounded-2xl overflow-hidden relative group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Selvedge Denim"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBanWy3USfO7HoEhuo38vg3GTUIo64a1NmXSvK6DfsX_lxeQpLmE9WRkroBPO5LBW7575LHN4OeFYBnLqftw0Hlq5WnlGZORYV3YBKVJ5D1c4fZel79Y6Op69uPGxs0_cz4NaSBRLPt1wI1S1Ax0F_KEyYIsVGw5hVLcP293BZEpjs2KD_rHV-w_1jducPQA53rqdh-lYPAgH-DGQ-8e3Ux3SIdkSFFLagpoJutXH_e28_nuHsFvvy-oiEIrzAZREHi5tHk2HSlIlHu"
                />
              </div>
              <div className="h-44 bg-secondary rounded-2xl overflow-hidden relative group md:translate-y-4 transition-transform">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Jackie Jeans Boutique"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhvSxabfdVGBxXwKuJfr8htHbOCBk5N7KQv0ggSffrEOHOijCAudSqhiXHMLvAd3K1wJLw_wSOp6RsmMOkVGpscZstwtg_tszHzuzioooCHQwAa4PBbEmD2hzdzcyrXtFAhK15MnppCpZVCC3pYO9Vja6nECqvtSCliapjBS5oOmGGwWWd-6pZcJNu3EEMObngUXScZklFgQqTdI3keZU4chtxm2dB4ONGjNzUucF-CmRJCf28592gzE_RtiUGBHGOivVSZPZoOusE"
                />
              </div>
              <div className="h-44 bg-primary rounded-2xl overflow-hidden relative group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Tailored Chalk Markings"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKAe3fiM2ZJAFaA1nBo6X7gTErNHngJBHR2ofQg1tDoXkVnYZrYV5jVMrjFvpe3GdSSGQSvVFd0-vWb96aM-V_KFF6NVdbAY1KEESl4RlCx2dQcz0sZ60mRkdFuKNOIUh4qrMJ1aIiuKrhoRvffojyQ3pEPW1DDptVpwy-_V4WCtwg3RfqHhoV3LF7T3OJd9Oa705u-dHV8RwdEXk-kahvrSDjoJT9bswfb79hAKPDtpYg44S_bGM2niSYCs6SUfD7WcFPvpfs67tv"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action footer */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-raw-silk/95 backdrop-blur-md border-t border-tailor-gray/10 py-5 px-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center text-tailor-gray hover:text-primary transition-colors font-mono text-[10px] tracking-widest uppercase font-semibold"
        >
          <span>← Back</span>
        </button>

        <button
          onClick={handleNext}
          className="bg-denim-ink text-white rounded-full py-4 px-10 font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#253957] active:scale-95 transition-all shadow-sm flex items-center gap-2"
        >
          <span>{currentStep === 5 ? "Calculate Fit" : "Continue"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
