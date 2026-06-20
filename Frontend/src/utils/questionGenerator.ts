import { Question } from "../components/medical/QuestionCard";

/* ================================ Scan Pattern Type ================================ */
export type ScanPattern =
  | "ulcer"
  | "patches"
  | "swelling"
  | "high-risk"
  | "normal";

/* ================================ Question Database ================================ */

const questionDatabase: Record<ScanPattern, Question[]> = {
  ulcer: [
    {
      id: "ulcer-duration",
      text: "How long have you noticed this ulcer or sore?",
      subtext: "This helps us understand if it requires immediate attention",
      type: "multiple-choice",
      options: [
        "Less than 1 week",
        "1-2 weeks",
        "2-3 weeks",
        "More than 3 weeks"
      ],
      required: true
    },
    {
      id: "ulcer-pain",
      text: "Does the ulcer cause pain or discomfort?",
      type: "yes-no",
      required: true
    },
    {
      id: "ulcer-healing",
      text: "Has the ulcer shown any signs of healing?",
      subtext: "For example, getting smaller or less painful",
      type: "yes-no",
      required: true
    },
    {
      id: "ulcer-recurrence",
      text: "Have you had similar ulcers in this area before?",
      type: "yes-no",
      required: true
    },
    {
      id: "ulcer-trauma",
      text: "Did you injure this area (bite, burn, sharp food)?",
      type: "yes-no",
      required: true
    }
  ],

  patches: [
    {
      id: "patch-duration",
      text: "How long have you noticed these white or red patches?",
      type: "multiple-choice",
      options: [
        "Less than 2 weeks",
        "2-4 weeks",
        "1-3 months",
        "More than 3 months"
      ],
      required: true
    },
    {
      id: "patch-irritation",
      text: "Do these patches cause pain or irritation?",
      type: "yes-no",
      required: true
    },
    {
      id: "patch-texture",
      text: "Can you feel a difference in texture when you touch the area?",
      subtext: "Rough, raised, or different from surrounding tissue",
      type: "yes-no",
      required: true
    },
    {
      id: "patch-growth",
      text: "Have the patches grown or changed in appearance?",
      type: "yes-no",
      required: true
    },
    {
      id: "patch-bleeding",
      text: "Do the patches bleed easily when touched or brushed?",
      type: "yes-no",
      required: true
    }
  ],

  swelling: [
    {
      id: "swelling-lump",
      text: "Do you feel a lump or thickening in the affected area?",
      type: "yes-no",
      required: true
    },
    {
      id: "swelling-duration",
      text: "How long has the swelling been present?",
      type: "multiple-choice",
      options: [
        "Less than 1 week",
        "1-2 weeks",
        "2-4 weeks",
        "More than 1 month"
      ],
      required: true
    },
    {
      id: "swelling-pain",
      text: "Is the swollen area painful or tender?",
      type: "yes-no",
      required: true
    },
    {
      id: "swelling-difficulty",
      text: "Do you have difficulty swallowing or speaking?",
      type: "yes-no",
      required: true
    },
    {
      id: "swelling-neck",
      text: "Have you noticed any lumps or swelling in your neck?",
      type: "yes-no",
      required: true
    }
  ],

  "high-risk": [
    {
      id: "hr-symptoms",
      text: "Are you experiencing any of these symptoms?",
      subtext: "Select the one that concerns you most",
      type: "multiple-choice",
      options: [
        "Persistent mouth pain",
        "Difficulty swallowing",
        "Numbness in mouth or tongue",
        "Unexplained bleeding",
        "None of the above"
      ],
      required: true
    },
    {
      id: "hr-duration",
      text: "How long have you had these symptoms?",
      type: "multiple-choice",
      options: [
        "Less than 2 weeks",
        "2-4 weeks",
        "1-2 months",
        "More than 2 months"
      ],
      required: true
    },
    {
      id: "hr-tobacco",
      text: "Do you currently use tobacco (smoking or chewing)?",
      type: "yes-no",
      required: true
    },
    {
      id: "hr-alcohol",
      text: "Do you consume alcohol regularly?",
      subtext: "More than 2 drinks per day",
      type: "yes-no",
      required: true
    },
    {
      id: "hr-previous",
      text: "Have you had oral cancer or precancerous lesions before?",
      type: "yes-no",
      required: true
    }
  ],

  normal: [
    {
      id: "normal-pain",
      text: "Have you experienced any mouth pain in the last 2 weeks?",
      type: "yes-no",
      required: true
    },
    {
      id: "normal-changes",
      text: "Have you noticed any changes in your mouth recently?",
      subtext: "Color changes, lumps, or unusual sensations",
      type: "yes-no",
      required: true
    },
    {
      id: "normal-tobacco",
      text: "Do you use any tobacco products?",
      type: "yes-no",
      required: true
    },
    {
      id: "normal-checkup",
      text: "When was your last dental check-up?",
      type: "multiple-choice",
      options: [
        "Within 6 months",
        "6-12 months ago",
        "1-2 years ago",
        "More than 2 years ago"
      ],
      required: true
    }
  ]
};

/* ================================   Generate Questions ================================ */

export function generateQuestionsFromScan(
  pattern: ScanPattern
): Question[] {
  return questionDatabase[pattern] ?? questionDatabase.normal;
}

/* ================================Mock AI Pattern Detection ================================ */

export function analyzeScanPattern(): ScanPattern {
  const patterns: ScanPattern[] = [
    "ulcer",
    "patches",
    "swelling",
    "high-risk",
    "normal"
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}