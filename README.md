# 🚀 ResuMatch — ATS Resume Optimizer

**ResuMatch** is an AI-powered ATS (Applicant Tracking System) Resume Optimizer designed to help job seekers beat automated screening bots, optimize resume keywords against target job descriptions, generate personalized career roadmaps, and track job applications.

---

## 📖 How to Use

Follow this step-by-step guide to optimize your resume and land more interviews:

### Step 1: Upload Your Resume 📄
1. Navigate to the **Resumes** tab (`/dashboard/resumes`) or start from the Onboarding Wizard on the homepage.
2. Upload your resume in **PDF** or **DOCX** format.
3. ResuMatch automatically parses and extracts your skills, work experience, education, and formatting details.

### Step 2: Target a Job Description 🎯
1. Navigate to the **Jobs** tab (`/dashboard/jds`).
2. Paste the target job title, company name, and full job description text.
3. Save the job description to analyze against your uploaded resumes.

### Step 3: Run AI ATS Analysis 🔍
1. Go to **Analyze** (`/dashboard/analyze`) and select your parsed resume along with a target job description.
2. Click **Run Analysis**.
3. ResuMatch calculates an **Overall ATS Match Score (0–100%)**, broken down into:
   - **Keyword Match Rate**: Missing vs matching hard and soft skills.
   - **Section Completeness**: Contact info, Summary, Work History, Education.
   - **Impact & Action Verbs**: Quantification of achievements and standard action verbs.

### Step 4: Apply Optimization Suggestions ✨
1. Review AI-suggested rewrites, formatting tips, and keyword gap recommendations.
2. Incorporate recommended missing keywords into your resume bullet points.
3. Download or copy your optimized resume text to apply with confidence!

### Step 5: Follow Your Weekly Career Roadmap 🛣️
1. Visit your **Dashboard** (`/dashboard`) to view your AI-generated weekly strategy roadmap.
2. Check off weekly focus areas (e.g. LinkedIn profile updates, skill upgrades, networking milestones).

### Step 6: Track Applications 💼
1. Use the **Tracker** (`/dashboard/tracker`) to organize job applications by stage (*Applied*, *Interviewing*, *Offered*, *Rejected*).
2. Set follow-up reminders and keep notes for each opportunity.

---

## ✨ Features

- **📄 Smart Resume Parsing**: Extracts structured text, sections, and skills from PDF/DOCX files.
- **🎯 Precision JD Matching**: Compares resume text against specific job postings to identify keyword gaps.
- **📊 Detailed ATS Score Breakdown**: Provides actionable metrics across keywords, experience, and structure.
- **🛣️ AI Career Roadmap**: Generates personalized 4-week action plans for your target role and region.
- **👔 LinkedIn Profile Optimization**: Recommendations to align your LinkedIn profile with target roles.
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
