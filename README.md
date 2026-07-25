# 🚀 ResuMatch — ATS Resume Optimizer

**ResuMatch** is an AI-powered ATS (Applicant Tracking System) Resume Optimizer designed to help job seekers beat automated screening bots, optimize resume keywords against target job descriptions, generate personalized career roadmaps, and track job applications.

---

## 📖 How to Use

Follow this 6-step system to optimize your applications, ace interviews, and land your target job:

### Step 1: Upload Your Resume 📄
1. Navigate to the **Resumes** tab (`/dashboard/resumes`).
2. Upload your resume in **PDF** or **DOCX** format.
3. ResuMatch automatically extracts skills, experience, education, and flags formatting hazards.

### Step 2: Target a Job Description 🎯
1. Navigate to the **Jobs** tab (`/dashboard/jds`).
2. Paste the target job title, company name, and full job description text.
3. Save the job description to run scans and batch comparisons.

### Step 3: Run AI ATS Audit & Skill Bridge 🔍
1. Go to **Analyze** (`/dashboard/analyze`) and select your resume and job description.
2. Click **Run Analysis** to get an overall ATS Match Score (0–100%), Keyword Match %, Format Score, and Impact Score.
3. Review missing skills and access free YouTube crash courses & weekend project blueprints.

### Step 4: Outreach & STAR Rewriter Studio ✉️
1. Visit **Outreach & Cover** (`/dashboard/outreach`).
2. Generate job-tailored **Cover Letters**, **LinkedIn Connection Notes** (<300 chars), **Recruiter Cold Emails**, and **Follow-up scripts**.
3. Use the **STAR Rewriter** to transform weak bullet points into quantified achievement statements.

### Step 5: AI Interview Question Predictor 🎙️
1. Go to **Interview Prep** (`/dashboard/interview`).
2. Predict top technical, behavioral, and gap questions tailored to your target job.
3. Practice answers in the STAR framework with instant AI feedback.

### Step 6: ATS PDF Export & Daily Search Sprint 📥
1. Visit **ATS Builder** (`/dashboard/builder`) to edit and download 100% scannable single-column PDF resumes.
2. Track your daily applications, cold outreaches, and streak count on the **Daily Search Sprint** dashboard.
3. Organize active applications on the Kanban **Tracker** (`/dashboard/tracker`).

---

## ✨ Features

- **📄 Smart Resume Parsing**: Extracts structured text, sections, and skills from PDF/DOCX files.
- **🎯 Precision JD Matching**: Compares resume text against specific job postings to identify keyword gaps.
- **📊 Detailed ATS Score Breakdown**: Provides actionable metrics across keywords, experience, and structure.
- **✉️ Outreach & Application Studio**: Generates custom cover letters, LinkedIn notes, and cold emails.
- **⭐ STAR Bullet Point Rewriter**: Converts standard job tasks into quantified STAR metrics.
- **🎙️ AI Interview Question Predictor**: Tailored technical, behavioral, and gap questions with STAR feedback.
- **📥 One-Click ATS PDF Builder**: Downloads clean single-column PDF resumes engineered for ATS algorithms.
- **🎓 Free Skill Gap Remediation**: Direct links to free crash courses and 48-hour portfolio project blueprints.
- **🔥 Daily Job Search Sprint**: Gamified daily target counters and streak tracking to maintain momentum.
- **💼 Application Tracker**: Visual kanban-style management for all active job applications.
- **🔗 Shareable Reports**: Export and share public report links with mentors or career coaches.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite / PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons & Graphics**: Lucide Icons & Custom SVG graphics

---

## 💻 Developer Setup & Local Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn / pnpm / bun

### 1. Clone the repository
```bash
git clone https://github.com/samah3303/ats-resume-optimizer.git
cd ats-resume-optimizer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Migrations
```bash
npx prisma db push
# optional: seed initial data if applicable
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
