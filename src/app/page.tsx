"use client";

import { useEffect, useMemo, useState } from "react";
import tarot from "../data/tarot.json";
import { drawCards } from "@/lib/tarot";
import {
  COOLDOWN_MS,
  MAX_DAILY_USES,
  getRemainingCooldown,
  getUsageState,
  setUsageState,
} from "@/lib/usage";
import type { DrawnCard, HistoryRecord, TarotCard } from "@/types/tarot";

function formatTime(time: number) {
  return new Date(time).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type GlassCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function GlassCard({ children, style }: GlassCardProps) {
  return (
    <section
      style={{
        borderRadius: 28,
        background: "rgba(255,255,255,0.56)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.8) inset, 0 24px 80px rgba(15,23,42,0.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function HeroStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <GlassCard style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 13,
          color: "rgba(15,23,42,0.55)",
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 44,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "#0f172a",
          marginBottom: 12,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "rgba(15,23,42,0.62)",
        }}
      >
        {hint}
      </div>
    </GlassCard>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(15,23,42,0.08)",
        color: "rgba(15,23,42,0.72)",
        fontSize: 13,
      }}
    >
      {text}
    </span>
  );
}

function ReadingCard({
  card,
  index,
}: {
  card: DrawnCard;
  index: number;
}) {
  const positions = [
    { title: "现状", desc: "你正在经历的真实处境" },
    { title: "阻力", desc: "正在拖住判断的关键因素" },
    { title: "方向", desc: "更值得尝试的下一步" },
  ];

  const current = positions[index];

  return (
    <GlassCard
      style={{
        padding: 24,
        minHeight: 320,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            card.orientation === "正位"
              ? "radial-gradient(circle, rgba(59,130,246,0.16), transparent 70%)"
              : "radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(15,23,42,0.45)",
              marginBottom: 8,
              letterSpacing: "0.08em",
            }}
          >
            POSITION 0{index + 1}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 650,
              color: "#0f172a",
              marginBottom: 8,
              letterSpacing: "-0.03em",
            }}
          >
            {current.title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(15,23,42,0.58)",
              lineHeight: 1.7,
            }}
          >
            {current.desc}
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background:
              card.orientation === "正位"
                ? "rgba(59,130,246,0.1)"
                : "rgba(168,85,247,0.1)",
            color: card.orientation === "正位" ? "#2563eb" : "#9333ea",
            fontSize: 12,
            border:
              card.orientation === "正位"
                ? "1px solid rgba(59,130,246,0.16)"
                : "1px solid rgba(168,85,247,0.16)",
          }}
        >
          {card.orientation}
        </div>
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 14,
          letterSpacing: "-0.04em",
        }}
      >
        {card.name}
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.85,
          color: "rgba(15,23,42,0.72)",
          marginBottom: 18,
        }}
      >
        {card.orientation === "正位" ? card.upright : card.reversed}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {card.keywords.map((keyword) => (
          <Chip key={keyword} text={keyword} />
        ))}
      </div>
    </GlassCard>
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [aiReading, setAiReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [remainingCount, setRemainingCount] = useState(MAX_DAILY_USES);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tarot-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }

    const usage = getUsageState();
    setRemainingCount(Math.max(0, MAX_DAILY_USES - usage.count));
    setCooldownLeft(getRemainingCooldown());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldownLeft(getRemainingCooldown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const refreshRemainingCount = () => {
    const usage = getUsageState();
    setRemainingCount(Math.max(0, MAX_DAILY_USES - usage.count));
  };

  const canDraw = useMemo(() => {
    return !loading && remainingCount > 0 && cooldownLeft === 0;
  }, [loading, remainingCount, cooldownLeft]);

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
        setCooldownLeft(COOLDOWN_MS / 1000);

        const newRecord: HistoryRecord = {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("tarot-history");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 34%, #f8fafc 100%)",
        color: "#0f172a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 34%), radial-gradient(circle at 85% 20%, rgba(168,85,247,0.10), transparent 24%), radial-gradient(circle at 50% 100%, rgba(14,165,233,0.08), transparent 28%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <GlassCard style={{ padding: 28, marginBottom: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
              gap: 20,
            }}
          >
            <div style={{ padding: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.86)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  color: "rgba(15,23,42,0.72)",
                  fontSize: 13,
                  marginBottom: 24,
                }}
              >
                AI Tarot · Quiet Intelligence
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(56px, 8vw, 84px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.07em",
                  color: "#020617",
                  fontWeight: 750,
                }}
              >
                灵塔纪
              </h1>

              <p
                style={{
                  margin: "22px 0 0",
                  maxWidth: 740,
                  fontSize: 22,
                  lineHeight: 1.8,
                  color: "rgba(15,23,42,0.72)",
                  letterSpacing: "-0.02em",
                }}
              >
                把模糊情绪转成可理解的结构，把随机意象变成有方向感的思考。它不替你做决定，但能帮你更快看见现状、阻力与下一步。
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 26,
                }}
              >
                <Chip text="冷静、克制、不神化" />
                <Chip text="三张牌阵 × AI 分析" />
                <Chip text="更像思考工具，而不是算命机器" />
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <HeroStat
                label="今日剩余次数"
                value={remainingCount}
                hint={`免费版每日上限 ${MAX_DAILY_USES} 次`}
              />
              <HeroStat
                label="当前冷却状态"
                value={cooldownLeft > 0 ? `${cooldownLeft}s` : "可立即抽牌"}
                hint={`每次操作需间隔 ${COOLDOWN_MS / 1000} 秒`}
              />
            </div>
          </div>
        </GlassCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: 20,
            alignItems: "start",
            marginBottom: 22,
          }}
        >
          <GlassCard style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(15,23,42,0.58)",
                marginBottom: 14,
              }}
            >
              输入你的问题
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：我该不该换工作？ / 我现在应该主动推进这段关系吗？"
              rows={6}
              style={{
                width: "100%",
                resize: "none",
                boxSizing: "border-box",
                borderRadius: 24,
                padding: 22,
                background: "rgba(255,255,255,0.82)",
                color: "#0f172a",
                border: "1px solid rgba(15,23,42,0.08)",
                outline: "none",
                fontSize: 17,
                lineHeight: 1.9,
                boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(15,23,42,0.48)",
                  lineHeight: 1.7,
                }}
              >
                问题越具体，解读越有参考价值。尽量只聚焦一个场景。
              </div>

              <button
                onClick={handleDraw}
                disabled={!canDraw}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "15px 24px",
                  minWidth: 144,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canDraw ? "pointer" : "not-allowed",
                  color: "#fff",
                  background: canDraw
                    ? "linear-gradient(135deg, #111827 0%, #334155 100%)"
                    : "rgba(148,163,184,0.5)",
                  boxShadow: canDraw
                    ? "0 14px 32px rgba(15,23,42,0.18)"
                    : "none",
                  opacity: canDraw ? 1 : 0.72,
                }}
              >
                {loading ? "正在生成" : cards.length > 0 ? "重新抽牌" : "开始抽牌"}
              </button>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(15,23,42,0.56)",
                marginBottom: 14,
              }}
            >
              使用提示
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                "先定义你真正想解决的是哪一个问题。",
                "不要在同一情绪里高频重复抽牌。",
                "把结果当作参考框架，而不是绝对答案。",
              ].map((tip, index) => (
                <div
                  key={tip}
                  style={{
                    padding: 16,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "rgba(15,23,42,0.74)",
                  }}
                >
                  <strong
                    style={{
                      display: "inline-block",
                      width: 30,
                      color: "#334155",
                    }}
                  >
                    0{index + 1}
                  </strong>
                  {tip}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {question && (
          <GlassCard style={{ padding: 22, marginBottom: 22 }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(15,23,42,0.48)",
                marginBottom: 8,
                letterSpacing: "0.06em",
              }}
            >
              CURRENT QUESTION
            </div>
            <div
              style={{
                fontSize: 20,
                lineHeight: 1.9,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              {question}
            </div>
          </GlassCard>
        )}

        {cards.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(15,23,42,0.45)",
                    marginBottom: 8,
                    letterSpacing: "0.08em",
                  }}
                >
                  CARD SPREAD
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 34,
                    color: "#020617",
                    letterSpacing: "-0.04em",
                  }}
                >
                  三张牌阵
                </h2>
              </div>
              <div style={{ color: "rgba(15,23,42,0.55)", fontSize: 14 }}>
                用三个切面拆开你现在的问题结构
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {cards.map((card, index) => (
                <ReadingCard key={`${card.name}-${index}`} card={card} index={index} />
              ))}
            </div>
          </section>
        )}

        {loading && (
          <GlassCard style={{ padding: 24, marginBottom: 24 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#020617",
                  letterSpacing: "-0.03em",
                }}
              >
                正在生成解读
              </div>
              <div
                style={{
                  color: "rgba(15,23,42,0.64)",
                  lineHeight: 1.8,
                  fontSize: 15,
                }}
              >
                正在结合你的问题、三张牌的正逆位与关键词，组织更克制、更具体的结构化分析。
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
                {[78, 92, 64].map((width, index) => (
                  <div
                    key={index}
                    style={{
                      height: 14,
                      width: `${width}%`,
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg, rgba(226,232,240,0.92), rgba(241,245,249,0.92))",
                    }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {aiReading && (
          <GlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
            <div
              style={{
                padding: 22,
                borderBottom: "1px solid rgba(15,23,42,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(15,23,42,0.46)",
                    marginBottom: 6,
                    letterSpacing: "0.08em",
                  }}
                >
                  INTERPRETATION REPORT
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 34,
                    color: "#020617",
                    letterSpacing: "-0.04em",
                  }}
                >
                  AI 解读结果
                </h2>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiReading);
                  setCopied(true);
                }}
                style={{
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(255,255,255,0.8)",
                  color: "#0f172a",
                  padding: "11px 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {copied ? "已复制" : "复制结果"}
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(15,23,42,0.06)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 2,
                  fontSize: 17,
                  color: "rgba(15,23,42,0.82)",
                }}
              >
                {aiReading}
              </div>
            </div>
          </GlassCard>
        )}

        {history.length > 0 && (
          <GlassCard style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(15,23,42,0.46)",
                    marginBottom: 8,
                    letterSpacing: "0.08em",
                  }}
                >
                  HISTORY
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 32,
                    color: "#020617",
                    letterSpacing: "-0.04em",
                  }}
                >
                  最近记录
                </h2>
              </div>

              <button
                onClick={handleClearHistory}
                style={{
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(255,255,255,0.8)",
                  color: "#0f172a",
                  padding: "11px 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                清空历史
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {history.map((item) => (
                <button
                  key={item.time}
                  onClick={() => handleLoadHistory(item)}
                  style={{
                    textAlign: "left",
                    padding: 20,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                      color: "rgba(15,23,42,0.5)",
                      fontSize: 13,
                    }}
                  >
                    <span>{formatTime(item.time)}</span>
                    <span>
                      {item.cards
                        .map((card) => `${card.name}（${card.orientation}）`)
                        .join("、")}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      color: "#0f172a",
                      lineHeight: 1.75,
                      marginBottom: 10,
                    }}
                  >
                    {item.question}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(15,23,42,0.64)",
                      lineHeight: 1.8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.result}
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
