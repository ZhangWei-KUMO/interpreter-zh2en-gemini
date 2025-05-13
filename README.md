# 中英同声传译 (Chinese-English Simultaneous Interpreter)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Generative AI](https://img.shields.io/badge/Powered%20by-Google%20Gemini-orange?style=flat-square&logo=google)](https://developers.generative-ai.google/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)

基于谷歌 Gemini 模型的中英文同声传译应用，使用 Next.js 构建。

## 功能特点

- 实时中译英和英译中的语音翻译
- 支持音频输入和输出
- 清晰的用户界面设计
- 基于 Google Gemini 2.0 Flash 模型

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Google Generative AI API
- SCSS/SASS 样式
- Zustand 状态管理

## 安装与运行

1. 克隆仓库
   ```
   git clone https://github.com/yourusername/interpreter-zh2en-gemini.git
   cd interpreter-zh2en-gemini
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 配置环境变量
   创建 `.env` 文件并添加 Google AI API 密钥：
   ```
   GOOGLE_API_KEY=your_google_ai_api_key
   ```

APIKEY请仔细去https://aistudio.google.com/申请

4. 运行开发服务器
   ```
   npm run dev
   ```

5. 打开浏览器访问 `http://localhost:3000`

## 使用方法

1. 允许浏览器访问麦克风
2. 开始说话（中文或英文）
3. 系统会自动检测语言并实时翻译
4. 翻译结果会通过AI语音播放

## 部署

构建生产版本：

```
npm run build
npm start
```

### 常见问题

如果构建时遇到以下错误：

```
Error: Event handlers cannot be passed to Client Component props.
  {onClick: function, className: ..., children: ...}
            ^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

这是因为在 Next.js App Router 架构中，默认组件是服务器组件（Server Components），不能包含客户端交互事件如 `onClick`。解决方法：

1. 在需要交互的组件文件顶部添加 `'use client'` 指令，将其转换为客户端组件
2. 确保只在已标记为 `'use client'` 的组件中使用事件处理器

例如：

```tsx
'use client';

import React from 'react';

export default function InteractiveComponent() {
  return <button onClick={() => console.log('clicked')}>点击我</button>;
}
```

## 许可证

基于 MIT 开源 