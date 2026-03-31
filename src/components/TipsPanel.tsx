export default function TipsPanel() {
  const tips = [
    "先明确你真正想解决的是哪一个问题。",
    "不要在同一情绪下高频重复抽牌。",
    "把解读当作参考框架，而不是绝对答案。",
  ];

  return (
    <aside
      style={{
        borderRadius: "28px",
        padding: "24px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.20)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "rgba(245,241,255,0.62)",
          marginBottom: "16px",
        }}
      >
        使用提示
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        {tips.map((tip, index) => (
          <div
            key={tip}
            style={{
              padding: "14px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              lineHeight: 1.8,
              fontSize: "14px",
              color: "rgba(245,241,255,0.76)",
            }}
          >
            <strong style={{ color: "#c4b5fd" }}>0{index + 1}</strong>　{tip}
          </div>
        ))}
      </div>
    </aside>
  );
}