import { getDeepSeek, extractJson } from "./deepseek";

export interface AutoFillResult {
  suggestedName: string;
  suggestedTitle: string;
  suggestedSkills: string[];
  suggestedPositions: string[];
  suggestedIndustry: string;
  suggestedCountry: string;
  suggestedJobTypes: string[];
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

const COUNTRY_LOOKUP: Record<string, string> = {
  // Country Dialing Codes
  "+971": "United Arab Emirates",
  "00971": "United Arab Emirates",
  "+966": "Saudi Arabia",
  "00966": "Saudi Arabia",
  "+974": "Qatar",
  "+1": "United States",
  "+44": "United Kingdom",
  "+91": "India",
  "+65": "Singapore",
  "+49": "Germany",
  "+33": "France",
  "+61": "Australia",
  "+353": "Ireland",
  "+31": "Netherlands",
  "+41": "Switzerland",
  "+46": "Sweden",
  "+64": "New Zealand",
  "+81": "Japan",
  "+82": "South Korea",
  "+55": "Brazil",
  "+52": "Mexico",
  "+27": "South Africa",
  "+60": "Malaysia",

  // Major Cities / Regions
  "dubai": "United Arab Emirates",
  "abu dhabi": "United Arab Emirates",
  "sharjah": "United Arab Emirates",
  "uae": "United Arab Emirates",
  "riyadh": "Saudi Arabia",
  "jeddah": "Saudi Arabia",
  "doha": "Qatar",
  "london": "United Kingdom",
  "manchester": "United Kingdom",
  "bangalore": "India",
  "bengaluru": "India",
  "mumbai": "India",
  "delhi": "India",
  "hyderabad": "India",
  "pune": "India",
  "chennai": "India",
  "san francisco": "United States",
  "new york": "United States",
  "seattle": "United States",
  "austin": "United States",
  "los angeles": "United States",
  "chicago": "United States",
  "boston": "United States",
  "toronto": "Canada",
  "vancouver": "Canada",
  "montreal": "Canada",
  "berlin": "Germany",
  "munich": "Germany",
  "frankfurt": "Germany",
  "sydney": "Australia",
  "melbourne": "Australia",
  "paris": "France",
  "amsterdam": "Netherlands",
  "dublin": "Ireland",
  "singapore": "Singapore",
};

function detectCountryFromText(text: string): string {
  const lower = text.toLowerCase();
  
  // 1. Check phone prefixes
  for (const [code, country] of Object.entries(COUNTRY_LOOKUP)) {
    if (code.startsWith("+") || code.startsWith("00")) {
      if (text.includes(code)) return country;
    }
  }

  // 2. Check city and country keywords
  for (const [kw, country] of Object.entries(COUNTRY_LOOKUP)) {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(lower)) {
      return country;
    }
  }

  return "";
}

function detectIndustryFromText(text: string): string {
  const lower = text.toLowerCase();
  if (/react|typescript|javascript|python|software|frontend|backend|full[- ]?stack|developer|engineer|api|database|sql|devops|aws|cloud/i.test(lower)) {
    return "Technology / SaaS";
  }
  if (/finance|accounting|audit|banking|hedge fund|investment|equity|portfolio|cpa|ledger/i.test(lower)) {
    return "Finance / FinTech";
  }
  if (/healthcare|hospital|clinical|patient|nursing|medical|pharma|biotech|doctor/i.test(lower)) {
    return "Healthcare / HealthTech";
  }
  if (/e[- ]?commerce|retail|merchandising|shopify|amazon|store manager|inventory/i.test(lower)) {
    return "E-Commerce / Retail";
  }
  if (/marketing|seo|sem|growth|campaign|social media|content strategy|copywriting|brand/i.test(lower)) {
    return "Media / Entertainment";
  }
  if (/consulting|consultant|strategy|advisory|mckinsey|bcg|bain|deloitte|pwc|kpmg|ey/i.test(lower)) {
    return "Consulting";
  }
  return "Technology / SaaS";
}

export async function autoFillFromResume(
  resumeText: string
): Promise<AutoFillResult> {
  const regexCountry = detectCountryFromText(resumeText);
  const regexIndustry = detectIndustryFromText(resumeText);

  const prompt = `You are an expert resume parser. Extract key candidate details from this resume text. Output ONLY a JSON object (no markdown):

{
  "suggestedName": "<Full name from resume>",
  "suggestedTitle": "<Current or most recent job title>",
  "suggestedSkills": ["skill1", "skill2"],
  "suggestedPositions": ["3-5 realistic target job roles candidate is qualified for based on their experience"],
  "suggestedIndustry": "<Choose matching: Technology / SaaS, Finance / FinTech, Healthcare / HealthTech, E-Commerce / Retail, Education / EdTech, Media / Entertainment, Manufacturing, Energy / Utilities, Consulting, AI / Machine Learning, Cybersecurity, Other>",
  "suggestedCountry": "<Candidate country or location: United States, United Kingdom, United Arab Emirates, Canada, Germany, Australia, India, Singapore, Netherlands, Ireland, Switzerland, Sweden, New Zealand, Japan, South Korea, France, Brazil, Mexico, South Africa, Saudi Arabia, Qatar, Malaysia, Other>"
}

Resume text:
${resumeText.slice(0, 5000)}`;

  let llmData: Partial<AutoFillResult> = {};
  try {
    const response = await getDeepSeek().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonStr = extractJson(content);
    llmData = JSON.parse(jsonStr);
  } catch {
    llmData = {};
  }

  const finalCountry = llmData.suggestedCountry || regexCountry || "United States";
  const finalIndustry = llmData.suggestedIndustry || regexIndustry || "Technology / SaaS";

  return {
    suggestedName: llmData.suggestedName || "",
    suggestedTitle: llmData.suggestedTitle || "",
    suggestedSkills: Array.isArray(llmData.suggestedSkills) ? llmData.suggestedSkills : [],
    suggestedPositions: Array.isArray(llmData.suggestedPositions) && llmData.suggestedPositions.length > 0
      ? llmData.suggestedPositions
      : [llmData.suggestedTitle || "Software Engineer"],
    suggestedIndustry: finalIndustry,
    suggestedCountry: finalCountry,
    suggestedJobTypes: ["Full-time"],
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  };
}
