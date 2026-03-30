import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY 未配置");
}

const genAI = new GoogleGenerativeAI(apiKey);

type RateRecord = {
  lastRequestTime: number;
  timestamps: number[];
};

const ipStore = new Map<string, RateRecord>();

const MIN_INTERVAL_MS = 10_000; // 同一 IP 两次请求最少间隔 10 秒
const MAX_REQUESTS_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = ipStore.get(ip) || {
    lastRequestTime: 0,
    timestamps: [],
  };

  if (now - record.lastRequestTime < MIN_INTERVAL_MS) {
    return {
      ok: false,
      error: "请求过于频繁，请稍后再试",
      status: 429,
    };
  }

  const recentTimestamps = record.timestamps.filter(
    (timestamp) => now - timestamp < HOUR_MS
  );

  if (recentTimestamps.length >= MAX_REQUESTS_PER_HOUR) {
    return {
      ok: false,
      error: "当前访问过于频繁，请稍后再试",
      status: 429,
    };
  }

  recentTimestamps.push(now);

  ipStore.set(ip, {
    lastRequestTime: now,
    timestamps: recentTimestamps,
  });

  return { ok: true };
}

export async function POST(req: Request) {
  try {
    if (process.env.PUBLIC_DEMO_ENABLED !== "true") {
      return Response.json(
        { error: "当前演示已关闭" },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);
    const rateLimitResult = checkRateLimit(ip);

    if (!rateLimitResult.ok) {
      return Response.json(
        { error: rateLimitResult.error },
        { status: rateLimitResult.status }
      );
    }

    const body = await req.json();
    const { question, cards } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return Response.json(
        { error: "缺少有效问题" },
        { status: 400 }
      );
    }

    if (question.trim().length > 100) {
      return Response.json(
        { error: "问题长度不能超过 100 字" },
        { status: 400 }
      );
    }

    if (!cards || !Array.isArray(cards) || cards.length !== 3) {
      return Response.json(
        { error: "牌面数据不正确" },
        { status: 400 }
      );
    }

    const cardText = cards
      .map((card: any, index: number) => {
        const meaning =
          card.orientation === "正位" ? card.upright : card.reversed;

        return `${index + 1}. ${card.name}（${card.orientation}）
含义：${meaning}
关键词：${card.keywords.join("、")}
感情建议：${card.advice_love}
事业建议：${card.advice_career}
自我建议：${card.advice_self}`;
      })
      .join("\n\n");


    const prompt = `
你是一位经验丰富的塔罗解读师，风格温和、理性、富有洞察力。

用户的问题是：
${question}

抽到的三张牌如下：
${cardText}

请进行一次完整的塔罗解读，要求：

【整体解读】
- 概括当前状态和趋势
- 语言自然，不要模板化

【逐张分析】
- 分别解释每张牌在当前问题中的意义
- 要结合“正位/逆位”

【行动建议】
- 给出具体、可执行的建议
- 不要空话（比如“保持积极”这种要避免）
- 不要绝对预测未来
- 全文控制在 300~500 字以内

整体风格要求：
- 像一个冷静、聪明、不过度神秘的人
- 不制造焦虑
- 不绝对判断（避免“你一定会…”）
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ result: text });
  } catch (error: any) {
    console.error("gemini error:", error);

    return Response.json(
      {
        error: error?.message || "生成失败",
      },
      { status: 500 }
    );
  }
}