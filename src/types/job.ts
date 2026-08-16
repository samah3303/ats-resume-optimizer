export interface JobListing {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  descriptionSnippet: string;
  url: string;
  postedAt?: string;
  jobType?: string;
  remote?: boolean;
  tags?: string[];
  matchScore?: number;
}

export interface FilterState {
  location: string;
  jobType: string[];
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  sources: string[];
}
