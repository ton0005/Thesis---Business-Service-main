import { apiClient } from './api';
import { AnalysisParams, AnalysisResult, ProductUploadResponse } from './types';
import { productDataService } from './productDataService';

/**
 * Service for handling analysis functionality
 */
export const analysisService = {
  /**
   * Request analysis based on form parameters
   */
  async requestAnalysis(params: AnalysisParams): Promise<AnalysisResult> {
    try {
      // 移除这里的上传文件逻辑。
      // 文件上传应该只通过 AnalysisForm 中的 handleFileChange -> handleUploadOnly 路径触发。
      // if (params.file) {
      //   console.log('[AnalysisService] Uploading file with product name:', params.keyword);
      //   await productDataService.uploadProductData(params.file, params.keyword);
      // }
      
      // 直接进行分析请求，假设文件（如果已选择）已通过自动上传处理
      console.log('[AnalysisService] Requesting analysis with keyword:', params.keyword);
      // 注意：这里将 params.file 移除，因为 analysisService.requestAnalysis 不再处理文件上传
      const { ...analysisParams } = params; 
      return await apiClient.getAnalysisResults(analysisParams);
    } catch (error) {
      console.error('Analysis request failed:', error);
      throw error;
    }
  },
  
  /**
   * 直接调用产品数据上传服务 (此方法由 AnalysisForm 中的 handleUploadOnly 调用)
   */
  uploadProductData(file: File, productName: string): Promise<ProductUploadResponse> {
    console.log('[AnalysisService] Calling productDataService.uploadProductData from analysisService');
    return productDataService.uploadProductData(file, productName);
  },
  
  /**
   * Export analysis results (e.g., as CSV)
   */
  exportAnalysisData(data: AnalysisResult): void {
    // 原有的CSV导出代码保持不变
    const trendCSV = [
      'Date,Interest',
      ...data.trendData.map(item => `${item.date},${item.interest}`)
    ].join('\n');
    
    const sentimentCSV = [
      'Sentiment,Value',
      ...data.sentimentData.map(item => `${item.sentiment},${item.value}`)
    ].join('\n');
    
    const csvContent = `
Analysis Results for: ${data.keyword}
Date Range: ${data.dateRange}

TREND DATA:
${trendCSV}

SENTIMENT DATA:
${sentimentCSV}

ANALYSIS:
${data.analysis}

RECOMMENDATIONS:
${data.recommendations.join('\n')}
    `.trim();
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analysis_${data.keyword.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};