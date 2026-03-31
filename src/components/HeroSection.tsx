type HeroSectionProps = {
  remainingCount: number;
  cooldownLeft: number;
  maxDailyUses: number;
  cooldownMs: number;
};

export default function HeroSection({
  remainingCount,
  cooldownLeft,
  maxDailyUses,
  cooldownMs,
}: HeroSectionProps) {
  return (
    <section
      style={{
        borderRadius: "32px",
        padding: "34px",
        marginBottom: "24px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(196,181,253,0.10)",
              border: "1px solid rgba(196,181,253,0.18)",
              color: "#ddd6fe",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            AI Tarot · Structured Insight
          </div>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "60px",
              lineHeight: 1.02,
              letterSpacing: "-1.5px",
            }}
          >
            灵塔纪
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "720px",
              fontSize: "18px",
              lineHeight: 1.9,
              color: "rgba(245,241,255,0.78)",
            }}
          >
            让随机意象打破思维惯性，再用 AI
            帮你梳理现状、阻力与方向。它不会替你做决定，但会把模糊情绪，转成更清晰的结构化思考。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            style={{
              borderRadius: "24px",
              padding: "20px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "rgba(245,241,255,0.60)",
                marginBottom: "8px",
              }}
            >
              今日剩余次数
            </div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              {remainingCount}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(245,241,255,0.64)",
                lineHeight: 1.7,
              }}
            >
              免费版每日上限 {maxDailyUses} 次
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "20px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "rgba(245,241,255,0.60)",
                marginBottom: "8px",
              }}
            >
              当前冷却状态
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              {cooldownLeft > 0 ? `${cooldownLeft}s` : "可立即抽牌"}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(245,241,255,0.64)",
                lineHeight: 1.7,
              }}
            >
              每次操作需间隔 {cooldownMs / 1000} 秒
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}