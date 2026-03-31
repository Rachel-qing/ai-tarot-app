export type Orientation = "正位" | "逆位";

export type TarotCard = {
  name: string;
  upright: string;
  reversed: string;
  keywords: string[];
  advice_love: string;
  advice_career: string;
  advice_self: string;
};

export type DrawnCard = TarotCard & {
  orientation: Orientation;
};

export type HistoryRecord = {
  question: string;
  cards: DrawnCard[];
  result: string;
  time: number;
};