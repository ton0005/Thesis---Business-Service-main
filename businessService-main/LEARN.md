# Tailwind CSS 配置问题解决方案

## 问题描述

在 Next.js 15.3.0 项目中，Tailwind CSS 无法正常工作，出现以下错误：
./src/app/globals.css
Module not found: Can't resolve 'tailwindcss'

https://nextjs.org/docs/messages/module-not-found

## 原因分析

- **依赖版本冲突**：项目同时安装了 tailwindcss 和 @tailwindcss/postcss，导致冲突
- **Tailwind CSS v4 语法与 v3 不兼容**：项目使用了 v3 的指令语法，但安装了 v4 的包
- **PostCSS 配置错误**：v4 需要使用 @tailwindcss/postcss 作为插件，而不是 tailwindcss

## 查看当前配置

### package.json

```json
{
  "dependencies": {
    "chart.js": "^4.4.8",
    "flatpickr": "^4.6.13",
    "next": "15.3.0",
    "react": "^19.0.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.0.0",
    "react-flatpickr": "^4.0.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.1.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.3.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

### postcss.config.mjs

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        }
      },
    },
  },
  plugins: [],
}
```

## 解决方案

### 方案1：降级到 Tailwind CSS v3（推荐）

1. 卸载冲突的包
2. 安装 Tailwind CSS v3
3. 保持 postcss.config.mjs 配置
4. 保持 globals.css 现有语法
5. 清除缓存并重启

### 方案2：正确配置 Tailwind CSS v4

1. 确保安装正确的包
2. 修改 postcss.config.mjs
3. 修改 globals.css 使用v4语法

## VS Code 编辑器警告解决

若编辑器显示 @tailwind 为未知指令的警告，可通过以下方式解决：

1. 安装 Tailwind CSS IntelliSense 扩展
2. 添加 VS Code 设置
3. 创建或编辑 .vscode/settings.json：

## 常见问题

### 为什么同时安装两个版本会冲突？

- Tailwind CSS v4 将 PostCSS 插件移至单独的包 @tailwindcss/postcss
- v3 使用自身的 tailwindcss 包作为 PostCSS 插件

### 如何判断 Tailwind CSS 是否正常工作？

- 检查编译后的 CSS 文件是否包含 Tailwind 类
- 查看页面元素是否正确应用了 Tailwind 样式

### Next.js 15.3.0 与哪个版本的 Tailwind 更兼容？

- Tailwind CSS v3 与 Next.js 15.3.0 兼容性更好
- v4 仍在发展中，可能存在兼容性问题

## 参考文档

- Tailwind CSS 官方文档
- Next.js 与 Tailwind CSS 集成
- 从 Tailwind CSS v3 迁移到 v4