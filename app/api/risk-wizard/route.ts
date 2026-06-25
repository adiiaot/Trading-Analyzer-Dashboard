import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const prompt = `You are a professional forex trading coach. A trader is setting up their risk management plan. They answered these questions:

${answers.map((a: any, i: number) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join("\n\n")}

Based on these answers, provide:
1. An ideal position sizing strategy
2. Risk per trade recommendation (%)
3. Stop loss strategy (pips)
4. Daily profit target recommendation
5. Daily loss limit
6. Maximum concurrent trades
7. Account management rules
8. Recommended R/R ratio minimum
9. Evaluation of whether their expectations are realistic
10. Specific XAU/USD trading recommendations given their profile

Format as a clear, actionable trading plan. Be specific with numbers.`;

    const apiKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        plan: "AI wizard unavailable in demo mode. Using standard conservative settings: 1.5% risk per trade, 20 pip stop loss, 1:2 R/R minimum, max 3 concurrent trades, 5% max daily drawdown.",
      });
    }

    const response = await fetch(
      "https://ai.api.nvidia.com/v1/llm/nvidia/nemotron-4-340b-instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a professional forex trading coach. Return concise, structured, specific trading plans.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 800,
          top_p: 0.7,
        }),
      }
    );

    if (!response.ok) throw new Error(`NVIDIA API error: ${response.status}`);

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ success: true, plan: text });
  } catch {
    return NextResponse.json({
      success: true,
      plan: "AI temporarily unavailable. Here's a standard plan: Risk 1.5% per trade ($75 on $5k), 20 pip SL, target 1:2 R/R, max 3 trades concurrent, 5% daily loss cap.",
    });
  }
}
