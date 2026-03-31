import type { Metadata, Viewport } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "🔮灵塔纪 | AI 塔罗解读与结构化思考",
  description:
    "通过三张塔罗牌与 AI 分析，帮助你梳理关系、决策与情绪，在不确定中获得更清晰的行动方向。",
  keywords: [
    "AI塔罗",
    "塔罗解读",
    "结构化思考",
    "决策分析",
    "灵塔纪",
    "AI tarot",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#050505",
          color: "#ececec",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  );
}