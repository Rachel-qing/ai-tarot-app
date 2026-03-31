import type { DrawnCard, TarotCard } from "@/types/tarot";

const ORIENTATIONS = ["正位", "逆位"] as const;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function drawCards(cards: TarotCard[], count = 3): DrawnCard[] {
  if (!Array.isArray(cards)) {
    throw new Error("drawCards: cards 必须是数组");
  }

  if (cards.length < count) {
    throw new Error(`drawCards: 牌库数量不足，至少需要 ${count} 张`);
  }

  return shuffle(cards)
    .slice(0, count)
    .map((card) => ({
      ...card,
      orientation:
        ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)],
    }));
}