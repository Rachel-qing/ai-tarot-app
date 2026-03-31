const STORAGE_KEY = "tarot-usage-state";

export const COOLDOWN_MS = 10_000;
export const MAX_DAILY_USES = 3;

type UsageState = {
  date: string;
  count: number;
  lastTime: number;
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultState(): UsageState {
  return {
    date: getTodayKey(),
    count: 0,
    lastTime: 0,
  };
}

export function getUsageState(): { count: number; lastTime: number } {
  if (typeof window === "undefined") {
    return { count: 0, lastTime: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { count: 0, lastTime: 0 };
    }

    const parsed = JSON.parse(raw) as Partial<UsageState>;
    const today = getTodayKey();

    if (parsed.date !== today) {
      const resetState = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
      return { count: 0, lastTime: 0 };
    }

    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      lastTime: typeof parsed.lastTime === "number" ? parsed.lastTime : 0,
    };
  } catch {
    return { count: 0, lastTime: 0 };
  }
}

export function setUsageState(count: number, lastTime: number): void {
  if (typeof window === "undefined") return;

  const nextState: UsageState = {
    date: getTodayKey(),
    count,
    lastTime,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function getRemainingCooldown(): number {
  const { lastTime } = getUsageState();

  if (!lastTime) return 0;

  const remainingMs = Math.max(COOLDOWN_MS - (Date.now() - lastTime), 0);
  return Math.ceil(remainingMs / 1000);
}