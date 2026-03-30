import { ProductUploadResponse } from './types';

// 从环境变量获取产品API的基础URL
const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_PRODUCTS_API_URL;

function buildProductsEndpoint(baseUrl: string, productName: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const baseWithProducts = trimmedBase.endsWith('/products')
    ? trimmedBase
    : `${trimmedBase}/products`;

  return `${baseWithProducts}/${encodeURIComponent(productName)}`;
}

async function validateJsonFile(file: File): Promise<void> {
  const rawText = await file.text();
  const normalizedText = rawText.charCodeAt(0) === 0xFEFF ? rawText.slice(1) : rawText;

  try {
    JSON.parse(normalizedText);
  } catch (error) {
    throw new Error(
      `Uploaded file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 产品数据上传服务
 */
export const productDataService = {
  /**
   * 上传产品数据到服务器
   * @param file 上传的文件
   * @param productName 产品名称
   */
  async uploadProductData(file: File, formProductName: string): Promise<ProductUploadResponse> {
    try {
      console.log('[ProductService] Starting file upload process', { 
        fileName: file.name, 
        formProductName
      });

      // Product name stays in URL path; uploaded JSON goes in multipart body.
      const resolvedProductName = (formProductName || '').trim();

      if (!resolvedProductName) {
        throw new Error('Product name is required to upload inventory data');
      }

      await validateJsonFile(file);
      
      // 检查API URL是否已定义
      if (!PRODUCTS_API_URL) {
        throw new Error('PRODUCTS_API_URL is not defined in environment variables');
      }
      
      console.log('[ProductService] PRODUCTS_API_URL is defined:', PRODUCTS_API_URL);
      
      const apiUrl = buildProductsEndpoint(PRODUCTS_API_URL, resolvedProductName);
      
      console.log('[ProductService] Making API request to:', apiUrl);

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('[ProductService] API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ProductService] API error response:', errorText);
        throw new Error(`Failed to upload product data: ${response.status} ${errorText}`);
      }
      
      const result = await response.json() as ProductUploadResponse;
      console.log('[ProductService] API success response:', result);
      return result;
      
    } catch (error) {
      // 增强错误日志
      console.error('[ProductService] Upload failed with error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      throw error;
    }
  }
};