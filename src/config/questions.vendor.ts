export const vendorQuestions = [
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
      "Not a student",
    ],
  },
  {
    key: "sell_what",
    label: "What do you sell? (Cuisine / category)",
    required: true,
    type: "textarea" as const,
    placeholder: "e.g. Nigerian meals, pastries, cupcakes…",
  },
  {
    key: "instagram_handle",
    label: "What’s your business Instagram page name?",
    required: true,
    type: "text" as const,
    placeholder: "@yourbusiness (or tick: I don’t have one)",
  },
  {
    key: "closest_campus",
    label: "Which campus is closest to you?",
    required: true,
    type: "select" as const,
    options: ["UoN", "NTU"],
  },
  {
    key: "bus_minutes",
    label: "Approximately how many minutes by bus?",
    required: true,
    type: "number" as const,
    placeholder: "e.g. 15",
  },

  // ✅ Compliance tick-boxes (required)
  {
    key: "compliance_readiness",
    label: "Compliance readiness (tick all that apply)",
    required: true,
    type: "checkboxes" as const,
    options: [
      "Registered with Nottingham City Council",
      "Level 2 Hygiene Certificate",
      "Food Safety Plan",
      "Already inspected",
      "None of the above",
    ],
  },

  // ✅ Optional certificate upload (MVP-safe)
  {
    key: "certificate_upload",
    label: "Upload certificate (optional)",
    required: false,
    type: "file" as const,
    accept: [".pdf", ".jpg", ".jpeg", ".png"],
    helpText:
      "Optional — upload now or later. This helps us onboard you faster.",
  },
];
