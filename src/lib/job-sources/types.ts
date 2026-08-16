export interface JobListing {
  id: string;               // unique ID from source
  source: string;            // 'adzuna' | 'remotive' | 'arbeitnow'
  title: string;
  company: string;
  location: string;
  salary?: string;           // formatted salary string
  salaryMin?: number;
  salaryMax?: number;
  description: string;       // full text description
  descriptionSnippet: string; // first ~200 chars
  url: string;               // direct link to job posting
  postedAt?: string;         // ISO date string
  jobType?: string;          // 'full-time' | 'part-time' | 'contract' | 'internship'
  remote?: boolean;
  tags?: string[];           // skills/categories
  matchScore?: number;       // 0-100 match against resume (populated later)
}

export interface JobSearchParams {
  query: string;
  location?: string;
  radius?: number;           // km
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  remote?: boolean;
  page?: number;
  limit?: number;            // results per page, default 20
}

export interface JobSearchResult {
  jobs: JobListing[];
  totalResults: number;
  page: number;
  totalPages: number;
  sources: string[];         // which sources returned results
}

export interface JobSourceAdapter {
  getSourceName(): string;
  search(params: JobSearchParams): Promise<{ jobs: JobListing[]; total: number }>;
}
