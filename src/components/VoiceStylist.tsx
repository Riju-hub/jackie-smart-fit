import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, ArrowLeft, ArrowRight, CornerDownLeft, Keyboard, HelpCircle } from "lucide-react";
import { FitProfile, QUIZ_QUESTIONS } from "../types";

interface VoiceStylistProps {
  profile: FitProfile;
  onChangeProfile: (p: FitProfile) => void;
  onComplete: () => void;
  onBackToHome: () => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  isConfirmed?: boolean;
}

export default function VoiceStylist({ profile, onChangeProfile, onComplete, onBackToHome }: VoiceStylistProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcriptText, setTranscriptText] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  // Refs to avoid stale closures in event listeners
  const handleVoiceInputRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);
  const isProcessingRef = useRef(isProcessing);

  useEffect(() => {
    handleVoiceInputRef.current = handleVoiceInput;
  }); // Re-bind on every single render to be absolutely fresh

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Check for webkitSpeechRecognition or SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      rec.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          if (handleVoiceInputRef.current) {
            handleVoiceInputRef.current(text);
          }
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // Add first greeting message & speak it
    const firstMsg = "Hello! I am your personal Fit Stylist. I'm here to tailor the perfect pair of Jackie Jeans for you. To start, what is your height?";
    setMessages([
      {
        id: "intro",
        sender: "ai",
        text: firstMsg
      }
    ]);

    // Speak introductory greeting after a short delay
    const timer = setTimeout(() => {
      speakText(firstMsg);
    }, 800);

    return () => {
      clearTimeout(timer);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Speak a text using standard SpeechSynthesis
  const speakText = (text: string) => {
    // Stop listening before speaking to prevent feedback loops/self-hearing!
    stopListening();

    if (isMuted || !synthRef.current) {
      // If muted, start listening immediately
      startListening();
      return;
    }
    synthRef.current.cancel(); // Stop any currently speaking speech

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance; // Keep a reference to prevent garbage collection!

    // Prefer friendly natural voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    let fallbackTriggered = false;
    const triggerFallback = () => {
      if (!fallbackTriggered) {
        fallbackTriggered = true;
        activeUtteranceRef.current = null;
        startListening();
      }
    };

    // Safety timeout: Speech synthesis often fails silently or gets blocked by iframe/browser security policies
    const speechTimeout = setTimeout(() => {
      console.warn("SpeechSynthesis safety timeout triggered");
      triggerFallback();
    }, Math.max(5000, text.length * 80)); // 80ms per character, minimum 5 seconds

    utterance.onend = () => {
      clearTimeout(speechTimeout);
      triggerFallback();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      clearTimeout(speechTimeout);
      triggerFallback();
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current && !isProcessingRef.current) {
      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
        isListeningRef.current = false;
        setIsListening(false);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Process User Input (Spoken or Typed)
  const handleVoiceInput = async (spokenText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    // Add to chat feed
    const userMsgId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: spokenText
      }
    ]);

    setTranscriptText(spokenText);

    try {
      const response = await fetch("/api/gemini/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: spokenText,
          currentQuestionId: currentQuestion.id,
          options: currentQuestion.options || [],
          profile
        })
      });

      const data = await response.json();

      if (data && data.matchedValue) {
        // Map value to profile
        updateProfileWithParsedValue(currentQuestion.id, data.matchedValue);

        // Add Confirmation text from Stylist
        const confirmMsgId = "confirm-" + Date.now();
        setMessages(prev => [
          ...prev,
          {
            id: confirmMsgId,
            sender: "ai",
            text: data.confirmationSpeech,
            isConfirmed: true
          }
        ]);

        // Proceed to next question index or complete
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < QUIZ_QUESTIONS.length) {
          setCurrentQuestionIndex(nextIndex);
          // Wait a brief moment to speak the confirmation + next question
          setTimeout(() => {
            speakText(data.confirmationSpeech);
          }, 500);
        } else {
          // Speak completion and handoff
          const finishText = "Spectacular, I've gathered all your fit proportions. Let me calculate your tailored Jackie profile now!";
          speakText(finishText);
          setTimeout(() => {
            onComplete();
          }, 3000);
        }
      } else {
        console.warn("No matched value returned, using fallback mapping");
        handleFallbackMapping(spokenText);
      }
    } catch (e) {
      console.error("Failed to parse input:", e);
      // Fallback: manually map if offline/error
      handleFallbackMapping(spokenText);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      setTranscriptText("");
    }
  };

  const updateProfileWithParsedValue = (id: string, value: string) => {
    if (id === "brands") {
      // For brands, split or handle array
      const brandArray = [value];
      onChangeProfile({ ...profile, brands: brandArray });
    } else if (id === "brandSizes") {
      // Fit size to first selected brand as fallback
      const primaryBrand = profile.brands[0] || "Levi's";
      onChangeProfile({
        ...profile,
        brandSizes: { ...profile.brandSizes, [primaryBrand]: value }
      });
    } else {
      onChangeProfile({ ...profile, [id]: value });
    }
  };

  const handleFallbackMapping = (text: string) => {
    // Fallback logic for when server endpoints are not fully processed/mocked
    const value = currentQuestion.options ? currentQuestion.options[0] : text;
    updateProfileWithParsedValue(currentQuestion.id, value);

    const nextIndex = currentQuestionIndex + 1;
    let fallbackSpeech = "";

    if (nextIndex < QUIZ_QUESTIONS.length) {
      const nextQuestion = QUIZ_QUESTIONS[nextIndex];
      fallbackSpeech = `Got it, noted "${value}". Next: ${nextQuestion.label}`;
      setCurrentQuestionIndex(nextIndex);

      setMessages(prev => [
        ...prev,
        {
          id: "fallback-" + Date.now(),
          sender: "ai",
          text: fallbackSpeech,
          isConfirmed: true
        }
      ]);

      setTimeout(() => speakText(fallbackSpeech), 500);
    } else {
      fallbackSpeech = "Spectacular, I've gathered all your fit proportions. Let me calculate your tailored Jackie profile now!";
      setMessages(prev => [
        ...prev,
        {
          id: "fallback-" + Date.now(),
          sender: "ai",
          text: fallbackSpeech,
          isConfirmed: true
        }
      ]);
      speakText(fallbackSpeech);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const text = manualInput.trim();
    setManualInput("");
    handleVoiceInput(text);
  };

  // Scroll to bottom of chat feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <div className="min-h-screen flex flex-col relative bg-raw-silk overflow-hidden text-[#1b1b1b]">
      {/* Background soft blur effect */}
      <div className="absolute inset-0 z-0 h-full w-full opacity-10 pointer-events-none">
        <img
          className="w-full h-full object-cover object-center filter blur-3xl scale-110"
          alt="Backdrop blur"
          src="https://lh3.googleusercontent.com/aida/AP1WRLtsUywVP01uvk1GfVYvZjyqZkqdJPibLPBgz-8xPOrvxoFekB4kzqA-vY0xoSDVUPdOlISk6tFxpRlTpQUrKuBD8x4MIKKqXn_K08Yjub98y7VUpvfZFI4hSw_1DK30pjT3PCSZGeWpkB1gHUS_e9wdrMzikmxc2JDDiPsZPv34b53oC-uOX4ixl4UHj_sD52N9pad1S-DoFB_m5iBbqqpH7mGedNIGWijfWGTN2N4zo34V9b_-M_pOK38"
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-raw-silk/80 backdrop-blur-md z-50 flex justify-between items-center px-6 h-16 border-b border-tailor-gray/10">
        <button
          onClick={onBackToHome}
          className="text-primary hover:opacity-80 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="font-sans text-sm font-bold text-denim-ink tracking-tight uppercase">
            AI Stylist Active
          </h1>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-primary hover:opacity-80 active:scale-95 transition-all"
        >
          <Volume2 className={`h-5 w-5 ${isMuted ? "opacity-30" : ""}`} />
        </button>
      </header>

      {/* Main container split: Wave & Chat Feed */}
      <main className="relative z-10 flex-grow flex flex-col pt-16 pb-36 px-6 max-w-2xl mx-auto w-full">
        {/* Animated Waveform & Glowing Ripples */}
        <div className="py-10 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ripples based on listening state */}
            {isListening && (
              <>
                <div className="absolute w-44 h-44 rounded-full border border-primary/20 animate-ping"></div>
                <div className="absolute w-36 h-36 rounded-full border border-primary/10 animate-pulse"></div>
              </>
            )}

            {/* Core Speaking Visualisation Orb */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-denim-ink flex items-center justify-center shadow-xl">
              <div className="flex items-end justify-center gap-1 h-10">
                <span className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: "0.1s", height: "40%" }}></span>
                <span className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: "0.3s", height: "80%" }}></span>
                <span className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: "0.5s", height: "50%" }}></span>
                <span className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: "0.2s", height: "90%" }}></span>
                <span className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: "0.4s", height: "30%" }}></span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest font-semibold block">
              Question {currentQuestionIndex + 1} of 10
            </span>
            <p className="font-sans text-sm font-semibold text-primary mt-1">
              {currentQuestion.label}
            </p>
          </div>
        </div>

        {/* Dialogue Scroll View */}
        <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 max-h-[35vh]">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? "items-start" : "items-end"} fade-enter-active`}
              >
                <span className="font-mono text-[9px] text-tailor-gray mb-1 uppercase tracking-wider px-2">
                  {isAI ? "AI STYLIST" : "YOU"}
                </span>
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isAI
                      ? msg.isConfirmed
                        ? "bg-[#EFE6D4] text-denim-ink border border-primary/10"
                        : "bg-white text-on-surface border border-tailor-gray/10"
                      : "bg-primary text-white"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
          {isProcessing && (
            <div className="flex items-center gap-1 pl-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Voice controls floating bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 flex flex-col items-center pb-8 pt-4 bg-gradient-to-t from-raw-silk via-raw-silk to-transparent">
        <div className="flex flex-col items-center gap-3">
          {/* Main big Mic Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
              isListening
                ? "bg-rose-500 hover:bg-rose-600 animate-pulse text-white"
                : "bg-[#1b1b1b] hover:bg-[#2e2e2e] text-white"
            }`}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <span className="font-mono text-[10px] text-tailor-gray uppercase tracking-widest font-bold">
            {isListening ? "Listening... Speak now" : "Tap Mic to Talk"}
          </span>
        </div>

        {/* Manual Keyboard input fallback option */}
        <form onSubmit={handleManualSubmit} className="mt-4 flex items-center gap-2 max-w-sm w-full px-6">
          <input
            type="text"
            placeholder="Or type fit choice..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-grow bg-white border border-tailor-gray/20 rounded-xl px-4 py-2.5 text-xs focus:border-primary focus:ring-0 shadow-sm"
          />
          <button
            type="submit"
            className="bg-[#1b1b1b] hover:bg-primary text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
