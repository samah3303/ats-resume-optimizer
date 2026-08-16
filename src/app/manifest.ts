import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ResuMatch — AI Job Search Platform',
    short_name: 'ResuMatch',
    description: 'AI-powered job search platform. Optimize resumes, track applications, and ace interviews.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#090A0C',
    theme_color: '#F59E0B',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/maskable-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Analyze Resume',
        url: '/dashboard/analyze',
        description: 'Analyze your resume with AI',
      },
      {
        name: 'Search Jobs',
        url: '/dashboard/jobs',
        description: 'Find matching jobs',
      },
      {
        name: 'Track Applications',
        url: '/dashboard/tracker',
        description: 'Manage your job applications',
      },
    ],
  }
}
