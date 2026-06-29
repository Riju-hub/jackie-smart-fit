import React from "react";
import { Mic, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface IntroScreenProps {
  onStartManual: () => void;
  onStartVoice: () => void;
}

export default function IntroScreen({ onStartManual, onStartVoice }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative bg-raw-silk text-[#1b1b1b]">
      {/* Top Header */}
      <header className="fixed top-0 w-full bg-raw-silk/80 backdrop-blur-md z-50 flex justify-between items-center px-6 h-16 border-b border-tailor-gray/10">
        <div className="w-8">
          <button className="text-primary hover:scale-105 active:scale-95 transition-all">
            <span className="text-xl font-semibold">✕</span>
          </button>
        </div>
        <h1 className="font-sans text-xl font-extrabold tracking-tight text-denim-ink uppercase">
          Jackie Jeans
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-16 flex flex-col pb-24">
        {/* Hero Banner with Background Image */}
        <section className="relative h-[55vh] md:h-[60vh] w-full flex items-end">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              className="w-full h-full object-cover object-top filter brightness-105"
              alt="Jackie Jeans Fit"
              src="https://lh3.googleusercontent.com/aida/AP1WRLtsUywVP01uvk1GfVYvZjyqZkqdJPibLPBgz-8xPOrvxoFekB4kzqA-vY0xoSDVUPdOlISk6tFxpRlTpQUrKuBD8x4MIKKqXn_K08Yjub98y7VUpvfZFI4hSw_1DK30pjT3PCSZGeWpkB1gHUS_e9wdrMzikmxc2JDDiPsZPv34b53oC-uOX4ixl4UHj_sD52N9pad1S-DoFB_m5iBbqqpH7mGedNIGWijfWGTN2N4zo34V9b_-M_pOK38"
            />
            {/* Tonal Layering Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-raw-silk via-raw-silk/40 to-transparent"></div>
          </div>

          {/* Intro Content */}
          <div className="relative z-10 px-6 pb-6 w-full max-w-xl">
            <div className="inline-block bg-primary/10 backdrop-blur-sm border border-primary/20 px-3 py-1 rounded-full mb-4">
              <p className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
                Effortless Precision
              </p>
            </div>
            <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-denim-ink mb-3 leading-[1.1] tracking-tight">
              Find your <span className="text-primary italic font-serif font-normal">perfect</span> pair in seconds.
            </h2>
            <p className="font-sans text-sm md:text-base text-tailor-gray leading-relaxed max-w-md">
              Skip the guesswork. Our intelligent Fit Quiz learns your proportions to recommend the right denim with absolute confidence.
            </p>
          </div>
        </section>

        {/* Action Controls Section */}
        <section className="px-6 py-4 flex flex-col gap-4 max-w-xl mx-auto w-full">
          {/* AI Voice Stylist Option */}
          <button
            onClick={onStartVoice}
            className="group relative overflow-hidden bg-primary text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] flex items-center justify-between border border-primary-container text-left"
          >
            <div className="flex flex-col items-start z-10">
              <span className="font-mono text-[10px] text-primary-fixed-dim uppercase tracking-[0.2em] mb-2 font-bold">
                Premium Experience
              </span>
              <h3 className="font-sans text-xl font-bold mb-1 text-white">
                Try AI Voice Stylist
              </h3>
              <p className="text-white/70 text-xs max-w-[220px]">
                Talk through your fit preferences effortlessly in real-time.
              </p>
            </div>
            
            {/* Pulsing Mic Widget */}
            <div className="relative z-10 flex items-center justify-center h-14 w-14 bg-white/10 rounded-full border border-white/20">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-75"></div>
              <Mic className="h-6 w-6 text-white" />
            </div>

            {/* Subtle premium light animation */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-1000 group-hover:left-full"></div>
          </button>

          {/* Manual Quiz Option */}
          <button
            onClick={onStartManual}
            className="group w-full bg-denim-ink text-white font-sans font-bold text-base py-5 rounded-2xl transition-all duration-200 hover:bg-[#253957] active:scale-95 flex items-center justify-center gap-3 shadow-md"
          >
            <span>Start Fit Quiz</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Premium Calibration Badges */}
          <div className="mt-4 flex items-center justify-center gap-8 py-4 border-y border-tailor-gray/10">
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-wider">Inseam</span>
              <span className="font-mono text-[10px] text-primary font-bold mt-1">ACCURATE TO 0.5"</span>
            </div>
            <div className="w-[1px] h-8 bg-tailor-gray/20"></div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-wider">Stretch</span>
              <span className="font-mono text-[10px] text-primary font-bold mt-1">INTELLIGENT RATIO</span>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 pb-6 pt-3 bg-raw-silk/90 backdrop-blur-md border-t border-tailor-gray/10 shadow-lg">
        <button
          onClick={onStartVoice}
          className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-full px-6 py-2 transition-all duration-200 active:scale-95"
        >
          <Mic className="h-5 w-5 mb-1" />
          <span className="font-mono text-[11px] font-bold">Voice Guide</span>
        </button>

        <button
          onClick={onStartManual}
          className="flex flex-col items-center justify-center text-tailor-gray hover:text-primary transition-all duration-200 active:scale-95 px-6 py-2"
        >
          <ArrowRight className="h-5 w-5 mb-1" />
          <span className="font-mono text-[11px]">Manual Entry</span>
        </button>
      </nav>
    </div>
  );
}
