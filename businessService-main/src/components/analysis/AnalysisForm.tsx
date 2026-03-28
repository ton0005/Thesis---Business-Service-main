"use client";

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analysisService } from '@/services/analysisService';
import styles from './AnalysisForm.module.css';

export default function AnalysisForm() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoCount, setVideoCount] = useState(50);
  const [commentCount, setCommentCount] = useState(100);
  const [fileValid, setFileValid] = useState(false);
  const [autoUpload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // 设置默认的开始日期和结束日期
  const defaultStartDate = "2025-01-01";
  const defaultEndDate = "2025-05-01";
  const defaultKeyword = "iphone 16 pro max";
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFileError("");
    setUploadSuccess(false);

    const formData = new FormData(e.currentTarget);

    const params = new URLSearchParams({
      keyword: (formData.get('keyword') as string) || '',
      startDate: (formData.get('startDate') as string) || '',
      endDate: (formData.get('endDate') as string) || '',
      videoCount: String(Number(formData.get('videoCount')) || 50),
      commentCount: String(Number(formData.get('commentCount')) || 100)
    });

    router.push(`/results?${params.toString()}`);
  };

  const handleFileChange = () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      console.log('[AnalysisForm] File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      setFileName(file.name);
      setFileError("");
      setUploadSuccess(false);
      
      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        console.log('[AnalysisForm] File type error: Not a JSON file');
        setFileError("Only JSON files are supported for product data upload.");
        setFileValid(false);
        return;
      }
      
      // 验证文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        console.log('[AnalysisForm] File size error: Exceeds 2MB limit');
        setFileError('File size exceeds the limit (2MB).');
        setFileValid(false);
        return;
      }
      
      setFileValid(true);
      console.log('[AnalysisForm] File validation passed. Ready for upload.');
      
      if (autoUpload) {
        console.log('[AnalysisForm] Auto-upload enabled, triggering upload...');
        // 延迟一点点时间，确保UI状态先更新
        setTimeout(() => handleUploadOnly(), 100);
      }
    } else {
      setFileValid(false);
      console.log('[AnalysisForm] No file selected or file selection cancelled');
    }
  };
  
  const handleUploadOnly = async () => {
    if (!fileInputRef.current?.files?.length) {
      setFileError("Please select a file to upload");
      return;
    }
    
    setLoading(true);
    setFileError("");
    setUploadSuccess(false);
    
    try {
      const file = fileInputRef.current.files[0];
      const keyword = document.getElementById('keyword') as HTMLInputElement;
      
      console.log('[AnalysisForm] Starting upload for file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        keyword: keyword.value
      });
      
      if (!keyword || !keyword.value) {
        setFileError("Please enter a product keyword");
        setLoading(false);
        return;
      }
      
      console.log('[AnalysisForm] Calling analysisService.uploadProductData');
      const result = await analysisService.uploadProductData(file, keyword.value);
      console.log('[AnalysisForm] Upload completed successfully:', result);
      setUploadSuccess(true);
    } catch (error) {
      console.error('[AnalysisForm] File upload failed:', error);
      if (error instanceof Error) {
        setFileError(error.message);
      } else {
        setFileError("An unknown error occurred during file upload.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <form id="analysisForm" onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="keyword" className={styles.label}>Keyword</label>
            <input 
              type="text" 
              id="keyword" 
              name="keyword" 
              className={styles.input}
              placeholder="Enter keyword to analyze"
              defaultValue={defaultKeyword}
              required 
            />
            <p className={styles.helpText}>Enter keyword or phrase you want to analyze</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Company Data Upload</label>
            <div className={styles.fileUploadContainer}>
              <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Choose JSON File
              </label>
              <input 
                type="file" 
                id="fileUpload" 
                name="fileUpload" 
                className={styles.fileUploadInput}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
              />
              <span className={styles.fileName}>{fileName}</span>
              
              {(fileName && fileValid) && (
                <button 
                  type="button" 
                  onClick={handleUploadOnly} 
                  className={styles.uploadButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.smallSpinner}></span>
                      Uploading...
                    </>
                  ) : 'Upload Only'}
                </button>
              )}
            </div>
            {fileError && <p className={styles.errorText}>{fileError}</p>}
            {uploadSuccess && <p className={styles.successText}>File uploaded successfully!</p>}
            <p className={styles.helpText}>Upload product inventory data in JSON format</p>
            <div className={styles.jsonSample}>
              <details>
                <summary>Required JSON format</summary>
                <pre>
                  {`{
  "${defaultKeyword}": {
    "Beginning Inventory": 182,
    "COGS": 73857.29,
    "Ending Inventory": 40,
    "Sales": 142,
    "Target Turnover": 1000,
    "id": "INV2025-01-iphone",
    "period": "2025-01"
  }
}`}
                </pre>
              </details>
            </div>
          </div>

          <div className={styles.dateContainer}>
            <div>
              <label htmlFor="startDate" className={styles.label}>Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                className={styles.input}
                defaultValue={defaultStartDate}
                required 
              />
            </div>
            <div>
              <label htmlFor="endDate" className={styles.label}>End Date</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                className={styles.input}
                defaultValue={defaultEndDate}
                required 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="videoCount" className={styles.label}>Number of Videos to Search: {videoCount}</label>
            <input 
              type="range" 
              id="videoCount" 
              name="videoCount" 
              className={styles.rangeInput}
              min="10" 
              max="200" 
              step="10" 
              value={videoCount}
              onChange={(e) => setVideoCount(Number(e.target.value))}
            />
            <p className={styles.helpText}>Set the number of videos to analyze (10-200)</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="commentCount" className={styles.label}>Comments to Fetch per Video: {commentCount}</label>
            <input 
              type="range" 
              id="commentCount" 
              name="commentCount" 
              className={styles.rangeInput}
              min="50" 
              max="500" 
              step="50" 
              value={commentCount}
              onChange={(e) => setCommentCount(Number(e.target.value))}
            />
            <p className={styles.helpText}>Set the number of comments to analyze per video (50-500)</p>
          </div>


          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Processing (2-3 minutes)...
              </>
            ) : 'Start Analysis'}
          </button>
          
          {loading && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                ⏱️ Analysis typically takes 2-3 minutes. You'll be redirected automatically when complete.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}