export interface FitProfile {
  height: string; // "4'10" - 6'2"
  weight: string; // optional, string format "150 lbs" or empty
  waist: string; // "24" - "52"
  hips: string; // "32" - "60"
  waistFit: string; // "Snug" | "Slightly relaxed" | "Relaxed"
  waistbandSit: string; // "High rise" | "Mid rise" | "Low rise"
  thighFit: string; // "Fitted" | "Relaxed" | "Loose"
  brands: string[]; // multi-select of brand names
  brandSizes: Record<string, string>; // size per brand, e.g., { "Madewell": "27" }
  fitFrustration: string; // "Waist gap" | "Hip tightness" | "Wrong length" | "Thigh fit" | "Rise" | "Other"
}

export const INITIAL_FIT_PROFILE: FitProfile = {
  height: "",
  weight: "",
  waist: "",
  hips: "",
  waistFit: "",
  waistbandSit: "",
  thighFit: "",
  brands: [],
  brandSizes: {},
  fitFrustration: "",
};

export const QUIZ_QUESTIONS = [
  {
    id: "height",
    label: "What is your height?",
    type: "select",
    options: ["4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""],
    optional: false,
    tip: "Drives inseam / length recommendation."
  },
  {
    id: "weight",
    label: "What is your weight? (Optional)",
    type: "number",
    optional: true,
    tip: "Calibrates proportional fit; optional to reduce drop-off."
  },
  {
    id: "waist",
    label: "Waist measurement in inches (narrowest point)",
    type: "select",
    options: Array.from({ length: 29 }, (_, i) => `${i + 24}"`),
    optional: false,
    tip: "Most direct sizing input."
  },
  {
    id: "hips",
    label: "Hip measurement in inches (fullest point)",
    type: "select",
    options: Array.from({ length: 29 }, (_, i) => `${i + 32}"`),
    optional: false,
    tip: "Critical for denim — most fit problems are hip-related."
  },
  {
    id: "waistFit",
    label: "How do you like jeans to fit at the waist?",
    type: "radio",
    options: ["Snug", "Slightly relaxed", "Relaxed"],
    optional: false,
    descriptions: {
      "Snug": "Secure and stays in place without a belt.",
      "Slightly relaxed": "A bit of room for comfort during movement.",
      "Relaxed": "Loose fit, prioritizes all-day ease."
    }
  },
  {
    id: "waistbandSit",
    label: "Where should the waistband sit?",
    type: "radio_image",
    options: ["High rise", "Mid rise", "Low rise"],
    optional: false,
    images: {
      "High rise": "https://lh3.googleusercontent.com/aida-public/AB6AXuAthUYIgwOAcLBuJthxqs_OAfR7D3wGj3hhqcJDPx5DR_MYX4bBpcS9SlaZ1z-KJZHzKtzG1g41eCLCGlaZ5bPT6KAgzdyn2EE2ZVhXE5jeTheLauZ7eerRqSf7xkhxqQXFt0xIkehz1UIWuTHouFh8Xm56-5yiU15Cwqsug5y05Atp1HGAxujMO_akxg2_nMGKmHb5XdHlkq9N8Q7ql2bI5-1neaof23QrJg0t-udqYpJNuqwQAmXfHlKzDe6cfWFFfl_jIsKbMXxs",
      "Mid rise": "https://lh3.googleusercontent.com/aida-public/AB6AXuCRUHwwccDlUgKZ3BBTufVEOg3kPueHONrM4lU3eIAcot5fxWqDjacezQHDtoE8YSbJ4EwmtegnAdvrEh3Hmt0ulERSPFZE_GXZx02YZiu9IE4aHbpi9aG88Aulvx_rn1OdhHvbtKLa1l1pCQN6Jnj6CH2ycDeSEkUgQyU_HOp4ykgxs2AgNJyUc3xriO5E1RfWQBy2ljHSeaqb74bfxS6H4ru8qAF14jmmx4noRqSNbzmXc3zvfkAMIXUQDR1jjsiknmG7lGNx0db7",
      "Low rise": "https://lh3.googleusercontent.com/aida-public/AB6AXuBhIoM8m53UuONfux-WlsxNK95AeecPAjt2iBjMK_ru6KIg1HDRCxqwmZ0dwcC95uymobPCy5pz331izhS3dPl7lMMDALOawXI5liACKYHL8BZ8NVbSVgssAg_Cn-OP7w9Pb9YKQEnkMhbSrsKs2anAM1L9Mqf5t5jIKVsI5DSag4haWCIuJLYWqrUTE0SEjj_D7v5UazCiC_BtGJIhQFwtRBKY_IjpzVZliu18bZmOM7UmCMl86MSO7XhjJLD3ORY9pE8PgyKwNUoX"
    }
  },
  {
    id: "thighFit",
    label: "How should jeans fit through the thighs?",
    type: "radio",
    options: ["Fitted", "Relaxed", "Loose"],
    optional: false,
    descriptions: {
      "Fitted": "Contours to the leg for a sharp, tailored look.",
      "Relaxed": "Balanced silhouette with moderate room to breathe.",
      "Loose": "Generous cut for maximum comfort and a casual aesthetic."
    }
  },
  {
    id: "brands",
    label: "Which denim brands have you bought before?",
    type: "multi-select",
    options: ["Levi's", "Everlane", "Madewell", "Zara", "Gap", "J.Crew", "AG", "Frame", "Citizens of Humanity", "Paige", "Mother", "Joe's"],
    optional: false,
    tip: "Select all that apply. This helps our AI calibrate your 'Jackie Size' based on existing industry standards."
  },
  {
    id: "brandSizes",
    label: "What size did you buy in those brands?",
    type: "conditional-sizes",
    optional: false,
    tip: "Specify your most comfortable size for each selected brand."
  },
  {
    id: "fitFrustration",
    label: "Biggest fit frustration when buying jeans?",
    type: "radio",
    options: ["Waist gap", "Hip tightness", "Wrong length", "Thigh fit", "Rise", "Other"],
    optional: false,
    tip: "Personalizes the recommendation explanation."
  }
];
