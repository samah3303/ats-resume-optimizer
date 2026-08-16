import { JobListing, JobSearchParams, JobSourceAdapter } from './types';

export class RemotiveAdapter implements JobSourceAdapter {
  getSourceName(): string {
    return 'remotive';
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  async search(params: JobSearchParams): Promise<{ jobs: JobListing[]; total: number }> {
    try {
      const url = new URL('https://remotive.com/api/remote-jobs');
      
      if (params.query) {
        url.searchParams.append('search', params.query);
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Remotive API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let allJobs = data.jobs || [];

      if (params.jobType) {
        allJobs = allJobs.filter((job: any) => job.job_type?.toLowerCase().includes(params.jobType?.toLowerCase() || ''));
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      
      const total = allJobs.length;

      const startIndex = (page - 1) * limit;
      const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);

      const jobs: JobListing[] = paginatedJobs.map((job: any) => {
        const descriptionSnippet = this.stripHtml(job.description || '').substring(0, 200);
        return {
          id: job.id?.toString() || Math.random().toString(36).substring(7),
          source: 'remotive',
          title: job.title || 'Unknown Title',
          company: job.company_name || 'Unknown Company',
          location: job.candidate_required_location || 'Remote',
          salary: job.salary,
          description: job.description || '',
          descriptionSnippet,
          url: job.url || '',
          postedAt: job.publication_date,
          jobType: job.job_type,
          remote: true,
          tags: job.tags || [],
        };
      });

      return { jobs, total };
    } catch (error) {
      console.error('Remotive adapter search error:', error);
      return { jobs: [], total: 0 };
    }
  }
}
