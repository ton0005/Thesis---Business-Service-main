import { AnalysisParams, AnalysisResult, TrendAPIResponse, SentimentAPIResponse, StructuredAnalysis } from './types';
import { getMockAnalysisResponse } from '../simulation/mockResponses';

// 直接从 process.env 获取环境变量
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const TREND_API_URL = process.env.NEXT_PUBLIC_TREND_API_URL;
const SENTIMENT_API_URL = process.env.NEXT_PUBLIC_SENTIMENT_API_URL;
const CACHE_EXPIRY_MS = 5000; // 缓存过期时间，可以后续移到环境变量

// 添加请求缓存
const requestCache = new Map<string, Promise<AnalysisResult>>();

/**
 * API client for making requests to the backend
 */
export const apiClient = {
  /**
   * Get analysis results based on parameters
   */
  async getAnalysisResults(params: AnalysisParams): Promise<AnalysisResult> {
    // 创建缓存键
    const cacheKey = `${params.keyword}_${params.startDate}_${params.endDate}_${params.videoCount}_${params.commentCount}`;
    
    // 如果已有相同请求在进行中，返回缓存的Promise
    if (requestCache.has(cacheKey)) {
      console.log('Using cached request for:', params.keyword);
      return requestCache.get(cacheKey)!;
    }
    
    // 添加日志，调试用
    console.log('API request params:', params);
    
    // 创建请求Promise并缓存
    const requestPromise = this._fetchAnalysisData(params);
    requestCache.set(cacheKey, requestPromise);
    
    try {
      // 等待请求完成
      const result = await requestPromise;
      return result;
    } finally {
      // 请求完成后删除缓存，以便下次可以重新请求
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, CACHE_EXPIRY_MS);
    }
  },
  
  /**
   * 内部方法：获取分析数据
   * Strategy: First try /gemini (orchestrator), fallback to individual APIs if needed
   */
  async _fetchAnalysisData(params: AnalysisParams): Promise<AnalysisResult> {
    // 如果使用模拟数据，直接返回模拟响应
    if (USE_MOCK_DATA) {
      console.log('Using mock data');
      return await getMockAnalysisResponse(
        params.keyword,
        params.startDate,
        params.endDate,
        params.videoCount,
        params.commentCount
      );
    }
    
    // Request body for APIs
    const requestBody = {
      product: params.keyword,
      startDate: params.startDate,
      endDate: params.endDate,
      videoCount: params.videoCount || 20,
      commentCount: params.commentCount || 20
    };
    
    // STEP 1: Try calling /gemini first (orchestrator endpoint)
    if (GEMINI_API_URL) {
      try {
        console.log('Calling /gemini orchestrator endpoint:', GEMINI_API_URL);
        
        // Create dedicated abort controller for /gemini
        const geminiController = new AbortController();
        const geminiTimeoutId = setTimeout(() => {
          console.log('Gemini timeout triggered after 3 minutes');
          geminiController.abort('Timeout after 3 minutes');
        }, 180000); // 3 minutes
        
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: geminiController.signal
        });
        
        clearTimeout(geminiTimeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Gemini orchestrator response received:', data);
          
          // Process the unified response
          return this.processUnifiedResponse(params.keyword, params.startDate, params.endDate, data);
        } else {
          console.warn(`/gemini returned ${response.status}, falling back to individual APIs`);
        }
      } catch (error) {
        console.error('/gemini request failed:', error);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('⚠️ /gemini timed out after 3 minutes, falling back to individual APIs');
          } else {
            console.warn(`⚠️ /gemini error: ${error.message}, falling back to individual APIs`);
          }
        }
      }
    }
    
    // STEP 2: Fallback - call individual APIs if /gemini failed
    console.log('🔄 Falling back to individual API calls...');
    const missingDataSources: string[] = [];
    let trendData: any[] = [];
    let sentimentData: any[] = [];
    
    // Fetch Trend Data
    if (TREND_API_URL) {
      try {
        console.log('📊 Fetching trend data from:', TREND_API_URL);
        
        const trendController = new AbortController();
        const trendTimeoutId = setTimeout(() => {
          trendController.abort('Trend API timeout');
        }, 180000);
        
        const response = await fetch(TREND_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: trendController.signal
        });
        
        clearTimeout(trendTimeoutId);
        
        if (response.ok) {
          const trendResponse = await response.json() as TrendAPIResponse;
          console.log('✅ Trend data received:', trendResponse);
          
          if (trendResponse.timeline && trendResponse.timeline.length > 0) {
            trendData = trendResponse.timeline.map((item) => ({
              date: item.date,
              interest: item.values[0]?.extracted_value || 0
            }));
            console.log('✅ Trend data processed:', trendData.length, 'data points');
          }
        } else {
          console.warn('❌ Trend API failed with status:', response.status);
          missingDataSources.push('trend');
        }
      } catch (error) {
        console.error('❌ Trend API error:', error);
        missingDataSources.push('trend');
      }
    } else {
      console.warn('❌ TREND_API_URL not configured');
      missingDataSources.push('trend');
    }
    
    // Fetch Sentiment Data
    if (SENTIMENT_API_URL) {
      try {
        console.log('💬 Fetching sentiment data from:', SENTIMENT_API_URL);
        
        const sentimentController = new AbortController();
        const sentimentTimeoutId = setTimeout(() => {
          sentimentController.abort('Sentiment API timeout');
        }, 180000);
        
        const response = await fetch(SENTIMENT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: sentimentController.signal
        });
        
        clearTimeout(sentimentTimeoutId);
        
        if (response.ok) {
          const sentimentResponse = await response.json() as SentimentAPIResponse;
          console.log('✅ Sentiment data received:', sentimentResponse);
          
          if (sentimentResponse.chartData && sentimentResponse.chartData.length > 0) {
            sentimentData = sentimentResponse.chartData.map((item) => ({
              sentiment: item.label.charAt(0).toUpperCase() + item.label.slice(1).replace('_', ' '),
              value: item.value
            }));
            console.log('✅ Sentiment data processed:', sentimentData.length, 'categories');
          }
        } else {
          console.warn('❌ Sentiment API failed with status:', response.status);
          missingDataSources.push('sentiment');
        }
      } catch (error) {
        console.error('❌ Sentiment API error:', error);
        missingDataSources.push('sentiment');
      }
    } else {
      console.warn('❌ SENTIMENT_API_URL not configured');
      missingDataSources.push('sentiment');
    }
    
    // Always mark recommendations as missing in fallback mode
    missingDataSources.push('recommendations');
    
    // Fallback to mock data if both individual APIs also failed
    if (trendData.length === 0 && sentimentData.length === 0) {
      console.log('All APIs failed, falling back to mock data');
      return await getMockAnalysisResponse(
        params.keyword,
        params.startDate,
        params.endDate,
        params.videoCount,
        params.commentCount
      );
    }
    
    // Return partial results
    return {
      keyword: params.keyword,
      dateRange: `${params.startDate} - ${params.endDate}`,
      trendData,
      sentimentData,
      analysis: 'AI recommendations are currently unavailable. The /gemini orchestrator endpoint timed out or failed. Please refer to the trend and sentiment data above.',
      recommendations: ['Trend and sentiment data retrieved from individual API endpoints'],
      structuredAnalysis: undefined,
      hasPartialData: true,
      missingDataSources
    };
  },
  
  /**
   * Process unified response from /gemini orchestrator
   */
  processUnifiedResponse(
    keyword: string,
    startDate: string,
    endDate: string,
    data: any
  ): AnalysisResult {
    const missingDataSources: string[] = [];
    
    // Extract trend data
    let trendData: any[] = [];
    try {
      if (data.analysis?.trend?.timeline) {
        trendData = data.analysis.trend.timeline.map((item: any) => ({
          date: item.date,
          interest: item.values[0]?.extracted_value || 0
        }));
      } else {
        missingDataSources.push('trend');
      }
    } catch (error) {
      console.warn('Failed to process trend data:', error);
      missingDataSources.push('trend');
    }
    
    // Extract sentiment data
    let sentimentData: any[] = [];
    try {
      if (data.analysis?.sentiment?.chartData) {
        sentimentData = data.analysis.sentiment.chartData.map((item: any) => ({
          sentiment: item.label.charAt(0).toUpperCase() + item.label.slice(1).replace('_', ' '),
          value: item.value
        }));
      } else {
        missingDataSources.push('sentiment');
      }
    } catch (error) {
      console.warn('Failed to process sentiment data:', error);
      missingDataSources.push('sentiment');
    }
    
    // Extract recommendations
    let recommendationText = '';
    let structuredAnalysis: StructuredAnalysis | null = null;
    let recommendations: string[] = [];
    
    try {
      if (data.recommendation) {
        recommendationText = data.recommendation;
        structuredAnalysis = this.extractStructuredAnalysis(recommendationText);
        
        if (structuredAnalysis.recommendation) {
          const recItems = this.extractItemsFromText(structuredAnalysis.recommendation);
          recommendations = recItems.length > 0 ? recItems : this.extractRecommendationsFromText(recommendationText);
        } else {
          recommendations = this.extractRecommendationsFromText(recommendationText);
        }
      } else {
        missingDataSources.push('recommendations');
        recommendationText = 'AI recommendations are currently unavailable.';
        recommendations = ['Please refer to trend and sentiment data above'];
      }
    } catch (error) {
      console.warn('Failed to process recommendations:', error);
      missingDataSources.push('recommendations');
      recommendationText = 'AI recommendations are currently unavailable.';
      recommendations = ['Please refer to trend and sentiment data above'];
    }
    
    return {
      keyword,
      dateRange: `${startDate} - ${endDate}`,
      trendData,
      sentimentData,
      analysis: recommendationText,
      recommendations,
      structuredAnalysis: structuredAnalysis || undefined,
      hasPartialData: missingDataSources.length > 0,
      missingDataSources: missingDataSources.length > 0 ? missingDataSources : undefined
    };
  },
  
  /**
   * 提取文本中的特定部分
   * @param text 原始文本
   * @param start 开始标记
   * @param end 结束标记 (可选)
   */
  extractSection(text: string, start: string, end?: string): string {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) {
      return '';
    }
    
    const contentStart = startIndex + start.length;
    
    if (!end) {
      return text.substring(contentStart).trim();
    }
    
    const endIndex = text.indexOf(end, contentStart);
    if (endIndex === -1) {
      return text.substring(contentStart).trim();
    }
    
    return text.substring(contentStart, endIndex).trim();
  },
  
  /**
   * 从推荐文本中提取结构化分析
   */
  extractStructuredAnalysis(text: string): StructuredAnalysis {
    // 输出原始文本以便调试
    console.log("Original analysis text:", text);
    
    // 确定所有可能的节标题
    const sections = [
      { name: "overallAnalysis", markers: ["Overall Analysis", "Analysis Results:", "1. Analysis Results"] },
      { name: "recommendation", markers: ["Recommendation", "2. Recommendation", "Stock Action:"] },
      { name: "justification", markers: ["Justification", "3. Justification"] },
      { name: "estimatedUnits", markers: ["Estimated Units", "4. Estimated Units"] },
      { name: "importantConsiderations", markers: ["Important Considerations", "5. Important Considerations"] },
      { name: "disclaimer", markers: ["Disclaimer", "Disclaimer:"] }
    ];
    
    // 查找每个节的起始位置
    const positions: {[key: string]: {index: number, marker: string}} = {};
    
    // 先标准化文本格式 - 确保每个部分前有空行
    let normalizedText = text;
    for (const section of sections) {
      for (const marker of section.markers) {
        // 查找不带数字的标题和带数字的标题
        const plainMarker = marker.replace(/^\d+\.\s*/, '');
        
        // 替换各种格式的标题为标准格式
        normalizedText = normalizedText
          .replace(new RegExp(`(^|\\n)\\s*(\\d+\\.)?\\s*${plainMarker}\\s*:?\\s*`, 'g'), 
                   `\n\n${plainMarker}\n`);
      }
    }
    
    // 再次进行处理以查找各节位置
    for (const section of sections) {
      for (const marker of section.markers) {
        // 去掉数字前缀，保留关键字
        const cleanMarker = marker.replace(/^\d+\.\s*/, '');
        
        // 在标准化文本中查找位置
        const index = normalizedText.indexOf(`\n\n${cleanMarker}\n`);
        if (index !== -1 && (!positions[section.name] || index < positions[section.name].index)) {
          positions[section.name] = { index, marker: `\n\n${cleanMarker}\n` };
        }
      }
    }
    
    console.log("Found sections:", Object.keys(positions));
    
    // 按位置排序节
    const orderedSections = Object.entries(positions)
      .sort((a, b) => a[1].index - b[1].index)
      .map(([name, pos]) => ({ name, pos }));
    
    // 提取每个节的内容
    const result: {[key: string]: string} = {};
    
    for (let i = 0; i < orderedSections.length; i++) {
      const section = orderedSections[i];
      const startPos = section.pos.index + section.pos.marker.length;
      const endPos = i < orderedSections.length - 1 ? orderedSections[i + 1].pos.index : normalizedText.length;
      
      // 提取并清理文本
      let content = normalizedText.substring(startPos, endPos).trim();
      // 移除可能的数字前缀和空行
      content = content
        .replace(/^\s*\d+\.\s*/, '') // 移除开头的数字前缀
        .replace(/\n{2,}/g, '\n')    // 压缩多个空行为一个
        .trim();
      
      result[section.name] = content;
    }
    
    // 特殊处理 considerations 列表
    const considerations = this.extractConsiderationsList(
      result.importantConsiderations || ""
    );
    
    console.log("Extracted structured analysis:", {
      overallAnalysis: result.overallAnalysis?.substring(0, 50) + "...",
      recommendation: result.recommendation?.substring(0, 50) + "...",
      estimatedUnits: result.estimatedUnits?.substring(0, 50) + "...",
      considerations: considerations.length + " items",
      disclaimer: result.disclaimer?.substring(0, 50) + "..."
    });
    
    return {
      overallAnalysis: result.overallAnalysis || "",
      recommendation: result.recommendation || "",
      estimatedUnits: result.estimatedUnits || "",
      considerations: considerations,
      disclaimer: result.disclaimer || ""
    };
  },

  /**
   * 提取考虑因素列表
   */
  extractConsiderationsList(text: string): string[] {
    if (!text) return [];
    
    // 使用正则表达式查找所有以 "-" 或 "•" 开头的项，或者以数字加点开头的项
    const listItemRegex = /(?:^|\n)(?:\s*[-•]|\s*\d+\.\s*)(.*?)(?=\n\s*[-•]|\n\s*\d+\.\s*|$)/g;
    const matches = Array.from(text.matchAll(listItemRegex));
    
    if (matches.length === 0) {
      // 如果没有明确的列表标记，尝试按行分割，移除序号类前缀
      return text
        .split(/[\n\r]+/)
        .map((line: string) => line.replace(/^\s*[\d\.\-•]+\s*/, '').trim())
        .filter((line: string) => line.length > 5); // 过滤掉太短的行
    }
    
    return matches
      .map((match: RegExpMatchArray) => match[1].trim())
      .filter((item: string) => item.length > 0);
  },
  
  /**
   * 从推荐文本中提取建议
   */
  extractRecommendationsFromText(text: string): string[] {
    // 尝试提取 "3. Justification-" 后面的内容
    const justificationSection = this.extractSection(text, "3. Justification-", "4. Estimated Units-");
    if (!justificationSection) {
      // 如果没找到，返回默认建议
      return [
        "Review market trends for potential shifts",
        "Monitor competitor activities",
        "Consider targeted marketing campaigns"
      ];
    }
    
    // 将justification部分按短句分割
    return justificationSection
      .split('.')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0 && item.charAt(0) === '-')
      .map((item: string) => item.substring(1).trim());
  },

  /**
   * 从文本中提取列表项
   */
  extractItemsFromText(text: string): string[] {
    // 修复: 移除 /s 标志，使用兼容性更好的正则表达式
    // 使用正则表达式查找所有以 "-" 或 "•" 开头的项，或者以数字加点开头的项
    const listItemRegex = /(?:^|\n)(?:\s*[-•]|\s*\d+\.\s*)(.*?)(?=\n\s*[-•]|\n\s*\d+\.\s*|$)/g;
    const matches = Array.from(text.matchAll(listItemRegex));
    
    if (matches.length === 0) {
      // 如果没有明确的列表标记，尝试将短句作为单独的项
      return text
        .split(/[\.!\?]/)
        .map((sentence: string) => sentence.trim())
        .filter((sentence: string) => sentence.length > 10);
    }
    
    return matches
      .map((match: RegExpMatchArray) => match[1].trim())
      .filter((item: string) => item.length > 0);
  }
};