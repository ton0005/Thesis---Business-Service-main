/**
 * Mock data for development and testing
 */

export const mockTrendData: { 
  [key: string]: { date: string; interest: number }[] 
} = {
  "iPhone": [
    { date: "2023-01", interest: 45 },
    { date: "2023-02", interest: 50 },
    { date: "2023-03", interest: 35 },
    { date: "2023-04", interest: 60 },
    { date: "2023-05", interest: 75 },
    { date: "2023-06", interest: 65 },
  ],
  "Android": [
    { date: "2023-01", interest: 55 },
    { date: "2023-02", interest: 48 },
    { date: "2023-03", interest: 52 },
    { date: "2023-04", interest: 58 },
    { date: "2023-05", interest: 65 },
    { date: "2023-06", interest: 70 },
  ],
  "Laptop": [
    { date: "2023-01", interest: 62 },
    { date: "2023-02", interest: 58 },
    { date: "2023-03", interest: 49 },
    { date: "2023-04", interest: 55 },
    { date: "2023-05", interest: 61 },
    { date: "2023-06", interest: 68 },
  ],
  "Camera": [
    { date: "2023-01", interest: 35 },
    { date: "2023-02", interest: 38 },
    { date: "2023-03", interest: 40 },
    { date: "2023-04", interest: 42 },
    { date: "2023-05", interest: 45 },
    { date: "2023-06", interest: 48 },
  ],
};

export const mockSentimentData: {
  [key: string]: { sentiment: string; value: number }[]
} = {
  "iPhone": [
    { sentiment: "Positive", value: 45 },
    { sentiment: "Neutral", value: 35 },
    { sentiment: "Negative", value: 20 },
  ],
  "Android": [
    { sentiment: "Positive", value: 40 },
    { sentiment: "Neutral", value: 40 },
    { sentiment: "Negative", value: 20 },
  ],
  "Laptop": [
    { sentiment: "Positive", value: 55 },
    { sentiment: "Neutral", value: 30 },
    { sentiment: "Negative", value: 15 },
  ],
  "Camera": [
    { sentiment: "Positive", value: 60 },
    { sentiment: "Neutral", value: 25 },
    { sentiment: "Negative", value: 15 },
  ],
};

export const mockRecommendations: {
  [key: string]: string[]
} = {
  "iPhone": [
    "Focus on camera quality improvements",
    "Address battery life concerns in marketing",
    "Highlight ecosystem integration advantages",
  ],
  "Android": [
    "Emphasize customization options",
    "Address update frequency concerns",
    "Highlight value proposition compared to competitors",
  ],
  "Laptop": [
    "Focus on performance optimization",
    "Address concerns about weight and portability",
    "Highlight battery life improvements",
  ],
  "Camera": [
    "Emphasize photo quality in marketing",
    "Address ease of use for beginners",
    "Highlight unique features compared to smartphone cameras",
  ],
};

export const mockAnalyses: {
  [key: string]: string
} = {
  "iPhone": "Analysis shows iPhone has maintained strong interest with an upward trend. Positive sentiment dominates at 45%, primarily driven by camera quality and ecosystem integration. The 20% negative sentiment is mostly related to battery life and pricing concerns.",
  "Android": "Android devices show consistent growth in interest over the period. Sentiment is evenly split between positive and neutral (40% each), with positive comments focusing on customization and value. Negative sentiment (20%) relates mainly to update frequency and fragmentation.",
  "Laptop": "Laptop interest shows recovery after a dip in March. Strong positive sentiment (55%) reflects satisfaction with performance and features. Negative sentiment (15%) primarily concerns weight, battery life, and pricing.",
  "Camera": "Camera interest shows steady growth with the highest positive sentiment (60%) among all categories, reflecting strong satisfaction with photo quality and features. Negative sentiment (15%) mainly relates to learning curve and smartphone camera comparisons.",
};