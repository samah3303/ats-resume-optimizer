const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const email = 'demo@paniund.com';
  const passwordHash = await bcrypt.hash('demo123', 10);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Alex Morgan',
      passwordHash,
      role: 'admin',
    },
    create: {
      email,
      name: 'Alex Morgan',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Demo user ready:', user.id);

  // Candidate Profile
  const profileData = {
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA (Remote)',
    targetRoles: JSON.stringify(['Senior Full Stack Engineer', 'Staff Software Engineer', 'Tech Lead']),
    jobType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/alexmorgan-demo',
    portfolioUrl: 'https://alexmorgan.dev',
    githubUrl: 'https://github.com/alexmorgan-demo',
    skills: JSON.stringify([
      'TypeScript', 'React', 'Next.js', 'Node.js', 'GraphQL',
      'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS', 'Redis',
      'System Design', 'CI/CD'
    ]),
    experience: JSON.stringify([
      {
        title: 'Senior Software Engineer',
        company: 'Apex Cloud Systems',
        location: 'San Francisco, CA',
        startDate: '2022-04',
        endDate: 'Present',
        description: 'Led core platform architecture and distributed microservices serving 1.2M monthly active developers.',
        highlights: [
          'Engineered event-driven streaming pipeline processing 45M daily events with 99.99% uptime',
          'Reduced API p95 latency from 240ms to 65ms by implementing Redis multi-layer caching',
          'Mentored 6 junior and mid-level engineers and established TypeScript & React best practice guidelines'
        ]
      },
      {
        title: 'Full Stack Engineer',
        company: 'HyperScale Labs',
        location: 'Remote',
        startDate: '2019-06',
        endDate: '2022-03',
        description: 'Developed modern web applications, payment integrations, and collaborative real-time UI features.',
        highlights: [
          'Built collaborative real-time editor using WebSockets and CRDT algorithms',
          'Integrated Stripe Billing & Subscription engine supporting multi-currency recurring revenue',
          'Automated Docker CI/CD deployment pipelines on AWS ECS reducing release cycle by 50%'
        ]
      }
    ]),
    education: JSON.stringify([
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2019',
        gpa: '3.85 / 4.0'
      }
    ]),
    summary: 'Accomplished Senior Full Stack Engineer with 7+ years of expertise in TypeScript, React, Next.js, and distributed cloud microservices. Proven track record scaling platforms to millions of users, architecting robust CI/CD systems, and elevating engineering standards.',
    atsScore: 89,
    atsBreakdown: JSON.stringify({
      keywords: 92,
      formatting: 96,
      experience: 88,
      education: 80
    }),
    recommendations: JSON.stringify([
      'Quantify impact in Apex Cloud Systems bullets (e.g., latency reduction and cost savings)',
      'Add AWS Solutions Architect or cloud certification to solidify high-tier ranking',
      'Mention experience with AI/LLM integration to match latest 2026 tech stack trends'
    ]),
    onboardingDone: true,
  };

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: {
      userId: user.id,
      ...profileData,
    },
  });

  console.log('Profile created/updated');

  // Clear existing items for demo user
  await prisma.application.deleteMany({ where: { userId: user.id } });
  await prisma.generatedContent.deleteMany({ where: { userId: user.id } });
  await prisma.activityLog.deleteMany({ where: { userId: user.id } });
  await prisma.job.deleteMany({ where: { userId: user.id } });

  // Create Jobs & Applications
  const jobsData = [
    {
      title: 'Staff Full Stack Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA (Remote)',
      salary: '$190,000 - $240,000',
      jobType: 'Full-time',
      description: 'Lead core developer infrastructure, build scalable payment APIs, and craft resilient web applications using TypeScript, React, and distributed systems.',
      requirements: '7+ years experience with TypeScript, Next.js, distributed databases, high-scale API design, and microservices architecture.',
      sourceUrl: 'https://stripe.com/jobs/staff-fullstack',
      source: 'company_portal',
      matchScore: 94,
      isBookmarked: true,
      appStatus: 'interview',
      appNotes: 'Final round technical architecture deep-dive scheduled with VP of Engineering.',
      contactPerson: 'Sarah Jenkins (Director of Engineering)',
      interviewDate: new Date(Date.now() + 86400000 * 2),
      hasCoverLetter: true,
    },
    {
      title: 'Lead Frontend Architect',
      company: 'Linear',
      location: 'San Francisco, CA / Remote',
      salary: '$180,000 - $220,000',
      jobType: 'Full-time',
      description: 'Shape the future of issue tracking and project management software. Focus on 60fps micro-interactions, offline-first sync engines, and minimalist UI.',
      requirements: 'Mastery of modern React, WebSockets, client-side caching, accessibility standards, and design system ergonomics.',
      sourceUrl: 'https://linear.app/careers',
      source: 'linkedin',
      matchScore: 91,
      isBookmarked: true,
      appStatus: 'offer',
      appNotes: 'Formal offer received: $205,000 base + equity package. Decision deadline next Monday.',
      contactPerson: 'Karri Saarinen (Head of Design & Product)',
      interviewDate: null,
    },
    {
      title: 'Senior Full Stack Engineer',
      company: 'Vercel',
      location: 'Remote',
      salary: '$175,000 - $210,000',
      jobType: 'Full-time',
      description: 'Empower developers worldwide by building edge compute platforms, dashboard features, and next-generation Next.js tooling.',
      requirements: 'Extensive experience with Next.js App Router, React Server Components, TypeScript, and serverless architectures.',
      sourceUrl: 'https://vercel.com/careers',
      source: 'web',
      matchScore: 88,
      isBookmarked: false,
      appStatus: 'applied',
      appNotes: 'Applied through team referral with tailored cover letter and resume highlights.',
      contactPerson: 'Lee Robinson (VP Developer Relations)',
      interviewDate: null,
    },
    {
      title: 'Principal Product Engineer',
      company: 'Notion',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$195,000 - $235,000',
      jobType: 'Full-time',
      description: 'Build connected workspaces and collaborative editing blocks for 35M+ users. Lead technical vision across team spaces and AI integrations.',
      requirements: 'Experience with collaborative data structures (CRDT), rich text editors, performance profiling, and full-stack TypeScript.',
      sourceUrl: 'https://notion.so/careers',
      source: 'linkedin',
      matchScore: 85,
      isBookmarked: true,
      appStatus: 'wishlist',
      appNotes: 'Curating targeted portfolio projects before submitting official application.',
      contactPerson: 'Elena Rostova (Lead Recruiter)',
      interviewDate: null,
    },
    {
      title: 'Senior Software Engineer (Platform)',
      company: 'GitHub',
      location: 'Remote',
      salary: '$170,000 - $205,000',
      jobType: 'Full-time',
      description: 'Help build developer workflow tools, GitHub Actions automations, and scalable microservices backing millions of repositories.',
      requirements: 'Proficiency in Node.js, Go or TypeScript, Docker, CI/CD pipelines, and high-availability distributed systems.',
      sourceUrl: 'https://github.com/about/careers',
      source: 'indeed',
      matchScore: 81,
      isBookmarked: false,
      appStatus: 'phone_screen',
      appNotes: 'Recruiter screen completed successfully. Scheduling technical pair programming session.',
      contactPerson: 'Marcus Vance (Senior Technical Recruiter)',
      interviewDate: new Date(Date.now() + 86400000 * 3),
    },
    {
      title: 'Frontend Infrastructure Lead',
      company: 'Figma',
      location: 'New York, NY (Hybrid)',
      salary: '$185,000 - $215,000',
      jobType: 'Full-time',
      description: 'Build web-first design and prototyping tools. Optimize WebGL/Canvas rendering, design tokens, and multi-tenant plugins.',
      requirements: 'Deep understanding of browser rendering pipelines, WebGL/WebAssembly, React, and build tooling.',
      sourceUrl: 'https://figma.com/careers',
      source: 'web',
      matchScore: 76,
      isBookmarked: false,
      appStatus: 'rejected',
      appNotes: 'Role closed due to internal promotion. Recruiter asked to keep in touch for Q3 expansion.',
      contactPerson: 'Rachel Kim (Staff Recruiter)',
      interviewDate: null,
    },
  ];

  for (const j of jobsData) {
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary,
        jobType: j.jobType,
        description: j.description,
        requirements: j.requirements,
        sourceUrl: j.sourceUrl,
        source: j.source,
        matchScore: j.matchScore,
        isBookmarked: j.isBookmarked,
      },
    });

    const coverLetterText = `Dear Stripe Hiring Team,

I am writing to express my strong enthusiasm for the Staff Full Stack Engineer role at Stripe. Having engineered high-throughput, mission-critical distributed systems and API architectures for over 7 years, I have long admired Stripe's relentless focus on developer ergonomics and payment reliability.

In my recent role at Apex Cloud Systems, I led the core platform architecture serving 1.2M monthly developers, where I reduced API p95 latency from 240ms to 65ms and maintained 99.99% uptime across 45M daily events. My deep background in TypeScript, React, Node.js, and event-driven architectures aligns precisely with your infrastructure priorities.

I look forward to discussing how my experience can contribute to Stripe's next chapter of global commerce infrastructure.

Warm regards,
Alex Morgan`;

    const resumeUpdatesJson = JSON.stringify({
      suggestions: [
        {
          section: 'Apex Cloud Systems - Experience',
          current: 'Led core platform architecture and distributed microservices.',
          suggested: 'Architected distributed payments telemetry pipeline handling $14M in daily transaction events.',
          reason: 'Aligns directly with Stripe financial transaction volume requirements.'
        },
        {
          section: 'Technical Skills',
          current: 'PostgreSQL, Docker, AWS',
          suggested: 'PostgreSQL, Distributed SQL, Kafka, Docker, Kubernetes, AWS',
          reason: 'Reflects high-scale streaming infrastructure demanded by Stripe platform engineering.'
        }
      ],
      missingSkills: ['Distributed SQL', 'Kafka', 'PCI-DSS Compliance'],
      atsScoreForJob: 94
    });

    await prisma.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        status: j.appStatus,
        notes: j.appNotes,
        contactPerson: j.contactPerson,
        interviewDate: j.interviewDate,
        atsScore: j.matchScore,
        coverLetter: j.hasCoverLetter ? coverLetterText : null,
        resumeUpdates: j.hasCoverLetter ? resumeUpdatesJson : null,
      },
    });

    if (j.hasCoverLetter) {
      await prisma.generatedContent.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: 'cover_letter',
          content: coverLetterText,
        },
      });

      await prisma.generatedContent.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: 'resume_updates',
          content: resumeUpdatesJson,
        },
      });
    }
  }

  // Activity logs
  const logs = [
    { action: 'ATS Resume Audit', details: 'Scored 89/100 across 4 key evaluation vectors' },
    { action: 'Offer Received', details: 'Linear marked as Offer ($205k base + equity)' },
    { action: 'Interview Scheduled', details: 'Stripe final architecture round booked' },
    { action: 'Application Tailored', details: 'Generated custom cover letter and skill diff for Stripe' },
    { action: 'Profile Synchronized', details: 'Added Redis, GraphQL, and System Design to candidate skills' },
  ];

  for (const l of logs) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: l.action,
        details: l.details,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
