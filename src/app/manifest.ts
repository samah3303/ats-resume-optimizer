import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Paniund — The Talent Operating System',
    short_name: 'paniund',
    description: 'The Complete 1-Stop AI Career & Talent Operating System: ATS Resume Studio, In-Browser Monaco Coding Challenges, Spoken Voice Mock Interviews, Recruiter Talent OS, and Salary War Room.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#09090B',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business', 'education', 'utilities'],
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
        name: 'ATS Resume Studio',
        url: '/dashboard/builder',
        description: 'Build ATS-optimized resumes with 6 templates and STAR metric diffs',
      },
      {
        name: 'ATS Match & Gap Scan',
        url: '/dashboard/analyze',
        description: 'Scan resume against target job description for instant keyword fit',
      },
      {
        name: 'Monaco Coding Challenges',
        url: '/dashboard/challenges',
        description: 'In-browser algorithmic challenge sandbox with unit test assertions',
      },
      {
        name: 'Spoken Voice Mock Coach',
        url: '/dashboard/mock-interview',
        description: 'Practice conversational interviews out loud with 8 AI personas',
      },
      {
        name: 'Recruiter Talent OS',
        url: '/dashboard/recruiter',
        description: 'AI Job Architect, Bulk ATS Screener, and 8-Stage Kanban Pipelines',
      },
    ],
  }
}
