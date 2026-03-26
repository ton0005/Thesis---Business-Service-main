export type TrendDataPoint = {
  date: string;
  interest: number;
};

export type SentimentDataPoint = {
  sentiment: string;
  value: number;
};

export type StructuredAnalysis = {
  overallAnalysis: string;
  recommendation: string;
  estimatedUnits: string;
  considerations: string[];
  disclaimer: string;
};

export type AnalysisResult = {
  keyword: string;
  dateRange: string;
  trendData: TrendDataPoint[];
  sentimentData: SentimentDataPoint[];
  analysis: string;
  recommendations: string[];
  structuredAnalysis?: StructuredAnalysis;
  hasPartialData?: boolean; // Flag to indicate if some data is missing
  missingDataSources?: string[]; // List of what data is missing (e.g., ['trend', 'sentiment', 'recommendations'])
};

// Individual API response types
export type TrendAPIResponse = {
  trend: {
    start_value: number;
    end_value: number;
    percent_change: number;
    trend: string;
  };
  timeline: Array<{
    date: string;
    timestamp: string;
    values: Array<{
      query: string;
      value: string;
      extracted_value: number;
    }>;
  }>;
};

export type SentimentAPIResponse = {
  summary: {
    clearly_positive: number;
    clearly_negative: number;
    neutral: number;
    mixed: number;
  };
  chartData: Array<{
    label: string;
    value: number;
  }>;
  comments: Array<{
    comment: string;
    sentiment_score: number;
    sentiment_magnitude: number;
    sentiment: string;
  }>;
};

export type AnalysisParams = {
  keyword: string;
  startDate: string;
  endDate: string;
  videoCount: number;
  commentCount: number;
  file?: File;
};

// 只保留统一 API 响应的类型定义
export type GeminiResponse = {
  analysis: {
    input: {
      product: string;
      startDate: string;
      endDate: string;
      videoCount: number;
      commentCount: number;
    };
    inventory: Array<{
      "Beginning Inventory": number;
      "COGS": number;
      "Ending Inventory": number;
      "Sales": number;
      "Target Turnover": number;
      "id": string;
      "period": string;
    }>;
    trend: {
      trend: {
        start_value: number;
        end_value: number;
        percent_change: number;
        trend: string;
      };
      timeline: Array<{
        date: string;
        timestamp: string;
        values: Array<{
          query: string;
          value: string;
          extracted_value: number;
        }>;
      }>;
    };
    sentiment: {
      summary: {
        clearly_positive: number;
        clearly_negative: number;
        neutral: number;
        mixed: number;
      };
      chartData: Array<{
        label: string;
        value: number;
      }>;
      comments: Array<{
        comment: string;
        sentiment_score: number;
        sentiment_magnitude: number;
        sentiment: string;
      }>;
    };
  };
  recommendation: string;
};

// 产品库存数据类型
export type ProductInventoryData = {
  "Beginning Inventory": number;
  "COGS": number;
  "Ending Inventory": number;
  "Sales": number;
  "Target Turnover": number;
  "id": string;
  "period": string;
};

// 产品数据上传请求类型
export type ProductUploadRequest = {
  [productName: string]: ProductInventoryData;
};

// 产品数据上传响应类型
export type ProductUploadResponse = {
  message: string;
  data: ProductInventoryData[];
};

// 解析后的文件数据类型
export type ParsedFileData = {
  beginningInventory: number;
  cogs: number;
  endingInventory: number;
  sales: number;
  targetTurnover: number;
  period: string;
  id?: string;
};