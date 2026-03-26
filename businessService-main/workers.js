// API 代理 Worker
const API_ROUTES = {
  "/api/gemini": "https://backend-529824727138.asia-southeast1.run.app/gemini",
  "/api/sentiment": "https://backend-529824727138.asia-southeast1.run.app/sentiment",
  "/api/trend": "https://backend-529824727138.asia-southeast1.run.app/trend"
};

export default {
  async fetch(request, env) {
    // 设置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // 解析请求 URL
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 查找目标 URL
    const targetUrl = API_ROUTES[path];
    if (!targetUrl) {
      return new Response("Not Found", { 
        status: 404,
        headers: corsHeaders
      });
    }
    
    try {
      // 重要：克隆请求以避免"已使用的请求体"错误
      const clonedRequest = request.clone();
      
      // 处理 POST 请求
      if (request.method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';
        
        // 只处理 JSON 请求
        if (contentType.includes('application/json')) {
          // 从克隆的请求中读取 JSON
          let requestBody;
          try {
            requestBody = await clonedRequest.json();
            console.log("Original request body:", JSON.stringify(requestBody));
            
            // 转换请求体 - 删除可能导致问题的额外字段
            const modifiedBody = {
              product: requestBody.keyword || requestBody.product,
              startDate: requestBody.startDate,
              endDate: requestBody.endDate
              // 删除 prompt 字段，它可能导致 API 错误
            };
            
            console.log("Modified request body:", JSON.stringify(modifiedBody));
            
            // 创建新的请求选项
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
                // 添加任何必要的认证头
              },
              body: JSON.stringify(modifiedBody)
            };
            
            // 发送请求到目标 API
            console.log(`Sending request to ${targetUrl}`);
            const response = await fetch(targetUrl, options);
            console.log(`Response status: ${response.status}`);
            
            // 读取响应数据
            let responseData;
            try {
              responseData = await response.text();
              if (!response.ok) {
                console.log(`API Error: ${response.status} ${response.statusText}`);
                console.log(`Error details: ${responseData}`);
              }
            } catch (e) {
              responseData = `Error reading response: ${e.message}`;
            }
            
            // 返回响应，确保设置正确的CORS头
            return new Response(responseData, {
              status: response.status,
              headers: {
                'Content-Type': 'text/plain',
                ...corsHeaders
              }
            });
          } catch (e) {
            console.error("Error parsing JSON:", e);
            return new Response(JSON.stringify({
              error: "Invalid JSON in request body"
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
        }
      }
      
      // 对于非 POST/JSON 请求，使用简化的处理
      return new Response("Only POST requests with JSON bodies are supported", {
        status: 400,
        headers: corsHeaders
      });
    } catch (error) {
      console.error(`Worker error: ${error.message}`);
      
      // 返回友好的错误消息
      return new Response(JSON.stringify({
        error: "Worker Error",
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};