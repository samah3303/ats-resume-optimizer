/**
 * ML ATS Score Predictor
 *
 * Lightweight regression model that predicts ATS scores from resume features
 * without requiring an LLM API call. Improves with more data over time.
 *
 * Features extracted from resume text:
 *   - wordCount, bulletCount, sectionCount
 *   - hasExperience, hasEducation, hasSkills, hasSummary
 *   - keywordDensity (action verbs / total words)
 *   - metricDensity (numbers + % signs / total words)
 *   - avgBulletLength, contactInfoPresent
 *   - experienceYears (estimated from dates)
 *
 * Model: Simple linear regression with feature normalization.
 * Trained on historical analysis data from the database.
 */

interface ResumeFeatures {
  wordCount: number;
  bulletCount: number;
  sectionCount: number;
  hasExperience: number;
  hasEducation: number;
  hasSkills: number;
  hasSummary: number;
  keywordDensity: number;
  metricDensity: number;
  avgBulletLength: number;
  contactInfoPresent: number;
  experienceYears: number;
}

interface TrainedModel {
  weights: number[];
  bias: number;
  featureMeans: number[];
  featureStds: number[];
  trainedAt: string;
  sampleCount: number;
  r2Score: number;
}

// ─── Feature Extraction ─────────────────────────────────────────────────────

const ACTION_VERBS = [
  "developed", "managed", "created", "implemented", "designed", "led", "built",
  "launched", "optimized", "increased", "reduced", "achieved", "delivered",
  "spearheaded", "orchestrated", "automated", "streamlined", "engineered",
  "architected", "deployed", "scaled", "integrated", "transformed", "directed",
];

export function extractFeatures(text: string): ResumeFeatures {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Bullet points
  const bulletCount = (text.match(/[•\-*●○◆◇▪▸►]\s/g) || []).length;

  // Sections
  const sections = ["experience", "education", "skills", "summary", "contact",
    "work history", "employment", "technical skills", "certifications"];
  const sectionCount = sections.filter((s) => lower.includes(s)).length;

  const hasExperience = /experience|work history|employment/i.test(text) ? 1 : 0;
  const hasEducation = /education|university|college|degree/i.test(text) ? 1 : 0;
  const hasSkills = /skills|technical skills|competencies/i.test(text) ? 1 : 0;
  const hasSummary = /summary|profile|objective/i.test(text) ? 1 : 0;

  // Keyword density
  const actionVerbCount = ACTION_VERBS.filter((verb) => {
    const re = new RegExp(`\\b${verb}\\b`, "i");
    return re.test(text);
  }).length;
  const keywordDensity = wordCount > 0 ? actionVerbCount / (wordCount / 100) : 0;

  // Metric density
  const metricMatches = text.match(/\d+%|\$\d+|\d+\s*(users|customers|revenue|team|million|thousand|people|clients|percent)/gi) || [];
  const metricDensity = wordCount > 0 ? metricMatches.length / (wordCount / 100) : 0;

  // Average bullet length (estimate from newline-separated lines)
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  const avgBulletLength = lines.length > 0
    ? lines.reduce((sum, l) => sum + l.length, 0) / lines.length
    : 0;

  // Contact info
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text) ? 1 : 0;
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text) ? 1 : 0;
  const contactInfoPresent = hasEmail && hasPhone ? 1 : 0;

  // Experience years (rough estimate from year patterns)
  const years = text.match(/(20\d{2}|19\d{2})/g) || [];
  const uniqueYears = [...new Set(years.map(Number))];
  const experienceYears = uniqueYears.length >= 2
    ? Math.max(...uniqueYears) - Math.min(...uniqueYears)
    : 0;

  return {
    wordCount: Math.min(wordCount, 2000),
    bulletCount: Math.min(bulletCount, 50),
    sectionCount: Math.min(sectionCount, 10),
    hasExperience,
    hasEducation,
    hasSkills,
    hasSummary,
    keywordDensity: Math.min(keywordDensity, 20),
    metricDensity: Math.min(metricDensity, 10),
    avgBulletLength: Math.min(avgBulletLength, 200),
    contactInfoPresent,
    experienceYears: Math.min(experienceYears, 40),
  };
}

// ─── Model Training ─────────────────────────────────────────────────────────

function normalizeFeatures(
  features: number[],
  means: number[],
  stds: number[]
): number[] {
  return features.map((f, i) => (stds[i] > 0 ? (f - means[i]) / stds[i] : 0));
}

function linearPredict(features: number[], weights: number[], bias: number): number {
  let sum = bias;
  for (let i = 0; i < features.length; i++) {
    sum += features[i] * weights[i];
  }
  return sum;
}

/**
 * Train a linear regression model using gradient descent.
 * Features are expected as an array of [feature1, feature2, ..., score] tuples.
 */
