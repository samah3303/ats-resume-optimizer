import { getDeepSeek, getAiModelName, parseJsonSafely } from './client';
import { embedText, cosineSimilarity } from '@/lib/embeddings';
import { recordAiUsageLog } from './usage';

export interface JobMatchResult {
  matchScore: number;       // 0-100
  matchReasons: string[];   // top 3 reasons why it's a match
  missingSkills: string[];  // skills the job wants but resume lacks
}

/**
 * Fast embedding-based match scoring for bulk job lists
 */
export async function scoreJobsAgainstResume(
  resumeText: string,
  jobs: Array<{ id: string; title: string; description: string }>
): Promise<Map<string, number>> {
  const resumeEmbed = await embedText(resumeText);
  const scores = new Map<string, number>();
  
  for (const job of jobs) {
    const jobEmbed = await embedText(`${job.title} ${job.description}`);
    const similarity = cosineSimilarity(resumeEmbed, jobEmbed);
    // Convert cosine similarity (0-1) to a 0-100 score
    scores.set(job.id, Math.round(Math.min(similarity * 150, 100)));
  }
  
  return scores;
}

/**
 * AI-powered detailed match analysis for a single job
 */
export async function analyzeJobMatch(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  userId?: string
): Promise<JobMatchResult> {
  const ai = getDeepSeek();
  const model = getAiModelName();
  
  const response = await ai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a job matching analyst. Analyze how well a candidate\'s resume matches a job posting. Return JSON only.'
      },
      {
        role: 'user',
        content: `Analyze the match between this resume and job posting.

RESUME:
${resumeText.slice(0, 3000)}

JOB: ${jobTitle}
${jobDescription.slice(0, 2000)}

Return JSON: { "matchScore": <0-100>, "matchReasons": ["reason1", "reason2", "reason3"], "missingSkills": ["skill1", "skill2"] }`
      }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  if (userId) {
    await recordAiUsageLog({
      userId,
      feature: 'job_match',
      model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    });
  }
  
  return parseJsonSafely<JobMatchResult>(content, {
    matchScore: 50,
    matchReasons: ['Unable to analyze match'],
    missingSkills: [],
  });
}

/**
 * Generate optimized search queries from resume text
 */
export async function generateSearchQueries(
  resumeText: string,
  targetRoles?: string
): Promise<string[]> {
  const ai = getDeepSeek();
  const model = getAiModelName();
  
  const response = await ai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You extract job search queries from resumes. Return a JSON array of 5 search query strings.'
      },
      {
        role: 'user',
        content: `Based on this resume, generate 5 effective job search queries that would find matching positions.${targetRoles ? ` Target roles: ${targetRoles}` : ''}

RESUME:
${resumeText.slice(0, 3000)}

Return JSON array of strings: ["query1", "query2", ...]`
      }
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content || '[]';
  return parseJsonSafely<string[]>(content, ['software engineer', 'developer']);
}
