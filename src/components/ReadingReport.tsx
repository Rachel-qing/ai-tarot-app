type ReadingReportProps = {
  aiReading: string;
};

export default function ReadingReport({ aiReading }: ReadingReportProps) {
  if (!aiReading) return null;

  return (
    <section
      style={{
        marginBottom: "44px",
        borderRadius: "30px",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
      }}
    >
      <div
        style={{
          padding: "22px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(245,241,255,0.46)",
              marginBottom: "6px",
            }}
          >
            INTERPRETATION REPORT
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            AI 解读结果
          </h2>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            background: "rgba(196,181,253,0.10)",
            border: "1px solid rgba(196,181,253,0.18)",
            color: "#ddd6fe",
          }}
        >
          基于当前问题与三张牌阵生成
        </div>
      </div>

      <div
        style={{
          padding: "28px 24px 30px",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderRadius: "22px",
            background: "rgba(7,7,12,0.38)",
            border: "1px solid rgba(255,255,255,0.07)",
            whiteSpace: "pre-wrap",
            lineHeight: 2,
            fontSize: "17px",
            color: "rgba(255,255,255,0.90)",
          }}
        >
          {aiReading}
        </div>
      </div>
    </section>
  );
}