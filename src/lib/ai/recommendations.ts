import { getDeepSeek, getAiModelName, extractJson } from "./client";

export async function generateRecommendedPositions(
  resumeText: string,
  coreSkills: string[],
  targetCountry: string
): Promise<
  Array<{
    title: string;
    targetRole: string;
    industry: string;
    matchReason: string;
  }>
> {
  const prompt = `You are a senior career development coach (not a recruiter). Based on the candidate's primary resume, skills, and experience level, suggest 5-8 career path roles that logically fit their trajectory.

IMPORTANT: These are CAREER PROGRESSION SUGGESTIONS built from their experience, education, and skills. They are NOT scraped from the internet and should NOT look like job postings. Think "what should this person aim for next in their career" not "what jobs are available right now."

## Candidate Skills:
${coreSkills.join(", ")}

## Target Country (for market context):
${targetCountry}

## Primary Resume Excerpt:
${resumeText.slice(0, 2000)}

## Instructions:
Output a JSON array of career path roles. Each object must have:
- "title": Role title that reflects career level (e.g. "Senior Full-Stack Developer" not "Full-Stack Developer (React/Node)")
- "targetRole": Specific space/domain they'd focus on (e.g. "Cloud-Native Application Engineering")
- "industry": Industry domain where this role is common
- "matchReason": 1 sentence explaining WHY their experience and skills make this a logical career step (e.g. "Your 5 years of backend experience naturally leads to this senior role").

Return ONLY the JSON array, no markdown. Choose realistic, aspirational career titles — not internet job listing titles.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "[]";
  const jsonStr = extractJson(content);
  return JSON.parse(jsonStr);
}

export async function generateRecommendedJDs(
  resumeText: string,
  coreSkills: string[],
  targetPositions: string[],
  targetCountry: string
): Promise<
  Array<{
    title: string;
    company: string;
    rawText: string;
    matchReason: string;
    sourceUrl: string;
  }>
> {
  const prompt = `You are an expert job market analyst and technical recruiter. Based on this candidate's primary resume, target country, and skills, find 4-6 real job roles currently hiring in ${targetCountry} that match 50% to 60% of the candidate's existing background (ideal sweet-spot for growth and achievable target applications).

## Primary Candidate Resume Excerpt:
${resumeText.slice(0, 2500)}

## Target Positions:
${targetPositions.join(", ")}

## Candidate Core Skills:
${coreSkills.join(", ")}

## Target Country:
${targetCountry}

## Instructions:
Output a JSON array of 4-6 active job openings matching 50% to 60% of the candidate's profile. Each object must have:
- "title": Real, specific job posting title (e.g. "Senior Frontend Engineer (React/TypeScript)")
- "company": A real active tech/industry company operating in ${targetCountry}
- "searchQuery": URL-encoded search string for job boards (e.g. "Senior+Frontend+Engineer+remote")
- "matchPct": Integer between 50 and 60 representing exact match score with candidate's primary resume
- "rawText": A realistic 3-4 sentence job description summarizing core tech requirements, responsibilities, and qualifications
- "matchReason": 1 sentence explaining why this job matches 50-60% of their primary resume and what key skills overlap
- "location": City or "Remote" in ${targetCountry}

Return ONLY the JSON array, no markdown.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "[]";
  const jsonStr = extractJson(content);
  let raw: any[] = [];
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    raw = [];
  }

  // Attach real job board search URLs (Indeed, LinkedIn, Glassdoor/Naukrigulf)
  const platforms = targetCountry === "India"
    ? [
        { name: "LinkedIn", url: (q: string, l: string) => `https://www.linkedin.com/jobs/search?keywords=${q}&location=${l}&f_TPR=r1209600` },
        { name: "Indeed", url: (q: string, l: string) => `https://in.indeed.com/jobs?q=${q}&l=${l}&fromage=14` },
      ]
    : targetCountry === "United Arab Emirates"
    ? [
        { name: "LinkedIn", url: (q: string, l: string) => `https://www.linkedin.com/jobs/search?keywords=${q}&location=${l}&f_TPR=r1209600` },
        { name: "Naukrigulf", url: (q: string, l: string) => `https://www.naukrigulf.com/${q.toLowerCase().replace(/\s+/g,"-")}-jobs-in-${l.toLowerCase().replace(/\s+/g,"-")}` },
      ]
    : [
        { name: "LinkedIn", url: (q: string, l: string) => `https://www.linkedin.com/jobs/search?keywords=${q}&location=${l}&f_TPR=r1209600` },
        { name: "Indeed", url: (q: string, l: string) => `https://www.indeed.com/jobs?q=${q}&l=${l}&fromage=14` },
        { name: "Glassdoor", url: (q: string, l: string) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}&sc.location=${l}&fromage=14` },
      ];

  const withSearchQueries = raw.map((job: Record<string, any>) => {
    const query = job.searchQuery || encodeURIComponent(job.title || "");
    const loc = encodeURIComponent(job.location || targetCountry);
    const board = platforms[0]; // Primary: LinkedIn
    const urls = platforms.map(p => ({
      label: p.name,
      url: p.url(query, loc),
    }));
    const matchPct = typeof job.matchPct === "number" ? job.matchPct : 55;

    return {
      title: job.title,
      company: job.company || "Various Employers",
      rawText: job.rawText || "",
      matchReason: `🎯 ${matchPct}% Primary Resume Match — ${job.matchReason || "Aligned with your target positions and core skills."}`,
      sourceUrl: board.url(query, loc),
      applyUrls: urls,
    };
  });

  // Store additional apply URLs in rawText as metadata
  const enriched = withSearchQueries.map((j: Record<string, unknown>) => ({
    ...j,
    rawText: `${j.rawText}\n\n🔗 Apply on: ${(j.applyUrls as Array<{label:string,url:string}>).map((u: {label:string,url:string}) => `${u.label}: ${u.url}`).join(" | ")}`,
  }));

  return enriched.map(({ applyUrls, ...rest }: Record<string, unknown>) => rest) as Array<{
    title: string;
    company: string;
    rawText: string;
    matchReason: string;
    sourceUrl: string;
  }>;
}
