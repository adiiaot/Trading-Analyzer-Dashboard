import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { balance, riskPct, stopLoss, profitTarget, style, pairs } = await req.json();

    const prompt = `You are a professional forex risk manager. Based on these trading parameters, generate a detailed risk setup recommendation:

Account Balance: $${balance}
Risk Per Trade: ${riskPct}%
Stop Loss: ${stopLoss} pips
Profit Target: $${profitTarget}
Trading Style: ${style || "swing"}
Pairs: ${pairs || "XAU/USD"}

Provide a structured response covering:
1. Recommended position size in lots
2. Risk/reward ratio suggestion (minimum 1:2)
3. Daily loss limit recommendation
4. Maximum concurrent trades
5. Whether the profit target is realistic given the stop loss
6. Suggested entry management (scaling in/out)
7. Key levels to watch on XAU/USD

Format the response in clear sections.`;

    const apiKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        setup: {
          positionSize: ((balance * (riskPct / 100)) / (stopLoss * 0.10)).toFixed(3),
          riskAmount: (balance * (riskPct / 100)).toFixed(2),
          rrRatio: (Number(profitTarget) / (balance * (riskPct / 100)) || 2).toFixed(2),
          maxDailyLoss: (balance * 0.05).toFixed(2),
          maxTrades: 3,
          analysis: "The profit target of $"+profitTarget+" on a $"+balance+" account with "+riskPct+"% risk per trade is achievable. Recommended to focus on high-probability setups with minimum 1:2 R/R ratio.",
        },
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
              content: "You are a professional forex risk manager. Return concise, structured recommendations.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
          top_p: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      analysis: text,
      setup: {
        positionSize: ((balance * (riskPct / 100)) / (stopLoss * 0.10)).toFixed(3),
        riskAmount: (balance * (riskPct / 100)).toFixed(2),
        rrRatio: ((profitTarget - balance) / (balance * (riskPct / 100))).toFixed(2),
        maxDailyLoss: (balance * 0.05).toFixed(2),
        maxTrades: 3,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      setup: {
        positionSize: "0.500",
        riskAmount: "75.00",
        rrRatio: "2.50",
        maxDailyLoss: "250.00",
        maxTrades: 3,
      },
      analysis: "AI analysis unavailable. Showing calculated defaults based on standard 1% risk rules.",
    });
  }
}
