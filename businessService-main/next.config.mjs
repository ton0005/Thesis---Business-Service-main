/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

    // --- 在这里添加 images 配置 ---
  images: {
    domains: [
      // 这是你的 R2 存储桶的公共访问域名
      // 确保它与你图片 URL 中的域名部分完全一致
      'pub-b436254f85684e9e95bebad4567b11ff.r2.dev',
      // 如果将来还需要从其他外部域名加载图片，也可以在这里添加
      // 'example.com',
    ],
  },
  
  // 设置环境变量 - 添加产品API URL
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
    NEXT_PUBLIC_GEMINI_API_URL: process.env.NEXT_PUBLIC_GEMINI_API_URL,
    NEXT_PUBLIC_TREND_API_URL: process.env.NEXT_PUBLIC_TREND_API_URL,
    NEXT_PUBLIC_SENTIMENT_API_URL: process.env.NEXT_PUBLIC_SENTIMENT_API_URL,
    NEXT_PUBLIC_PRODUCTS_API_URL: process.env.NEXT_PUBLIC_PRODUCTS_API_URL
  },
  
  // 根据环境变量决定配置
  ...(process.env.CLOUDFLARE_PAGES === 'true' 
    ? {
        output: 'export', 
        distDir: 'out', 
      }
    : {}
  ),
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;