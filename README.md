# 🏛️ paniund — Intelligent Career & ATS Workspace

paniund is an all-in-one job search workspace designed to automate resume optimization, job discovery, application tracking, and tailored outreach with the functional clarity and accessibility of the **Nordic Yellow** design system.

---

## ⚡ Core Architecture & Workflow

1. **Zero-Friction Resume Ingestion**
   - Upload PDF, DOCX, or TXT resumes directly from the landing page dropzone.
   - Text and structural metadata extraction powered by `pdf-parse` and `mammoth`.
   - Auto-extracts contact email, location, target roles, skills, and work history.
   - Automatically provisions account credentials with a seamless password setup flow.

2. **ATS Compatibility Analysis & Scoring**
   - Real-time dimensional ATS compatibility score (0–100) assessing:
     - **Keyword Density & Relevance**: Technical skills, tools, and domain alignment.
     - **Structural Formatting**: Parser-compliant layout checks (Taleo, Workday, Greenhouse).
     - **Action Verbs & Impact**: Action-oriented language and achievement formulation.
     - **Metrics & Quantification**: Measurable figures, percentages, and scale indicators.
   - Actionable recommendations, bullet rewrite suggestions, and missing skills breakdown.

3. **Multi-Platform Job Discovery & 1-Click Clipper**
   - **AI Job Finder**: Verified live job search targeting candidates in UAE, Middle East, UK, US, and Remote across LinkedIn, Indeed, Bayt.com, and Naukri Gulf without generating hallucinated vacancies.
   - **1-Click Browser Extension (Manifest V3)**: Clips live job postings from LinkedIn, Indeed (including 2-pane iframes), Bayt.com, Naukri Gulf, Glassdoor, and Greenhouse directly into the pipeline with instant ATS match analysis.
   - **URL Parser**: Paste any job listing link to parse role titles, companies, locations, and descriptions.

4. **AI Application Generation Suite**
   - **Tailored Cover Letters**: Job-specific 3-paragraph letters addressing company requirements with 1-click copy and export.
   - **ATS Resume Modifications**: Itemized bullet point upgrades, new achievement bullet additions, and optimized summary rewrites.
   - **Follow-up Emails**: Context-aware follow-up drafts for post-application, post-interview, or status inquiries.
   - **LinkedIn Outreach Messages**: Tailored connection requests (<300 characters) and recruiter InMails.

5. **Application Pipeline Tracker**
   - Clean visual board organizing applications across 6 active stages:
     - `Wishlist` → `Applied` → `Screening` → `Interview` → `Offer` → `Archived`
   - Native HTML5 desktop drag-and-drop between status columns with optimistic transitions and dropdown fallback for mobile.
   - Interview scheduling dates, recruiter contact info, and custom preparation notes.

6. **Application Funnel Analytics**
   - Real-time conversion funnel monitoring: Applied count, Interview count, Offer count.
   - Response rate and interview-to-offer rate calculations.
   - Weekly velocity indicators and benchmark comparisons.

---

## 🎨 Nordic Yellow Design System

The user interface uses the **Nordic Yellow** design system, combining functional minimalism with high-contrast accessibility:

- **Primary Deep Navy** (`#003399`): Headers, primary actions, active navigation
- **Accent Warm Yellow** (`#FFDA1A`): High-visibility badges, logo mark, primary callouts
- **Neutral Light Background** (`#F5F5F5`): Low-glare surfaces and canvas
- **Surface White** (`#FFFFFF`): Cards, dialogs, and reading panes
- **Success Green** (`#0A8A00`): Match scores, status confirmations
- **Typography**: `Noto Sans` (headings and body) with `JetBrains Mono` for tabular metrics and code tokens
- **Custom Classes**: Styled with custom `nordic-card`, `nordic-btn-primary`, `nordic-btn-yellow`, and `nordic-btn-outline` utilities

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 with custom `nordic-*` component classes
- **Authentication**: NextAuth v4 (Credentials provider with bcrypt password hashing)
- **Database & ORM**: PostgreSQL hosted on Neon Serverless + Prisma 5
- **AI Core**: Multi-provider AI (Groq, Gemini, OpenRouter, and DeepSeek via standard OpenAI-compatible SDK)
- **Document Parsing**: `pdf-parse` (PDF) + `mammoth` (DOCX)
- **Browser Extension**: Chrome Extension built with Manifest V3 (content scripts, service worker, dynamic zip generator)
- **Telemetry**: Privacy-friendly analytics via Umami

---

## ⚠️ Known Limitations

- **No OAuth Login**: Authentication currently uses email and password credentials only (Google OAuth is not yet wired up).
- **No Email Sending Yet**: Password reset tokens are generated and stored in the database with dev-mode quick links, but live transactional email delivery requires configuring a live `RESEND_API_KEY`.
- **Client-Rendered Only**: Dynamic dashboard metrics, modal forms, and tracker boards are primarily client-rendered components.

---

## 🗺️ Planned Features

- [ ] Native drag-and-drop Kanban card dragging in tracker
- [ ] One-click Google and GitHub OAuth authentication
- [ ] Export tailored resume directly to formatted PDF
- [ ] Automated browser extension store distribution

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon Serverless recommended)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env and supply your DATABASE_URL, NEXTAUTH_SECRET, and DEEPSEEK_API_KEY

# 3. Synchronize database schema
npx prisma db push

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
