import type { HistoryRecord } from "@/types/tarot";

type HistoryPanelProps = {
  history: HistoryRecord[];
  onLoadHistory: (record: HistoryRecord) => void;
  onClearHistory: () => void;
};

function formatTime(time: number) {
  return new Date(time).toLocaleString("zh-CN");
}

export default function HistoryPanel({
  history,
  onLoadHistory,
  onClearHistory,
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <section
      style={{
        borderRadius: "30px",
        padding: "28px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            历史记录
          </h2>
          <div
            style={{
              marginTop: "6px",
              fontSize: "14px",
              color: "rgba(245,241,255,0.56)",
            }}
          >
            最多保留最近 10 条，点击即可恢复查看
          </div>
        </div>

        <button
          onClick={onClearHistory}
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "14px",
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
            onClick={() => onLoadHistory(item)}
            style={{
              padding: "20px",
              borderRadius: "22px",
              cursor: "pointer",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(245,241,255,0.50)",
                }}
              >
                第 {history.length - index} 次占卜
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(245,241,255,0.50)",
                }}
              >
                {formatTime(item.time)}
              </div>
            </div>

            <div
              style={{
                fontSize: "18px",
                lineHeight: 1.8,
                marginBottom: "10px",
              }}
            >
              <strong>问题：</strong>
              {item.question}
            </div>

            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.8,
                color: "rgba(245,241,255,0.72)",
                marginBottom: "12px",
              }}
            >
              <strong>牌阵：</strong>
              {item.cards
                .map((card) => `${card.name}（${card.orientation}）`)
                .join("、")}
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                background: "rgba(7,7,12,0.34)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontSize: "14px",
                color: "rgba(245,241,255,0.72)",
                lineHeight: 1.85,
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.result}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}