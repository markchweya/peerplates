export const consumerQuestions = [
  {
    key: "is_student",
    label: "Are you a student?",
    required: true,
    type: "select" as const,
    options: ["Yes", "No"],
  },
  {
    key: "university",
    label: "Which university?",
    required: true,
    type: "select" as const,
    options: [
      "University of Nottingham (UoN)",
      "Nottingham Trent University (NTU)",
      "Not applicable",
    ],
  },
  {
    key: "favourite_cuisine",
    label: "Favourite cuisine",
    required: true,
    type: "select" as const,
    options: [
      "African",
      "Asian",
      "Italian",
      "Caribbean",
      "Middle Eastern",
      "Baked goods / Desserts",
      "Other",
    ],
  },
  {
    key: "gain_from_peerplates",
    label: "What would you like to gain from PeerPlates?",
    required: true,
    type: "checkboxes" as const,
    options: [
      "Home‑style meals",
      "Meal prep",
      "Baked goods",
      "Affordable food",
      "Variety / new cuisines",
    ],
  },
];
