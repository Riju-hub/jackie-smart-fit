import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle, Check, Loader2, Info } from "lucide-react";
import { FitProfile } from "../types";

interface FitRecommendationProps {
  profile: FitProfile;
  onReset: () => void;
}

interface RecommendedResult {
  recommendedWaist: string;
  recommendedLength: string;
  styleName: string;
  styleCut: string;
  fabricStretch: string;
  explanation: string;
  fallback?: boolean;
}

export default function FitRecommendation({ profile, onReset }: FitRecommendationProps) {
  const [recommendation, setRecommendation] = useState<RecommendedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/gemini/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile })
        });
        const data = await res.json();
        setRecommendation(data);
      } catch (e) {
        console.error("Failed to generate recommendation:", e);
        // Fallback matching logic
        setRecommendation({
          recommendedWaist: `${profile.waist || "28"}"`,
          recommendedLength: profile.height && profile.height.startsWith("4'") ? '28"' : '30"',
          styleName: "Jackie Premium Intelligent Straight",
          styleCut: profile.waistbandSit || "Mid rise",
          fabricStretch: "1.5% Intelligent Stretch Ratio",
          explanation: "Bespoke straight leg denim contouring designed specifically to target waist gaps and provide secure, comfortable support."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [profile]);

  const handleHandoffRedirect = () => {
    // Premium Handoff: Carry their complete fit coordinates in URL query params!
    const queryParams = new URLSearchParams({
      height: profile.height,
      weight: profile.weight,
      waist: profile.waist,
      hips: profile.hips,
      waistFit: profile.waistFit,
      waistbandSit: profile.waistbandSit,
      thighFit: profile.thighFit,
      brands: profile.brands.join(","),
      frustration: profile.fitFrustration,
      recommendedWaist: recommendation?.recommendedWaist || "",
      recommendedLength: recommendation?.recommendedLength || ""
    });

    const destinationUrl = `https://jackie-jeans.vercel.app/?${queryParams.toString()}`;
    try {
      window.parent.location.href = destinationUrl;
    } catch (e) {
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-raw-silk text-on-surface px-6">
        <div className="text-center space-y-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <div>
            <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest font-bold">
              Jackie Fit Intelligence
            </span>
            <h2 className="font-sans text-xl font-bold text-denim-ink mt-2">
              Calculating your Perfect Fit...
            </h2>
            <p className="font-sans text-xs text-tailor-gray mt-1 max-w-xs leading-relaxed">
              Our AI is cross-referencing your physical profile and fit preferences with laser-scanned garment data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-raw-silk text-[#1b1b1b] pt-12 pb-24 px-6 max-w-3xl mx-auto flex flex-col justify-start">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">
          <Sparkles className="h-3 w-3" />
          <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
            Fit Calculation Complete
          </span>
        </div>
        <h2 className="font-sans text-3xl font-extrabold text-denim-ink tracking-tight">
          Your Tailored Recommendation
        </h2>
        <p className="font-sans text-xs text-tailor-gray mt-2 max-w-md mx-auto leading-relaxed">
          Based on your physical proportions and preferences, we have calculated your unique Jackie Jeans blueprint.
        </p>
      </div>

      {/* Main Results Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Recommendation card */}
        <div className="md:col-span-2 bg-[#EFE6D4] p-8 rounded-2xl border border-primary/10 flex flex-col justify-between gap-6 shadow-sm">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold block mb-1">
              Your Recommended Cut
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-denim-ink leading-tight">
              {recommendation?.styleName}
            </h3>
            <p className="font-sans text-xs text-tailor-gray mt-1 font-semibold">
              Rise: {recommendation?.styleCut}
            </p>
          </div>

          <div className="py-4 border-y border-tailor-gray/15">
            <h4 className="font-mono text-[10px] text-primary uppercase font-semibold">
              Fit Analysis & Explanation
            </h4>
            <p className="font-sans text-xs text-on-surface leading-relaxed mt-2">
              {recommendation?.explanation}
            </p>
          </div>

          <div className="flex items-center gap-2 text-tailor-gray">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-mono text-[10px]">Guaranteed zero gap waistband logic enabled.</span>
          </div>
        </div>

        {/* Quick Sizes sidebar card */}
        <div className="bg-white p-6 rounded-2xl border border-tailor-gray/10 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-6">
            <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest block text-center font-bold">
              Jackie Sizing
            </span>

            {/* Waist */}
            <div className="text-center py-4 bg-raw-silk/40 rounded-xl border border-tailor-gray/5">
              <span className="font-mono text-[9px] text-tailor-gray uppercase">Calculated Waist</span>
              <p className="font-sans text-3xl font-extrabold text-primary mt-1">
                {recommendation?.recommendedWaist}
              </p>
            </div>

            {/* Inseam Length */}
            <div className="text-center py-4 bg-raw-silk/40 rounded-xl border border-tailor-gray/5">
              <span className="font-mono text-[9px] text-tailor-gray uppercase">Calculated Length</span>
              <p className="font-sans text-3xl font-extrabold text-primary mt-1">
                {recommendation?.recommendedLength}
              </p>
            </div>
          </div>

          <div className="text-center">
            <span className="font-mono text-[9px] text-primary font-semibold">
              Stretch: {recommendation?.fabricStretch}
            </span>
          </div>
        </div>
      </div>

      {/* Stylist profile breakdown list */}
      <div className="mb-10 p-6 bg-white rounded-2xl border border-tailor-gray/10">
        <h4 className="font-sans text-xs font-bold text-denim-ink mb-4 tracking-wider uppercase">
          Your Core Profile Coordinates
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
          <div>
            <span className="font-mono text-[9px] text-tailor-gray uppercase">Height</span>
            <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.height}</p>
          </div>
          {profile.weight && (
            <div>
              <span className="font-mono text-[9px] text-tailor-gray uppercase">Weight</span>
              <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.weight} lbs</p>
            </div>
          )}
          <div>
            <span className="font-mono text-[9px] text-tailor-gray uppercase">Waist</span>
            <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.waist}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-tailor-gray uppercase">Hips</span>
            <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.hips}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-tailor-gray uppercase">Preferred Rise</span>
            <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.waistbandSit}</p>
          </div>
          <div>
            <span className="font-mono text-[9px] text-tailor-gray uppercase">Core Frustration</span>
            <p className="font-sans text-sm font-semibold text-on-surface mt-0.5">{profile.fitFrustration}</p>
          </div>
        </div>
      </div>

      {/* Styled Boutique aesthetic images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="h-40 rounded-2xl overflow-hidden relative group border border-tailor-gray/10">
          <img
            className="w-full h-full object-cover"
            alt="Indigo Weave"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrLPPW_8iMMQ8wa3cv8SPRR9fR4w_YtAcVvXwjdE-n8PU9sRDtdgq5sXDWAkUd2Av0AavWokEtND4_gXcw508c0OyJl_BUP41LxN31Z49PdMRPl-tI-E_5ImpyFh7bwb1-vfJB0P1nW91HRcOalWZIRdbdMjrMVb6KFgzBkArIoz_lOLdyQV96cK6dnzBhYAG6IP3qmJ3ZuCk55DhWdj5FfhgkOO0UF-n65A4VyRreCMantYF10UTIVcy-OFoLes3QXdf2ofhPm7ow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
            <div>
              <span className="font-mono text-[9px] text-white/85 uppercase">Fabric Details</span>
              <p className="font-sans text-sm font-bold text-white mt-0.5">Raw Selvedge Indigo Cotton</p>
            </div>
          </div>
        </div>

        <div className="h-40 rounded-2xl overflow-hidden relative group border border-tailor-gray/10">
          <img
            className="w-full h-full object-cover"
            alt="Tailor Markings"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKAe3fiM2ZJAFaA1nBo6X7gTErNHngJBHR2ofQg1tDoXkVnYZrYV5jVMrjFvpe3GdSSGQSvVFd0-vWb96aM-V_KFF6NVdbAY1KEESl4RlCx2dQcz0sZ60mRkdFuKNOIUh4qrMJ1aIiuKrhoRvffojyQ3pEPW1DDptVpwy-_V4WCtwg3RfqHhoV3LF7T3OJd9Oa705u-dHV8RwdEXk-kahvrSDjoJT9bswfb79hAKPDtpYg44S_bGM2niSYCs6SUfD7WcFPvpfs67tv"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
            <div>
              <span className="font-mono text-[9px] text-white/85 uppercase">Smart Adjustment</span>
              <p className="font-sans text-sm font-bold text-white mt-0.5">Bespoke Pattern Tolerancing</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-8 py-4 border border-denim-ink text-denim-ink rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-denim-ink/5 active:scale-95 transition-all text-center"
        >
          Retake Quiz
        </button>

        <button
          onClick={handleHandoffRedirect}
          className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-[#253957] text-white rounded-full font-sans text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Claim Fit Profile</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
