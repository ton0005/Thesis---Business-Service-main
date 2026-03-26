import { ProductInventoryData, ProductUploadResponse, ParsedFileData } from './types';

// 从环境变量获取产品API的基础URL
const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_PRODUCTS_API_URL;

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
      
      // 解析文件内容
      const parseResult = await this.parseFile(file);
      const fileData = parseResult.data;
      const originalProductName = parseResult.originalProductName;
      
      console.log('[ProductService] File parsed successfully', { 
        fileData,
        originalProductName, 
        formProductName
      });
      
      // 使用文件中的产品名称，而不是表单中的
      const productName = originalProductName;
      
      // 检查API URL是否已定义
      if (!PRODUCTS_API_URL) {
        throw new Error('PRODUCTS_API_URL is not defined in environment variables');
      }
      
      console.log('[ProductService] PRODUCTS_API_URL is defined:', PRODUCTS_API_URL);
      
      // 准备上传的产品数据
      const productData: ProductInventoryData = {
        "Beginning Inventory": fileData.beginningInventory || 0,
        "COGS": fileData.cogs || 0,
        "Ending Inventory": fileData.endingInventory || 0,
        "Sales": fileData.sales || 0,
        "Target Turnover": fileData.targetTurnover || 1000,
        "id": fileData.id || `INV${fileData.period || "2025-01"}-${productName.toLowerCase().replace(/\s+/g, '-')}`,
        "period": fileData.period || "2025-01"
      };
      
      console.log('[ProductService] Prepared product data:', { productData });
      
      // 修改: 直接使用产品数据作为请求体，不再包装在产品名对象中
      const requestBody = productData;
      
      console.log('[ProductService] Prepared request body:', JSON.stringify(requestBody, null, 2));
      
      // 调用API上传产品数据
      const normalizedProductName = productName.toLowerCase().replace(/\s+/g, '-');
      const apiUrl = `${PRODUCTS_API_URL}/${normalizedProductName}`;
      
      console.log('[ProductService] Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody) // 直接发送产品数据，不再嵌套
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
  },
  
  /**
   * 解析上传的文件
   */
  async parseFile(file: File): Promise<{ data: ParsedFileData; originalProductName: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          
          if (typeof result !== 'string') {
            console.error('[ProductService] File read error: result is not string');
            reject(new Error('Failed to read file content'));
            return;
          }
          
          console.log('[ProductService] File content read successfully (first 100 chars):', result.substring(0, 100));
          
          // 尝试解析为JSON
          try {
            const jsonData = JSON.parse(result);
            console.log('[ProductService] JSON parsed successfully:', jsonData);
            
            if (typeof jsonData === 'object' && jsonData !== null) {
              // 检查是否有嵌套的产品数据
              const productKeys = Object.keys(jsonData);
              console.log('[ProductService] Product keys found:', productKeys);
              
              if (productKeys.length > 0) {
                const originalProductName = productKeys[0]; // 保存原始产品名
                const productData = jsonData[originalProductName];
                
                if (!productData) {
                  console.error('[ProductService] Product data not found for key:', productKeys[0]);
                  reject(new Error('Invalid JSON format: product data not found'));
                  return;
                }
                
                console.log('[ProductService] Product data found:', productData);
                
                // 提取产品数据字段
                const parsedData: ParsedFileData = {
                  beginningInventory: productData["Beginning Inventory"] || 0,
                  cogs: productData.COGS || productData["COGS"] || 0,
                  endingInventory: productData["Ending Inventory"] || 0,
                  sales: productData.Sales || 0,
                  targetTurnover: productData["Target Turnover"] || 1000,
                  period: productData.period || "2025-01",
                  id: productData.id
                };
                
                console.log('[ProductService] Parsed data:', parsedData);
                // 返回解析的数据和原始产品名
                resolve({
                  data: parsedData,
                  originalProductName
                });
                return;
              } else {
                // 如果没有嵌套结构，尝试直接获取字段
                console.log('[ProductService] No product keys found, trying direct field access');
                
                const parsedData: ParsedFileData = {
                  beginningInventory: jsonData["Beginning Inventory"] || 0,
                  cogs: jsonData.COGS || jsonData["COGS"] || 0,
                  endingInventory: jsonData["Ending Inventory"] || 0,
                  sales: jsonData.Sales || 0,
                  targetTurnover: jsonData["Target Turnover"] || 1000,
                  period: jsonData.period || "2025-01",
                  id: jsonData.id
                };
                
                console.log('[ProductService] Parsed data (direct):', parsedData);
                resolve({
                  data: parsedData,
                  originalProductName: '' // 无法确定原始产品名
                });
                return;
              }
            }
            
            console.error('[ProductService] Invalid JSON structure:', jsonData);
            reject(new Error('Invalid JSON format: must contain product inventory data'));
          } catch (e) {
            console.error('[ProductService] JSON parse error:', e);
            reject(new Error('Invalid JSON format: ' + (e instanceof Error ? e.message : String(e))));
          }
          
        } catch (error) {
          console.error('[ProductService] File processing error:', error);
          reject(error instanceof Error ? error : new Error('Unknown error parsing file'));
        }
      };
      
      reader.onerror = (e) => {
        console.error('[ProductService] FileReader error:', e);
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
};