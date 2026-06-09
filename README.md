# Tuition Tracker Frontend

This is the Next.js web application for the **Tuition Tracker** (Academy Management System). It provides a dashboard interface for academy administrators (centers), teachers, and students to manage classes, batches, attendance, examinations, and fee collections.

---

## Tech Stack
- **Framework:** Next.js (v16+) using App Router & Turbopack
- **Library:** React (v19+)
- **Styling:** TailwindCSS (v4)
- **Authentication:** Custom JWT-based cookie session sync
- **Third-party integrations:**
  - **Supabase:** Used for user account sessions and assets (`@supabase/auth-helpers-nextjs`, `@supabase/ssr`, `@supabase/supabase-js`)
  - **Razorpay:** Payment integration (`razorpay`)
  - **jsPDF:** Client-side PDF generation for reports & fee receipts (`jspdf`, `jspdf-autotable`)
  - **Axios:** Client-side REST requests
  - **Lucide Icons:** Premium modern iconography (`lucide-react`)

---

## Folder Structure

- **`src/app/`**: App Router directories and page structures.
  - `auth/`: Authentication flow pages (login, forgot-password, onboarding).
  - `dashboard/`: Main application layouts, core view panels, and sub-pages.
- **`src/components/`**: Shared interface elements (Sidebar, Header, Card, Badge, etc.).
- **`src/lib/`**: Utilities, client-side modules, and Server Actions.
  - `actions/`: Next.js Server Actions interacting with the backend API.
  - `api-client.ts`: Interceptor-enabled Axios client instance.
  - `supabase.ts`: Supabase browser client helper configuration.
  - `utils.ts`: Tailored CSS class mergers and formatting scripts.
- **`src/types/`**: TypeScript model interfaces (Batches, Students, Courses, Modules, etc.).

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Running Backend API** (Refer to the [BE-tuition-tracker README](file:///Users/user/Documents/NP/testProject/tuition-tracker/BE-tuition-tracker/README.md))

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd FE-tuition-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your local environment variables in a `.env.local` file:
   ```env
   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Custom Backend API Endpoint
   NEXT_PUBLIC_API_URL=http://localhost:3001/api

   # Supabase Integrations
   NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### Running the Project

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## Core Features

- **Institution Dashboard:** Overall statistics on student counts, monthly collections, batches, and active modules.
- **Batch Management:** Group students into batches, map them to specific courses and teachers, and manage timetables.
- **Student Profiling:** Add new students, assign them to batches, and view details about their fees, attendance, and exam scores.
- **Daily Attendance:** Quick-click attendance grids for teachers/centers to log daily class logs.
- **Examinations & Grading:** Track test evaluations by modules and record student performance.
- **Fee Management:** Manage monthly fee schedules, generate receipts, and log payments.
- **Parent Reporting:** Create, download, or share student progress reports as high-quality PDFs.

---

## Styling and Layout Guidelines

- **Vanilla CSS + Tailwind CSS v4:** Keep styles unified by utilizing standard Tailwind configurations.
- **Dark UI Theme:** The application features a sleek dark UI theme built on neutral charcoal bases (`#1e1e1e`, `#2b2b2b`) with emerald accent highlights (`#a4c2b5`).
- **Responsive Design:** Ensure components scale down appropriately for tablets and mobile devices.
