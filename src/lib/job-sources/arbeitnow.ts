import { JobListing, JobSearchParams, JobSourceAdapter } from './types';

export class ArbeitnowAdapter implements JobSourceAdapter {
  getSourceName(): string {
    return 'arbeitnow';
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  async search(params: JobSearchParams): Promise<{ jobs: JobListing[]; total: number }> {
    try {
      const url = new URL('https://www.arbeitnow.com/api/job-board-api');
      
      const page = params.page || 1;
      url.searchParams.append('page', page.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Arbeitnow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let apiJobs = data.data || [];

      if (params.query) {
        const queryLower = params.query.toLowerCase();
        apiJobs = apiJobs.filter((job: any) => 
          job.title?.toLowerCase().includes(queryLower) || 
          job.company_name?.toLowerCase().includes(queryLower) ||
          job.description?.toLowerCase().includes(queryLower)
        );
      }
      
      if (params.location) {
        const locLower = params.location.toLowerCase();
        apiJobs = apiJobs.filter((job: any) => 
          job.location?.toLowerCase().includes(locLower)
        );
      }

      const jobs: JobListing[] = apiJobs.map((job: any) => {
        const descriptionSnippet = this.stripHtml(job.description || '').substring(0, 200);
        return {
          id: job.slug || job.url || Math.random().toString(36).substring(7),
          source: 'arbeitnow',
          title: job.title || 'Unknown Title',
          company: job.company_name || 'Unknown Company',
          location: job.location || 'Unknown Location',
          description: job.description || '',
          descriptionSnippet,
          url: job.url || '',
          postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : undefined,
          remote: job.remote || false,
          tags: job.tags || [],
        };
      });

      return { jobs, total: data.meta?.total || jobs.length };
    } catch (error) {
      console.error('Arbeitnow adapter search error:', error);
      return { jobs: [], total: 0 };
    }
  }
}
