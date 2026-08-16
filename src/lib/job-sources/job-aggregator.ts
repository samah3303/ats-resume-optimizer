import { JobSearchParams, JobSearchResult, JobListing, JobSourceAdapter } from './types';
import { AdzunaAdapter } from './adzuna';
import { RemotiveAdapter } from './remotive';
import { ArbeitnowAdapter } from './arbeitnow';

export class JobAggregator {
  private adapters: JobSourceAdapter[];
  
  constructor() {
    this.adapters = [
      new AdzunaAdapter(),
      new RemotiveAdapter(),
      new ArbeitnowAdapter(),
    ];
  }
  
  async search(params: JobSearchParams): Promise<JobSearchResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const results = await Promise.allSettled(
      this.adapters.map(adapter => adapter.search(params))
    );

    let allJobs: JobListing[] = [];
    let totalResults = 0;
    const sources: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value.jobs);
        totalResults += result.value.total;
        if (result.value.jobs.length > 0) {
          sources.push(this.adapters[index].getSourceName());
        }
      } else {
        console.error(`Adapter ${this.adapters[index].getSourceName()} failed:`, result.reason);
      }
    });

    const uniqueJobs = this.deduplicateJobs(allJobs);

    // Sort by posted date (newest first)
    uniqueJobs.sort((a, b) => {
      const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return dateB - dateA;
    });

    const startIndex = (page - 1) * limit;
    const paginatedJobs = uniqueJobs.slice(startIndex, startIndex + limit);

    return {
      jobs: paginatedJobs,
      totalResults: uniqueJobs.length, // Deduplicated count as estimate
      page,
      totalPages: Math.ceil(uniqueJobs.length / limit),
      sources,
    };
  }
  
  private normalizeString(str: string): string {
    return str.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private deduplicateJobs(jobs: JobListing[]): JobListing[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const normalizedTitle = this.normalizeString(job.title);
      const normalizedCompany = this.normalizeString(job.company);
      
      const signature = `${normalizedTitle}|${normalizedCompany}`.substring(0, 50);
      
      if (seen.has(signature)) {
        return false;
      }
      seen.add(signature);
      return true;
    });
  }
}

export const jobAggregator = new JobAggregator();
