"use client";

import { useEffect, useState } from "react";
import tarot from "../data/tarot.json";

type TarotCard = {
  name: string;
  upright: string;
  reversed: string;
  keywords: string[];
  advice_love: string;
  advice_career: string;
  advice_self: string;
};

type DrawnCard = TarotCard & {
  orientation: "正位" | "逆位";
};

type HistoryRecord = {
  question: string;
  cards: DrawnCard[];
  result: string;
  time: number;
};

const MAX_DAILY_USES = 3;
const COOLDOWN_MS = 8000;

function drawCards(cards: TarotCard[]): DrawnCard[] {
  const shuffled = [...cards].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((card) => ({
    ...card,
    orientation: Math.random() > 0.5 ? "正位" : "逆位",
  }));
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getUsageState() {
  if (typeof window === "undefined") {
    return { date: "", count: 0, lastTime: 0 };
  }

  const raw = localStorage.getItem("tarot-usage");
  if (!raw) {
    return { date: getTodayKey(), count: 0, lastTime: 0 };
  }

  try {
    const parsed = JSON.parse(raw);
    const today = getTodayKey();

    if (parsed.date !== today) {
      return { date: today, count: 0, lastTime: 0 };
    }

    return {
      date: parsed.date || today,
      count: Number(parsed.count || 0),
      lastTime: Number(parsed.lastTime || 0),
    };
  } catch {
    return { date: getTodayKey(), count: 0, lastTime: 0 };
  }
}

function setUsageState(count: number, lastTime: number) {
  localStorage.setItem(
    "tarot-usage",
    JSON.stringify({
      date: getTodayKey(),
      count,
      lastTime,
    })
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [aiReading, setAiReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [remainingCount, setRemainingCount] = useState(MAX_DAILY_USES);

  useEffect(() => {
    const saved = localStorage.getItem("tarot-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }

    const usage = getUsageState();
    setRemainingCount(Math.max(0, MAX_DAILY_USES - usage.count));
  }, []);

  const refreshRemainingCount = () => {
    const usage = getUsageState();
    setRemainingCount(Math.max(0, MAX_DAILY_USES - usage.count));
  };

  const handleDraw = async () => {
    if (loading) return;

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setAiReading("请先输入你的问题，再开始抽牌。");
      return;
    }

    if (trimmedQuestion.length > 100) {
      setAiReading("问题请尽量控制在 100 字以内。");
      return;
    }

    const usage = getUsageState();
    const now = Date.now();

    if (usage.count >= MAX_DAILY_USES) {
      setAiReading("免费版今日体验次数已用完，请明天再来。");
      refreshRemainingCount();
      return;
    }

    const remainingCooldown = COOLDOWN_MS - (now - usage.lastTime);
    if (remainingCooldown > 0) {
      setAiReading(`操作过于频繁，请 ${Math.ceil(remainingCooldown / 1000)} 秒后再试。`);
      return;
    }

    const result = drawCards(tarot as TarotCard[]);
    setCards(result);
    setLoading(true);
    setAiReading("");

    try {
      const res = await fetch("/api/tarot_reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          cards: result,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiReading(data.error || `请求失败（${res.status}）`);
        return;
      }

      if (data.result) {
        setAiReading(data.result);

        setUsageState(usage.count + 1, now);
        refreshRemainingCount();

        const newRecord = {
          question: trimmedQuestion,
          cards: result,
          result: data.result,
          time: Date.now(),
        };

        setHistory((prev) => {
          const updated = [newRecord, ...prev].slice(0, 10);
          localStorage.setItem("tarot-history", JSON.stringify(updated));
          return updated;
        });
      } else {
        setAiReading("接口已返回，但没有生成 result 字段。");
      }
    } catch (error) {
      setAiReading("请求失败，请检查接口或网络。");
      console.error("fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (record: HistoryRecord) => {
    setQuestion(record.question);
    setCards(record.cards);
    setAiReading(record.result);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("tarot-history");
  };

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>灵塔纪</h1>
      <p style={{ fontSize: "18px", color: "#555", marginBottom: "12px" }}>
        输入你现在最想问的问题，然后抽三张牌。
      </p>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "32px" }}>
        免费版每日可体验 {MAX_DAILY_USES} 次，当前剩余 {remainingCount} 次；每次操作需间隔{" "}
        {COOLDOWN_MS / 1000} 秒。
      </p>

      <div style={{ marginBottom: "24px" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：我该不该换工作？"
          rows={4}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleDraw}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#666" : "#111",
          color: "#fff",
          border: "none",
          padding: "14px 24px",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "32px",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "解读中..." : cards.length > 0 ? "重新抽牌" : "开始抽牌"}
      </button>

      {question && (
        <div style={{ marginBottom: "24px", color: "#333" }}>
          <strong>你的问题：</strong>
          {question}
        </div>
      )}

      {cards.length > 0 && (
        <div>
          <h2 style={{ marginBottom: "20px" }}>抽牌结果</h2>

          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "28px", marginBottom: "12px" }}>
                {card.name}（{card.orientation}）
              </h3>

              <p style={{ marginBottom: "10px", fontSize: "18px" }}>
                <strong>含义：</strong>
                {card.orientation === "正位" ? card.upright : card.reversed}
              </p>

              <p style={{ fontSize: "18px" }}>
                <strong>关键词：</strong>
                {card.keywords.join("、")}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: "40px" }}>
          <h2>正在解读中...</h2>
          <p style={{ color: "#666" }}>正在为你解析牌面，请稍候</p>
        </div>
      )}

      {aiReading && (
        <div style={{ marginTop: "40px" }}>
          <h2>AI解读结果</h2>
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              fontSize: "17px",
              color: "#222",
            }}
          >
            {aiReading}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "56px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>历史记录</h2>
            <button
              onClick={handleClearHistory}
              style={{
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              清空历史
            </button>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {history.map((item, index) => (
              <div
                key={item.time}
                onClick={() => handleLoadHistory(item)}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "16px",
                  padding: "18px",
                  cursor: "pointer",
                  backgroundColor: "#fafafa",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  第 {history.length - index} 次占卜 ·{" "}
                  {new Date(item.time).toLocaleString("zh-CN")}
                </div>

                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "17px",
                    color: "#222",
                  }}
                >
                  <strong>问题：</strong>
                  {item.question}
                </div>

                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "15px",
                    color: "#444",
                  }}
                >
                  <strong>牌面：</strong>
                  {item.cards
                    .map((card) => `${card.name}（${card.orientation}）`)
                    .join("、")}
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    color: "#555",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.result}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#888",
                  }}
                >
                  点击查看这次解读
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}