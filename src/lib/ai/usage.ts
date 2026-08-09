import { prisma } from "@/lib/prisma";

interface RecordAiUsageParams {
  userId?: string;
  feature: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
}

export async function recordAiUsageLog({
  userId,
  feature,
  model = "deepseek-v4",
  promptTokens = 0,
  completionTokens = 0,
}: RecordAiUsageParams) {
  try {
    const totalTokens = promptTokens + completionTokens;
    // DeepSeek Rates: $0.27 / 1M input, $1.10 / 1M output
    const costUSD = (promptTokens * 0.27 + completionTokens * 1.10) / 1000000;
    const costINR = Math.round(costUSD * 83 * 100) / 100;

    await prisma.aiUsageLog.create({
      data: {
        userId,
        feature,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        costUSD,
        costINR,
      },
    });
  } catch (err) {
    console.error("Failed to log AI usage:", err);
  }
}
