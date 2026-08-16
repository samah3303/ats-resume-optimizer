import { JobListing, JobSearchParams, JobSourceAdapter } from './types';

export class AdzunaAdapter implements JobSourceAdapter {
  private lastRequestTime: number = 0;
  private readonly minRequestIntervalMs = 1000; // Rate limit: max 1 req per sec

  getSourceName(): string {
    return 'adzuna';
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  async search(params: JobSearchParams): Promise<{ jobs: JobListing[]; total: number }> {
    try {
      const appId = process.env.ADZUNA_APP_ID;
      const appKey = process.env.ADZUNA_APP_KEY;

      if (!appId || !appKey) {
        console.warn('Adzuna API credentials not configured');
        return { jobs: [], total: 0 };
      }

      // Basic rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestIntervalMs) {
        await new Promise((resolve) => setTimeout(resolve, this.minRequestIntervalMs - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const country = 'in'; // Default to India
      const page = params.page || 1;
      const limit = params.limit || 20;

      const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
      url.searchParams.append('app_id', appId);
      url.searchParams.append('app_key', appKey);
      url.searchParams.append('results_per_page', limit.toString());
      
      if (params.query) {
        url.searchParams.append('what', params.query);
      }
      if (params.location) {
        url.searchParams.append('where', params.location);
      }
      if (params.salaryMin) {
        url.searchParams.append('salary_min', params.salaryMin.toString());
      }
      if (params.salaryMax) {
        url.searchParams.append('salary_max', params.salaryMax.toString());
      }
      if (params.jobType === 'full-time') {
        url.searchParams.append('full_time', '1');
      } else if (params.jobType === 'part-time') {
        url.searchParams.append('part_time', '1');
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const jobs: JobListing[] = (data.results || []).map((job: any) => {
        const descriptionSnippet = this.stripHtml(job.description || '').substring(0, 200);
        return {
          id: job.id?.toString() || Math.random().toString(36).substring(7),
          source: 'adzuna',
          title: job.title || 'Unknown Title',
          company: job.company?.display_name || 'Unknown Company',
          location: job.location?.display_name || 'Unknown Location',
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          description: job.description || '',
          descriptionSnippet,
          url: job.redirect_url || '',
          postedAt: job.created,
          tags: job.category?.tag ? [job.category.tag, job.category.label].filter(Boolean) : [],
        };
      });

      return { jobs, total: data.count || 0 };
    } catch (error) {
      console.error('Adzuna adapter search error:', error);
      return { jobs: [], total: 0 };
    }
  }
}
