type QuestionPanelProps = {
  question: string;
  setQuestion: (value: string) => void;
  handleDraw: () => void;
  canDraw: boolean;
  loading: boolean;
  hasCards: boolean;
};

export default function QuestionPanel({
  question,
  setQuestion,
  handleDraw,
  canDraw,
  loading,
  hasCards,
}: QuestionPanelProps) {
  return (
    <div
      style={{
        borderRadius: "28px",
        padding: "28px",
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          marginBottom: "14px",
          fontSize: "14px",
          color: "rgba(245,241,255,0.62)",
        }}
      >
        输入你的问题
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="例如：我该不该换工作？ / 我现在应该主动推进这段关系吗？"
        rows={5}
        style={{
          width: "100%",
          resize: "none",
          boxSizing: "border-box",
          borderRadius: "22px",
          padding: "20px",
          background: "rgba(8, 8, 14, 0.56)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.10)",
          outline: "none",
          fontSize: "16px",
          lineHeight: 1.9,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginTop: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "rgba(245,241,255,0.50)",
          }}
        >
          建议把问题聚焦到一个明确场景，解读会更有参考价值。
        </div>

        <button
          onClick={handleDraw}
          disabled={!canDraw}
          style={{
            border: "none",
            borderRadius: "16px",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: canDraw ? "pointer" : "not-allowed",
            color: "#fff",
            background: canDraw
              ? "linear-gradient(135deg, #9f67ff 0%, #6c63ff 100%)"
              : "rgba(255,255,255,0.12)",
            boxShadow: canDraw ? "0 14px 30px rgba(108,99,255,0.30)" : "none",
            opacity: canDraw ? 1 : 0.72,
          }}
        >
          {loading ? "解读中..." : hasCards ? "重新抽牌" : "开始抽牌"}
        </button>
      </div>
    </div>
  );
}