export function trainModel(
  data: Array<{ features: number[]; score: number }>
): TrainedModel {
  const n = data.length;
  const featureCount = data[0]?.features.length || 12;

  // Calculate means and stds for normalization
  const means: number[] = Array(featureCount).fill(0);
  const stds: number[] = Array(featureCount).fill(0);

  for (const row of data) {
    for (let i = 0; i < featureCount; i++) {
      means[i] += row.features[i] / n;
    }
  }

  for (const row of data) {
    for (let i = 0; i < featureCount; i++) {
      stds[i] += Math.pow(row.features[i] - means[i], 2) / n;
    }
  }
  stds.forEach((_, i) => { stds[i] = Math.sqrt(stds[i]) || 1; });

  // Normalize features
  const normalized = data.map((row) => ({
    features: normalizeFeatures(row.features, means, stds),
    score: row.score,
  }));

  // Gradient descent
  let weights = Array(featureCount).fill(0);
  let bias = 0;
  const learningRate = 0.01;
  const epochs = 500;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    let dw = Array(featureCount).fill(0);
    let db = 0;

    for (const row of normalized) {
      const pred = linearPredict(row.features, weights, bias);
      const error = pred - row.score;
      totalLoss += error * error;

      for (let i = 0; i < featureCount; i++) {
        dw[i] += error * row.features[i];
      }
      db += error;
    }

    for (let i = 0; i < featureCount; i++) {
      weights[i] -= (learningRate * dw[i]) / n;
    }
    bias -= (learningRate * db) / n;
  }

  // Calculate R²
  let ssRes = 0;
  let ssTot = 0;
  const meanScore = data.reduce((s, r) => s + r.score, 0) / n;

  for (const row of normalized) {
    const pred = linearPredict(row.features, weights, bias);
    ssRes += Math.pow(row.score - pred, 2);
    ssTot += Math.pow(row.score - meanScore, 2);
  }

  const r2Score = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return {
    weights,
    bias,
    featureMeans: means,
    featureStds: stds,
    trainedAt: new Date().toISOString(),
    sampleCount: n,
    r2Score,
  };
}

// ─── Model Persistence ──────────────────────────────────────────────────────

const FEATURE_NAMES = [
  "wordCount", "bulletCount", "sectionCount", "hasExperience",
  "hasEducation", "hasSkills", "hasSummary", "keywordDensity",
  "metricDensity", "avgBulletLength", "contactInfoPresent", "experienceYears",
];

/**
 * Load training data from existing analyses in the database.
 * Uses the resume's parsedText and the analysis's overallScore.
 */
export async function loadTrainingData(): Promise<
  Array<{ features: number[]; score: number }>
> {
  const { prisma } = await import("@/lib/prisma");

  const analyses = await prisma.analysis.findMany({
    where: {
      overallScore: { not: null },
      resume: { parsedText: { not: "" } },
    },
    include: {
      resume: { select: { parsedText: true } },
    },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const data: Array<{ features: number[]; score: number }> = [];

  for (const a of analyses) {
    if (!a.resume?.parsedText || a.overallScore == null) continue;

    const feats = extractFeatures(a.resume.parsedText);
    data.push({
      features: FEATURE_NAMES.map((name) => (feats as any)[name] as number),
      score: a.overallScore,
    });
  }

  console.log(`[ml-predictor] Loaded ${data.length} training samples`);
  return data;
}

/**
 * Predict an ATS score from extracted features.
 */
export function predictScore(
  features: ResumeFeatures,
  model: TrainedModel
): { score: number; confidence: number; featureImportance: Array<{ name: string; contribution: number }> } {
  const featureArray = FEATURE_NAMES.map((name) => (features as any)[name] as number);
  const normalized = normalizeFeatures(featureArray, model.featureMeans, model.featureStds);

  const rawScore = linearPredict(normalized, model.weights, model.bias);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Feature importance (absolute weight × feature std)
  const importance = FEATURE_NAMES.map((name, i) => ({
    name,
    contribution: Math.abs(model.weights[i] * model.featureStds[i]),
  }));
  importance.sort((a, b) => b.contribution - a.contribution);

  return {
    score,
    confidence: Math.min(0.95, model.r2Score),
    featureImportance: importance.slice(0, 5),
  };
}

/**
 * Get or train the model. Caches in-memory.
 */
let _cachedModel: TrainedModel | null = null;

export async function getModel(): Promise<TrainedModel> {
  if (_cachedModel) return _cachedModel;

  const data = await loadTrainingData();
  if (data.length < 10) {
    // Not enough data — return a heuristic fallback
    console.log("[ml-predictor] Insufficient training data (<10 samples). Using heuristic model.");
    _cachedModel = {
      weights: [0.01, 0.15, 2.0, 8.0, 6.0, 5.0, 3.0, 0.5, 1.2, 0.05, 4.0, 0.3],
      bias: 45,
      featureMeans: Array(12).fill(0),
      featureStds: Array(12).fill(1),
      trainedAt: new Date().toISOString(),
      sampleCount: data.length,
      r2Score: 0.5,
    };
    return _cachedModel;
  }

  _cachedModel = trainModel(data);
  console.log(`[ml-predictor] Model trained on ${data.length} samples | R² = ${_cachedModel.r2Score.toFixed(3)}`);
  return _cachedModel;
}

/**
 * Quick score prediction — loads model automatically.
 */
export async function quickPredict(resumeText: string): Promise<{
  score: number;
  confidence: number;
  topFactors: Array<{ name: string; contribution: number }>;
}> {
  const model = await getModel();
  const features = extractFeatures(resumeText);
  const result = predictScore(features, model);
  return {
    score: result.score,
    confidence: result.confidence,
    topFactors: result.featureImportance,
  };
}
