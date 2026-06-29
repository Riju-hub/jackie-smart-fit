import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using fallback logic.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getVoiceParseFallback(transcript: any, currentQuestionId: string, options: string[] | undefined, profile: any) {
  const lower = String(transcript || "").toLowerCase().trim();
  let matchedValue = "";
  let confirmationSpeech = "";

  if (currentQuestionId === "height") {
    const digits = lower.match(/(\d+)\s*[\s'ft\-]*\s*(\d+)?/);
    if (digits) {
      const f = digits[1];
      const i = digits[2] || "0";
      matchedValue = `${f}'${i}"`;
    } else {
      let ft = "5";
      if (lower.includes("four") || lower.includes("4")) ft = "4";
      if (lower.includes("six") || lower.includes("6")) ft = "6";
      
      let inch = "6";
      if (lower.includes("ten") || lower.includes("10")) inch = "10";
      else if (lower.includes("eleven") || lower.includes("11")) inch = "11";
      else if (lower.includes("zero") || lower.includes("0")) inch = "0";
      else if (lower.includes("one") || lower.includes("1")) inch = "1";
      else if (lower.includes("two") || lower.includes("2")) inch = "2";
      else if (lower.includes("three") || lower.includes("3")) inch = "3";
      else if (lower.includes("four") || lower.includes("4")) inch = "4";
      else if (lower.includes("five") || lower.includes("5")) inch = "5";
      else if (lower.includes("six") || lower.includes("6")) inch = "6";
      else if (lower.includes("seven") || lower.includes("7")) inch = "7";
      else if (lower.includes("eight") || lower.includes("8")) inch = "8";
      else if (lower.includes("nine") || lower.includes("9")) inch = "9";
      
      matchedValue = `${ft}'${inch}"`;
    }
    confirmationSpeech = `Perfect, ${matchedValue}. Next, what is your weight? Or you can say skip.`;
  } else if (currentQuestionId === "weight") {
    if (lower.includes("skip") || lower.includes("no") || lower.includes("don't") || lower.includes("not tell") || lower.includes("private")) {
      matchedValue = "skipped";
      confirmationSpeech = "Okay, skipping weight. What is your waist measurement in inches?";
    } else {
      const numMatch = lower.match(/\d+/);
      if (numMatch) {
        matchedValue = `${numMatch[0]} lbs`;
      } else {
        matchedValue = "140 lbs";
      }
      confirmationSpeech = `Got it, ${matchedValue}. What is your waist measurement in inches?`;
    }
  } else if (currentQuestionId === "waist" || currentQuestionId === "hips") {
    const numMatch = lower.match(/\d+/);
    let num = numMatch ? parseInt(numMatch[0]) : null;
    
    if (currentQuestionId === "waist") {
      if (!num || num < 24 || num > 52) num = 28;
      matchedValue = `${num}"`;
      confirmationSpeech = `Got it, waist size is ${matchedValue}. And how about your hip measurement in inches?`;
    } else {
      if (!num || num < 32 || num > 60) num = 36;
      matchedValue = `${num}"`;
      confirmationSpeech = `Noted, hip size is ${matchedValue}. Next, how do you like jeans to fit at the waist? Snug, slightly relaxed, or relaxed?`;
    }
  } else if (currentQuestionId === "waistFit") {
    if (lower.includes("slightly") || lower.includes("semi") || lower.includes("moderate")) {
      matchedValue = "Slightly relaxed";
    } else if (lower.includes("relaxed") || lower.includes("loose") || lower.includes("roomy")) {
      matchedValue = "Relaxed";
    } else {
      matchedValue = "Snug";
    }
    confirmationSpeech = `Fabulous, ${matchedValue} fit. Where should the waistband sit? High rise, mid rise, or low rise?`;
  } else if (currentQuestionId === "waistbandSit") {
    if (lower.includes("high") || lower.includes("above")) {
      matchedValue = "High rise";
    } else if (lower.includes("low") || lower.includes("below") || lower.includes("hip")) {
      matchedValue = "Low rise";
    } else {
      matchedValue = "Mid rise";
    }
    confirmationSpeech = `Perfect, a ${matchedValue}. How should jeans fit through the thighs? Fitted, relaxed, or loose?`;
  } else if (currentQuestionId === "thighFit") {
    if (lower.includes("fitted") || lower.includes("tight") || lower.includes("slim") || lower.includes("skinny")) {
      matchedValue = "Fitted";
    } else if (lower.includes("loose") || lower.includes("wide") || lower.includes("baggy")) {
      matchedValue = "Loose";
    } else {
      matchedValue = "Relaxed";
    }
    confirmationSpeech = `Wonderful, ${matchedValue} thighs. Which denim brands have you bought before? Levi's, Everlane, Madewell, Zara?`;
  } else if (currentQuestionId === "brands") {
    let found = "Levi's";
    const brandList = ["Levi's", "Everlane", "Madewell", "Zara", "Gap", "J.Crew", "AG", "Frame", "Citizens of Humanity", "Paige", "Mother", "Joe's"];
    for (const b of brandList) {
      if (lower.includes(b.toLowerCase())) {
        found = b;
        break;
      }
    }
    matchedValue = found;
    confirmationSpeech = `Got it, you wear ${matchedValue}. What size did you buy in those brands?`;
  } else if (currentQuestionId === "brandSizes") {
    const numMatch = lower.match(/\d+/);
    matchedValue = numMatch ? numMatch[0] : "28";
    confirmationSpeech = `Perfect, size ${matchedValue}. Lastly, what is your biggest fit frustration when buying jeans? Waist gap, hip tightness, wrong length, thigh fit, or rise?`;
  } else if (currentQuestionId === "fitFrustration") {
    if (lower.includes("gap") || lower.includes("waist")) {
      matchedValue = "Waist gap";
    } else if (lower.includes("hip") || lower.includes("tight")) {
      matchedValue = "Hip tightness";
    } else if (lower.includes("length") || lower.includes("short") || lower.includes("long")) {
      matchedValue = "Wrong length";
    } else if (lower.includes("thigh")) {
      matchedValue = "Thigh fit";
    } else if (lower.includes("rise")) {
      matchedValue = "Rise";
    } else {
      matchedValue = "Other";
    }
    confirmationSpeech = `Got it, ${matchedValue} is the worst. Calculating your premium fit profile now!`;
  } else {
    matchedValue = options && options.length > 0 ? options[0] : String(transcript || "");
    confirmationSpeech = `Perfectly received. Moving to the next step.`;
  }

  return { matchedValue, confirmationSpeech, fallback: true };
}

function getRecommendationFallback(profile: any) {
  const waistVal = profile && profile.waist ? String(profile.waist).replace('"', '') : "28";
  const heightStr = profile && profile.height ? String(profile.height) : "5'6\"";
  
  let recommendedLength = '30"';
  if (heightStr.startsWith("4'") || heightStr === "5'0\"" || heightStr === "5'1\"" || heightStr === "5'2\"") {
    recommendedLength = '28"';
  } else if (heightStr.startsWith("6'") || heightStr === "5'10\"" || heightStr === "5'11\"") {
    recommendedLength = '32"';
  }

  let styleName = "Jackie Premium Smart Straight";
  const thighFit = profile && profile.thighFit ? String(profile.thighFit) : "Relaxed";
  const waistbandSit = profile && profile.waistbandSit ? String(profile.waistbandSit) : "Mid rise";
  const waistFit = profile && profile.waistFit ? String(profile.waistFit) : "Slightly relaxed";
  const fitFrustration = profile && profile.fitFrustration ? String(profile.fitFrustration) : "Waist gap";

  if (thighFit === "Fitted") {
    styleName = "Jackie Custom Tailored Slim";
  } else if (thighFit === "Loose") {
    styleName = "Jackie Bespoke Slouchy Wide";
  } else if (waistbandSit === "High rise") {
    styleName = "Jackie High-Rise Contour Straight";
  }

  const fabricStretch = waistFit === "Snug" 
    ? "Bespoke Comfort-Hold (1% Stretch, 99% organic raw cotton)"
    : "Intelligent Stretch Matrix (2% elastane, 98% premium long-staple cotton)";

  const explanation = `Based on your height of ${heightStr} and waist of ${waistVal}", our smart fit intelligence recommends the ${waistbandSit} Straight fit. It handles your biggest frustration—${fitFrustration}—by using a contoured waistband with custom-engineered pattern tolerances adjusted specifically for you.`;

  return {
    recommendedWaist: `${waistVal}"`,
    recommendedLength,
    styleName,
    styleCut: waistbandSit,
    fabricStretch,
    explanation,
    fallback: true
  };
}

app.use(express.json());

// API health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// AI Voice Onboarding Parser
// This endpoint takes a voice transcription, maps it to a valid option of the quiz,
// and gives the browser a customized confirmation text + instruction for the next question.
app.post("/api/gemini/parse-voice", async (req, res) => {
  const { transcript, currentQuestionId, options, profile } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  try {
    const ai = getGemini();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured yet
    if (!apiKey) {
      // Mock parsing for preview purposes
      let matchedValue = "";
      let confirmationSpeech = "";
      
      const lower = transcript.toLowerCase();
      if (currentQuestionId === "height") {
        matchedValue = "5'6\"";
        confirmationSpeech = "Perfect, five foot six. Next, what is your weight? Or say skip.";
      } else if (currentQuestionId === "weight") {
        if (lower.includes("skip") || lower.includes("no") || lower.includes("don't")) {
          matchedValue = "skipped";
          confirmationSpeech = "Okay, skipping weight. What is your waist measurement in inches?";
        } else {
          matchedValue = "140 lbs";
          confirmationSpeech = "Got it, one hundred and forty. What is your waist measurement in inches?";
        }
      } else {
        matchedValue = options && options.length > 0 ? options[0] : transcript;
        confirmationSpeech = `Got it. Let's move on to the next step.`;
      }

      return res.json({
        matchedValue,
        confirmationSpeech,
        fallback: true
      });
    }

    const prompt = `
      You are the backend fit intelligence analyst for Jackie Jeans.
      Your task is to parse a spoken voice transcript for a specific quiz question and map it to a structured fit choice.

      Current Question ID: "${currentQuestionId}"
      Allowed/Expected Options: ${options ? JSON.stringify(options) : "Free entry or skip (e.g. for weight or brand size)"}
      User's Spoken Transcript: "${transcript}"
      Current Profile State: ${JSON.stringify(profile)}

      Instructions:
      1. Map the User's Spoken Transcript to one of the Allowed/Expected Options. Be intelligent:
         - "five foot six" or "five six" -> "5'6\""
         - "about thirty" or "thirty two" -> "30\"" or "32\""
         - "waist gap" or "gap in back" -> "Waist gap"
         - "high" or "really high" -> "High rise"
         - "mid" or "normal" -> "Mid rise"
         - "snug" or "tight" or "secure" -> "Snug"
         - "relaxed" -> "Relaxed"
         - "slightly relaxed" -> "Slightly relaxed"
         - "fitted" or "sharp" -> "Fitted"
         - "levis" or "levi" -> "Levi's"
         - "madewell" -> "Madewell"
         - "zara" -> "Zara"
         - "none" or "no brands" or "skip" -> skip or select none.
      2. If the current question is weight (which is optional):
         - If the user wants to skip, or says "no weight" or "don't want to say" or "skip", return "skipped".
         - Otherwise, extract the weight (e.g. "one hundred and fifty" -> "150 lbs").
      3. Create a friendly, natural voice confirmation speech (confirmationSpeech) as a premium personal stylist. Keep it short, stylish, and direct, confirming what you heard and asking the next logical question naturally.
         - Example: "Got it, five foot six. And what is your weight? You can skip this if you'd like."

      Return a JSON object matching this schema:
      {
        "matchedValue": "the exact mapped option, or brand names, or 'skipped', or parsed number string",
        "confirmationSpeech": "a natural, friendly spoken response for the user to hear next"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedValue: { type: Type.STRING },
            confirmationSpeech: { type: Type.STRING },
          },
          required: ["matchedValue", "confirmationSpeech"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.log("Gemini voice parse API offline/busy; using local voice parse fallback");
    const result = getVoiceParseFallback(transcript, currentQuestionId, options, profile);
    res.json(result);
  }
});

// Fit Recommendation Engine
app.post("/api/gemini/recommend", async (req, res) => {
  const { profile } = req.body;

  if (!profile) {
    return res.status(400).json({ error: "Fit profile is required" });
  }

  try {
    const ai = getGemini();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured yet
    if (!apiKey) {
      // Mock recommendation for preview purposes
      return res.json({
        recommendedWaist: `${profile.waist || "28"}"`,
        recommendedLength: profile.height && parseInt(profile.height) < 5 ? '28"' : '30"',
        styleName: "Jackie Premium Smart Straight",
        styleCut: profile.waistbandSit || "Mid rise",
        fabricStretch: "Intelligent stretch (2% elastane, 98% premium raw cotton)",
        explanation: `Based on your height of ${profile.height || "5'6\""} and waist of ${profile.waist || "28\""}, our smart fit intelligence recommends the ${profile.waistbandSit || "Mid rise"} Straight fit. It handles your biggest frustration—${profile.fitFrustration || "waist gap"}—by using a contoured waistband with custom-engineered pattern tolerances adjusted specifically for you.`,
        fallback: true
      });
    }

    const prompt = `
      You are the Lead Fit Intelligence Stylist for Jackie Jeans.
      Your task is to calculate and return a high-end, premium denim size and fit recommendation based on the user's completed fit profile.

      Completed Fit Profile:
      ${JSON.stringify(profile, null, 2)}

      Analyze their measurements, brand calibrations, fit preferences, and key frustration:
      - Recommended Waist: Suggest the absolute best waist size in inches (e.g. "28\""). Remember they prefer a "${profile.waistFit}" fit. Use their brand mapping as ground truth size.
      - Recommended Length/Inseam: Suggest a perfect inseam length (e.g. "30\"" or "32\"" or "28\"") based on their height.
      - Style Name: Invent an elegant, high-end, literal style name suited for their rise and thigh fit preference (e.g. "Classic High-Rise Straight", "Relaxed Mid-Rise Boyfriend", "Tailored Low-Rise Slim").
      - Explanation: Write a highly custom, stylish, data-driven and warm explanation explaining WHY this is their perfect fit, addressing their biggest frustration ("${profile.fitFrustration}") directly, and detailing how our intelligent pattern adjustment (+1.5cm thigh tolerance or contoured waistband) solves it elegantly.

      Return a JSON object matching this schema:
      {
        "recommendedWaist": "e.g. '28\"'",
        "recommendedLength": "e.g. '30\"'",
        "styleName": "e.g. 'Classic High-Rise Straight'",
        "styleCut": "e.g. 'High rise with relaxed thighs'",
        "fabricStretch": "e.g. 'Premium Rigid Selvedge' or '1.5% Intelligent Stretch Ratio'",
        "explanation": "Contour-designed narrative explaining the perfect fit choice in a high-end, friendly, stylish voice."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedWaist: { type: Type.STRING },
            recommendedLength: { type: Type.STRING },
            styleName: { type: Type.STRING },
            styleCut: { type: Type.STRING },
            fabricStretch: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["recommendedWaist", "recommendedLength", "styleName", "styleCut", "fabricStretch", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.log("Gemini recommendation API offline/busy; using local recommendation fallback");
    const result = getRecommendationFallback(profile);
    res.json(result);
  }
});

// Configure Vite or production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Jackie Jeans Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
