// src/config/questions.consumer.ts

export const consumerQuestions = [
  {
    key: "is_student",
    label: "Are you a student?",
    required: true,
    type: "select" as const,
    options: ["Yes", "No"],
  },

  // Top 3 cuisines (multi-select, max 3)
  {
    key: "top_cuisines",
    label: "Top 3 cuisines you’d order on PeerPlates (pick up to 3)",
    required: true,
    type: "checkboxes" as const,
    options: [
      "African",
      "Caribbean",
      "Chinese",
      "Indian",
      "Japanese",
      "Korean",
      "Thai",
      "Turkish",
      "Middle Eastern",
      "Mediterranean",
      "Italian",
      "Pastries",
      "Cakes",
      "Desserts",
    ],
  },

  // Dietary preferences (multi-select)
  {
    key: "dietary_preferences",
    label: "Dietary preferences (select all that apply)",
    required: true,
    type: "checkboxes" as const,
    options: [
      "None",
      "Halal",
      "Vegetarian",
      "Vegan",
      "Gluten-free",
      "Dairy-free",
      "High-protein / Gym meals",
      "Other",
    ],
  },

  // Gain from PeerPlates (single select — choose 1)
  {
    key: "gain_from_peerplates",
    label: "What would you like to gain from PeerPlates?",
    required: true,
    type: "select" as const,
    options: [
      "Meal prep",
      "Baked goods",
      "Homemade lunch/dinner",
      "Healthy/fitness meals",
      "Cultural/authentic meals",
      "Budget meals",
      "Snacks/desserts",
    ],
  },

  // Budget per meal (pickup)
  {
    key: "budget_per_meal",
    label: "Typical budget per meal",
    required: true,
    type: "select" as const,
    options: ["£7–£10", "£15+"],
  },

  // Postcode area
  {
    key: "postcode_area",
    label: "What’s your postcode area?",
    required: true,
    type: "text" as const,

  },

  // Attribution
  {
    key: "heard_about_peerplates",
    label: "How did you hear about PeerPlates?",
    required: true,
    type: "select" as const,
    options: ["TikTok", "Instagram", "Friend", "Poster / QR code", "Other"],
  },
];
