import type { DrawnCard } from "@/types/tarot";

const cardPositions = [
  {
    title: "现状",
    desc: "你当下最核心的状态与处境。",
  },
  {
    title: "阻力",
    desc: "正在影响判断或推进的关键因素。",
  },
  {
    title: "方向",
    desc: "接下来更值得尝试的行动路径。",
  },
];

type CardSpreadProps = {
  cards: DrawnCard[];
};

export default function CardSpread({ cards }: CardSpreadProps) {
  if (cards.length === 0) return null;

  return (
    <section style={{ marginBottom: "34px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: "16px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            三张牌阵
          </h2>
          <div
            style={{
              marginTop: "6px",
              fontSize: "14px",
              color: "rgba(245,241,255,0.58)",
            }}
          >
            用三个切面拆开你现在的问题结构
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "18px",
        }}
      >
        {cards.map((card, index) => {
          const position = cardPositions[index];

          return (
            <div
              key={index}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "28px",
                padding: "22px",
                minHeight: "320px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background:
                    card.orientation === "正位"
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(244,114,182,0.10)",
                  filter: "blur(24px)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "18px",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(245,241,255,0.46)",
                      marginBottom: "8px",
                    }}
                  >
                    Position 0{index + 1}
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    {position.title}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(245,241,255,0.56)",
                      lineHeight: 1.7,
                    }}
                  >
                    {position.desc}
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    background:
                      card.orientation === "正位"
                        ? "rgba(34,197,94,0.14)"
                        : "rgba(244,114,182,0.14)",
                    color: card.orientation === "正位" ? "#86efac" : "#f9a8d4",
                    border:
                      card.orientation === "正位"
                        ? "1px solid rgba(34,197,94,0.25)"
                        : "1px solid rgba(244,114,182,0.25)",
                  }}
                >
                  {card.orientation}
                </div>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "22px",
                  background: "rgba(7,7,12,0.40)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    marginBottom: "10px",
                  }}
                >
                  {card.name}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.85,
                    color: "rgba(245,241,255,0.82)",
                  }}
                >
                  {card.orientation === "正位" ? card.upright : card.reversed}
                </div>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(245,241,255,0.50)",
                  marginBottom: "8px",
                }}
              >
                关键词
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {card.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      fontSize: "13px",
                      color: "#ece7ff",
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}