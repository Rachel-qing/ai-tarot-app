import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY 未配置");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, cards } = body;

    if (!question || !cards || cards.length === 0) {
      return Response.json(
        { error: "缺少问题或牌面数据" },
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