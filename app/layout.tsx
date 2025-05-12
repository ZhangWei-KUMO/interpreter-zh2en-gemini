import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.scss";

// 初始化字体
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "中英实时翻译 | Gemini 翻译助手",
  description: "使用Gemini进行中英文实时翻译的应用",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${spaceMono.variable}`}>
      <head>
        {/* Material Design 图标 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 