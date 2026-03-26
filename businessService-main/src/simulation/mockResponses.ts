import { mockTrendData, mockSentimentData, mockAnalyses, mockRecommendations } from './mockData';

export type AnalysisResult = {
  keyword: string;
  dateRange: string;
  trendData: { date: string; interest: number }[];
  sentimentData: { sentiment: string; value: number }[];
  analysis: string;
  recommendations: string[];
};

/**
 * Simulates an API call to get analysis results
 */
export async function getMockAnalysisResponse(
  keyword: string,
  startDate: string,
  endDate: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoCount?: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commentCount?: number
): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get the keyword or fallback to a default
  const normalizedKeyword = keyword.toLowerCase();
  const keywordMatch = Object.keys(mockTrendData).find(k => 
    k.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(k.toLowerCase())
  ) || "iPhone";
  
  // 可以在这里使用 videoCount 和 commentCount 参数，如果需要的话
  // 或者直接保留它们作为未来扩展使用
  
  return {
    keyword: keyword,
    dateRange: `${startDate} - ${endDate}`,
    trendData: mockTrendData[keywordMatch as keyof typeof mockTrendData] || mockTrendData["iPhone"],
    sentimentData: mockSentimentData[keywordMatch as keyof typeof mockSentimentData] || mockSentimentData["iPhone"],
    analysis: mockAnalyses[keywordMatch as keyof typeof mockAnalyses] || mockAnalyses["iPhone"],
    recommendations: mockRecommendations[keywordMatch as keyof typeof mockRecommendations] || mockRecommendations["iPhone"]
  };
}