"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TrendChart from '@/components/results/TrendChart';
import SentimentChart from '@/components/results/SentimentChart';
import { analysisService } from '@/services/analysisService';
import { AnalysisResult } from '@/services/types';
import { exportToPDF } from '@/utils/pdfExport';
import styles from './ResultsPage.module.css';

// 创建一个内部组件来使用 useSearchParams
function ResultsContent() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const fetchResults = async () => {
      let progressInterval: NodeJS.Timeout | null = null;
      
      try {
        const keyword = searchParams.get('keyword') || '';
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';
        const videoCount = Number(searchParams.get('videoCount')) || 50;
        const commentCount = Number(searchParams.get('commentCount')) || 100;
        
        // Start progress animation
        progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            // Slow down as we approach 90% to avoid completing before actual data arrives
            if (prev < 30) return prev + 2;
            if (prev < 60) return prev + 1;
            if (prev < 85) return prev + 0.5;
            return prev + 0.2; // Very slow near the end
          });
        }, 1000); // Update every second
        
        console.log('🔍 Starting analysis request...');
        const results = await analysisService.requestAnalysis({
          keyword,
          startDate,
          endDate,
          videoCount,
          commentCount
        });
        
        console.log('✅ Analysis results received:', results);
        
        if (progressInterval) clearInterval(progressInterval);
        setLoadingProgress(100); // Complete the progress bar
        
        // Small delay to show 100% before transitioning
        setTimeout(() => {
          setResults(results);
          setLoading(false);
        }, 300);
        
      } catch (error) {
        console.error('❌ Failed to fetch results:', error);
        if (progressInterval) clearInterval(progressInterval);
        setError(error instanceof Error ? error.message : 'An error occurred while loading analysis results');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchParams]);

  // 处理导出PDF
  const handlePrintReport = async () => {
    if (!results) return;
    
    try {
      setExportingPDF(true);
      await exportToPDF(results);
    } finally {
      setExportingPDF(false);
    }
  };

  // 返回使用模块化样式的 JSX
  if (loading) {
    const estimatedTime = Math.max(0, Math.ceil((100 - loadingProgress) / 100 * 150)); // Estimate remaining time in seconds
    
    return (
      <main className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className="w-full max-w-md space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className={styles.spinner}></div>
                <span className="text-lg font-medium">Analyzing data...</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This may take up to 2-3 minutes. Please wait.
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Processing: {Math.min(Math.round(loadingProgress), 100)}%</p>
                {estimatedTime > 0 && estimatedTime < 200 && (
                  <p className="mt-1">Estimated time remaining: ~{estimatedTime}s</p>
                )}
              </div>
              
              {/* Status messages */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                {loadingProgress < 30 && <p>🔍 Gathering trend data...</p>}
                {loadingProgress >= 30 && loadingProgress < 60 && <p>💬 Analyzing sentiment...</p>}
                {loadingProgress >= 60 && loadingProgress < 85 && <p>🤖 Generating AI recommendations...</p>}
                {loadingProgress >= 85 && <p>✨ Finalizing results...</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!results || error) {
    return (
      <main className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>Unable to load analysis results</h2>
            <p className={styles.errorMessage}>
              {error || 'An error occurred while loading data. Please try again.'}
            </p>
            {error?.includes('taking too long') && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Try reducing the date range, video count, or comment count to speed up analysis.
                </p>
              </div>
            )}
            <Link href="/" className={styles.returnLink}>
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h1>Analysis Results</h1>
            <p className={styles.subtitle}>Keyword: {results.keyword} | Date Range: {results.dateRange}</p>
          </div>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.actionButton}
              onClick={handlePrintReport}
              disabled={exportingPDF}
            >
              {exportingPDF ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIcon}>
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Print Report
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Warning banner for partial data */}
        {results.hasPartialData && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Partial Data Available</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {results.missingDataSources && results.missingDataSources.length > 0 ? (
                    <>
                      The following data sources are currently unavailable: <strong>{results.missingDataSources.join(', ')}</strong>.
                      {results.missingDataSources.includes('recommendations') && (
                        <> AI recommendations may be temporarily unavailable, but trend and sentiment data are displayed below.</>
                      )}
                    </>
                  ) : (
                    <>Some data may be incomplete due to temporary service issues. The available data is displayed below.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className={styles.chartsGrid}>
          <div className={`${styles.card} chart-for-pdf`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Trend Analysis</h2>
              <p className={styles.cardSubtitle}>Interest trend changes over the specified time period</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.chartContainer}>
                {results.trendData && results.trendData.length > 0 ? (
                  <TrendChart data={results.trendData} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>Trend data is currently unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`${styles.card} chart-for-pdf`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Sentiment Distribution</h2>
              <p className={styles.cardSubtitle}>Distribution of user sentiment toward the keyword</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.chartContainer}>
                {results.sentimentData && results.sentimentData.length > 0 ? (
                  <SentimentChart data={results.sentimentData} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>Sentiment data is currently unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Analysis Conclusions</h2>
            <p className={styles.cardSubtitle}>Comprehensive analysis and recommendations based on data</p>
          </div>
          <div className={styles.cardBody}>
            {results.structuredAnalysis ? (
              <div className="space-y-6">
                {/* 整体分析部分 */}
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>Overall Analysis</h3>
                  <div className={styles.analysisContainer}>
                    <p className={styles.analysisParagraph}>
                      {results.structuredAnalysis.overallAnalysis}
                    </p>
                  </div>
                </div>
                
                {/* 推荐行动部分 */}
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>Recommendation</h3>
                  <div className={styles.analysisContainer}>
                    <p className={styles.analysisParagraph}>
                      {results.structuredAnalysis.recommendation}
                    </p>
                  </div>
                </div>
                
                {/* 预估数量部分 */}
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>Estimated Units</h3>
                  <div className={styles.analysisContainer}>
                    <p className={styles.analysisParagraph}>
                      {results.structuredAnalysis.estimatedUnits}
                    </p>
                  </div>
                </div>
                
                {/* 重要考虑因素部分 */}
                {results.structuredAnalysis.considerations.length > 0 && (
                  <div className={styles.analysisSection}>
                    <h3 className={styles.sectionTitle}>Important Considerations</h3>
                    <div className={styles.analysisContainer}>
                      <ul className={styles.recommendationsList}>
                        {results.structuredAnalysis.considerations.map((item, i) => (
                          <li key={i} className={styles.recommendationItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* 免责声明部分 */}
                {results.structuredAnalysis.disclaimer && (
                  <div className={styles.analysisSection}>
                    <h3 className={styles.sectionTitle}>Disclaimer</h3>
                    <div className={styles.disclaimer}>
                      <p className={styles.disclaimerText}>
                        {results.structuredAnalysis.disclaimer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* 现有的非结构化显示 */}
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>Overall Analysis</h3>
                  <p className={styles.analysisParagraph}>{results.analysis}</p>
                </div>
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>Recommendations</h3>
                  <ul className={styles.recommendationsList}>
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className={styles.recommendationItem}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        
        <Link href="/" className={styles.backLink}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.backIcon}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Return to Home
        </Link>
      </div>
    </main>
  );
}

// 主页面组件
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className={styles.pageContainer + " flex items-center justify-center"}>
        <div className={styles.spinner}></div>
        <span className="ml-3">Loading...</span>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}