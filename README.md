# 🚀 DevOps 90 Tracker — Next.js & Supabase

A production-grade, 90-day structured roadmap and engineering CRM built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## ⚡ Quick Start

### 1. Install dependencies & run development server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The application is fully functional right out of the box in **Local Storage mode**. All your tasks, notes, interview questions, and job applications are cached locally in your browser.

---

## 🗄️ Supabase Database Setup

When you are ready to enable cloud persistence across devices, just add your Supabase database string:

### Step 1: Get your connection string
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Navigate to **Project Settings** (gear icon) → **Database**.
3. Under **Connection string**, select **URI** (or Transaction / Session pooler).

### Step 2: Add to `.env.local`
Open [.env.local](file:///home/anwar/Workspace/personal/devops-tracker/.env.local) and paste your string:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Step 3: Restart the server
```bash
npm run dev
```

That's it!
- The Next.js API automatically creates the `devops_tracker` table and indexes if they do not exist (`CREATE TABLE IF NOT EXISTS`).
- The top header will turn to **🟢 Supabase Synced**.
- You can also click the **"Sync Local Data to Supabase"** button in the top navigation or settings to migrate your locally saved progress into Supabase.

*(Optional)* If you prefer manual database setup, you can also execute the [supabase-schema.sql](file:///home/anwar/Workspace/personal/devops-tracker/supabase-schema.sql) file directly in the Supabase SQL Editor.

---

## 🛠️ Features & Tabs

- **📅 Today View**:
  - Dynamically calculates your current day (0 to 90) based on your custom start date.
  - Interactive daily checklist: **Learn**, **Build**, and **Post** (Mon/Wed/Fri) with celebratory confetti upon completion.
  - 8-metric KPI grid (Days complete, streak, weekly hours, weekly posts, published posts, job applications, in-process interviews, projects done).
  - Weekly progress bar.
  - "Catch Up" widget for missed recent days.
  - "Follow-ups Due Today" widget for pending recruiter follow-ups.

- **🗺️ Curriculum (Plan)**:
  - Complete 13-week syllabus (91 days total) covering:
    - *Week 1:* Linux, SSH, Troubleshooting
    - *Week 2:* Networking, Docker, CI (Project 1)
    - *Week 3:* AWS Core (VPC, IAM, EC2, ALB, RDS, S3)
    - *Week 4:* Terraform (Modules, Remote State, Project 2)
    - *Week 5:* Terraform CI & AWS Solutions Architect Prep
    - *Week 6:* Kubernetes Core & Cert Prep
    - *Week 7:* Kubernetes Intermediate & Ingress
    - *Week 8:* EKS & AWS Load Balancer Controller
    - *Week 9:* GitOps with ArgoCD (Project 3)
    - *Week 10:* Observability (Prometheus, Grafana, Alerting)
    - *Week 11:* Security, Policy as Code & Cost Optimization
    - *Week 12:* Positioning, Case Studies & Resume Polish
    - *Week 13:* Interview Mastery & Walkthroughs
  - Real-time search filter across all 91 daily topics.
  - Expand/collapse weeks with completion counts.

- **💼 Portfolio Projects**:
  - Preloaded with the 3 flagship industry portfolio projects.
  - Readiness checklist (README, Architecture Diagram, Teardown steps, Cost notes, Public repo, Demo video).
  - Links to GitHub repos, live demos, and architecture diagrams.

- **🎯 Job Application CRM**:
  - Full application pipeline: *Wishlist*, *Applied*, *Screening*, *Interview*, *Offer*, *Rejected*, *Ghosted*.
  - Track salary bands, recruiter contacts, follow-up deadlines, and interview feedback.
  - Pace monitor for the target of 10–20 applications/week.

- **📢 Posts & Personal Brand**:
  - Track LinkedIn, Twitter, and Blog publications.
  - Log topic, status, reaction counts, and comment engagement.

- **🎓 Interview Bank (Study)**:
  - 11 core DevOps domains (Linux, Networking, Docker, CI/CD, AWS, Terraform, Kubernetes, Observability, Security, Behavioral, System Design).
  - Confidence scoring (1 to 5 stars).
  - "Weak Only (Confidence ≤ 2)" toggle for targeted revision.

- **🔖 Resources & Bookmarks**:
  - Organize cheatsheets, documentation, GitHub repos, and video tutorials by tag.

- **🏆 Practice Scores**:
  - Track mock tests, quizzes, and certification exam practice scores (AWS SAA, CKA, etc.) with average score analysis.

- **📊 Analytics & Stats**:
  - 14-day study hours histogram.
  - Job application funnel conversion chart.
  - Aggregated list of low-confidence days to revisit.

- **⚙️ Settings & Backups**:
  - Day 0 start date picker.
  - Light / Dark / System theme switcher.
  - One-click JSON data export (with copy to clipboard & file download).
  - JSON data import with validation.
  - Reset everything with confirmation protection.

---

## 📁 Project Architecture

```
├── .env.example              # Environment variables template
├── .env.local                # Paste your DATABASE_URL here
├── supabase-schema.sql       # Optional Supabase SQL migration script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── db/
│   │   │   │   ├── init/route.ts     # Supabase auto-init endpoint
│   │   │   │   └── status/route.ts   # Database health check
│   │   │   └── tracker/route.ts      # Cloud data GET / POST sync
│   │   ├── globals.css               # Styling, dark/light themes
│   │   ├── layout.tsx                # App root layout & SEO metadata
│   │   └── page.tsx                  # Master tracker application
│   ├── components/
│   │   ├── Header.tsx                # Top bar with streak & DB status
│   │   ├── Navigation.tsx            # Desktop & mobile responsive nav
│   │   ├── ItemDrawer.tsx            # Slide-out editor for days/jobs/etc.
│   │   ├── LightboxModal.tsx         # Architecture diagram zoom lightbox
│   │   ├── SupabaseConfigModal.tsx   # Supabase connection & sync modal
│   │   └── tabs/                     # Modular views for all tabs
│   ├── constants/
│   │   └── curriculum.ts             # 13 weeks, 91 days syllabus & defaults
│   ├── lib/
│   │   ├── db.ts                     # PostgreSQL client & Supabase queries
│   │   ├── storage.ts                # Local storage cache & sync engine
│   │   └── utils.ts                  # Calculations, streaks, image shrinker
│   └── types/
│       └── tracker.ts                # TypeScript interfaces
```
