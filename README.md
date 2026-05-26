# CareerSphere | Job Application Tracker Portal

[![React v19](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Express v4](https://img.shields.io/badge/Express-v4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CareerSphere** is a premium, full-stack MERN application designed to help job seekers streamline their application funnel. Unlike cluttered spreadsheets, CareerSphere organizes job applications into an interactive Kanban pipeline, scans job descriptions (JDs) for technical keywords, schedules custom action item reminders, manages networking contacts, logs interviews, and generates rich visual analytics using Recharts.

---

## 🚀 Key Features

*   **User Authentication**: Secure signup and login powered by JSON Web Tokens (JWT) and `bcryptjs` password hashing.
*   **Kanban Board Pipeline**: Interactive dashboard columns corresponding to search phases (Saved → Applied → OA → Interviewing → Offer → Rejected).
*   **Smart Tech-Keyword Extraction**: An integrated string heuristics regex scanner that analyzes job description (JD) texts to isolate required skills/technologies.
*   **Nested Action Items (Tasks)**: Specific checklists (with due dates) for interviews or coding assessments, generating dashboard deadline notifications.
*   **Recruiter Contacts Directory**: Integrated records of HR contacts, recruiters, or referrers linked directly to specific applications.
*   **Journal Logs (Notes)**: In-app notebooks for recording phone screenings, technical interview questions, and prep materials.
*   **Visual Charts (Analytics)**: Full funnel conversion bar charts and monthly submission volume line charts powered by `Recharts`.
*   **Bulk CSV Importer**: Custom client-side parser to upload job tracks in bulk from standard spreadsheets.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite-scaffolded, ES Modules)
*   **Styling**: Tailwind CSS v4 (native JIT compiler) + Lucide React (Icons)
*   **Backend**: Node.js + Express.js (ES Modules)
*   **Database**: MongoDB + Mongoose ODM
*   **Authentication**: JWT (Stateless Bearer Tokens)
*   **Charts**: Recharts (SVG wrapper)

---

## 📐 Project Architecture

### API Design Flow
```
                     ┌──────────────────────────────┐
                     │         Browser Client       │
                     │  (Vite + React + Tailwind)   │
                     └──────────────┬───────────────┘
                                    │
                         HTTPS JWT / JSON REST
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │      Express API Server      │
                     │    - Auth Guard (JWT)        │
                     │    - Application Controllers │
                     │    - Keyword Extraction Serv │
                     └──────────────┬───────────────┘
                                    │
                           Mongoose ODM Queries
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │        MongoDB Atlas         │
                     │  - Users Collection          │
                     │  - Applications Collection   │
                     └──────────────────────────────┘
```

---

## 📁 Folder Structure

```
Job-Application-Tracker-Portal/
├── client/                  # Frontend Vite + React SPA
│   ├── public/              # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── components/      # UI components (Modal, Side-drawer, Navbar)
│   │   ├── context/         # AuthContext and API endpoints config
│   │   ├── pages/           # Pages (Login, Register, Dashboard, Analytics)
│   │   ├── App.jsx          # Route Guards and navigation layout
│   │   ├── index.css        # Tailwind directives and custom themes
│   │   └── main.jsx         # React bootstrapping
│   ├── package.json         # Client dependencies
│   ├── tailwind.config.js   
│   └── vite.config.js       # Vite build directives
│
├── server/                  # Backend Node.js REST API
│   ├── src/
│   │   ├── config/          # MongoDB mongoose connection module
│   │   ├── controllers/     # Controller logic (Auth, Applications, Analytics)
│   │   ├── middleware/      # JWT route authorization middleware
│   │   ├── models/          # Mongoose collections schema models
│   │   ├── routes/          # Express route routers
│   │   ├── utils/           # Regex skill parser utility
│   │   └── server.js        # Main express entry point
│   ├── .env                 # Server configuration (gitignored)
│   ├── .env.example         # Template for environment configuration
│   └── package.json         # Server dependencies
│
├── sample_applications.csv   # Pre-configured CSV file for bulk imports
├── .gitignore               
└── README.md                
```

---

## 🛰️ REST API Endpoints

All application routes (excluding Auth register/login) require a secure header: `Authorization: Bearer <your_jwt_token>`.

### Authentication Routes
*   `POST /api/auth/register` - Create a new account.
*   `POST /api/auth/login` - Authenticate credentials and fetch token.
*   `GET /api/auth/me` - Fetch profile details.

### Application Routes
*   `GET /api/applications` - Retrieve job applications (supports query search `?search=Company` and filter `?stage=OA`).
*   `GET /api/applications/:id` - Retrieve specific application details.
*   `POST /api/applications` - Create a job track.
*   `PUT /api/applications/:id` - Update application fields (reruns tech keyword extraction if JD text is edited).
*   `DELETE /api/applications/:id` - Remove job application.

### Nested Actions (Sub-documents)
*   `POST /api/applications/:id/tasks` - Append a task.
*   `PUT /api/applications/:id/tasks/:taskId` - Update task status (`done: true/false`).
*   `DELETE /api/applications/:id/tasks/:taskId` - Remove task.
*   `POST /api/applications/:id/contacts` - Append a networking contact.
*   `DELETE /api/applications/:id/contacts/:contactId` - Remove contact.
*   `POST /api/applications/:id/notes` - Append a journal note.
*   `DELETE /api/applications/:id/notes/:noteId` - Remove note.

### Analytics Routes
*   `GET /api/analytics/dashboard` - Fetch KPI card values, funnel aggregates, monthly counts, and upcoming deadlines.

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18.x or above) installed.
*   MongoDB installed locally OR a MongoDB Atlas free-tier database.

### 1. Database Configuration
1.  If using **MongoDB Atlas**, copy your URI string.
2.  If using **Local MongoDB**, make sure the MongoDB Service is running on your computer.

### 2. Backend Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create your environment variables file:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and fill in your details:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/jobtracker
    JWT_SECRET=any_long_random_string_here
    ```
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Start the Express server in development mode:
    ```bash
    npm run dev
    ```
    *   Expected output: `[Database] MongoDB Connected: 127.0.0.1` and `[Server] running in development mode on port 5000`

### 3. Frontend Setup
1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies (React 19 peer-deps resolved):
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
    *   The app will run locally on `http://localhost:5173`. Open this URL in your web browser!

---

## 🧪 Virtual Simulation & Verification

Follow this workflow to test all application behaviors:
1.  **Register an Account**: Go to `http://localhost:5173/register` and create an account.
2.  **Log In**: Sign in using your registered credentials.
3.  **Upload CSV tracks**: Click **Bulk CSV Import** on the dashboard and select the `sample_applications.csv` file from the project root. Watch the columns populate.
4.  **Open an Application**: Click on the `Google` card in the **Saved** column. The side drawer details view will slide out.
5.  **Edit / Add Job Description (JD)**: Click the edit icon on the card, paste a JD containing keywords like *"React, Node.js, TypeScript, SQL, Docker, AWS"*, and save. Check the *Job Required Technologies* list in the side drawer.
6.  **Create Reminders**: Inside the drawer, add a task titled *"Complete Google HackerRank Coding Test"* and set the due date. Close the drawer.
7.  **Transition Stages**: Click **Next** on the Google card to move it from **Saved** to **Applied**, then **OA**.
8.  **View Analytics**: Navigate to the **Analytics** page. Verify that:
    *   The Funnel chart updates its bars based on column tallies.
    *   The KPI cards show active applications and response rates.
    *   The Google coding test appears under **Upcoming Action Item Deadlines** showing days remaining.

---

## 🎓 Learning Outcomes
By building this project, you will demonstrate command over:
1.  **MERN Data Modeling**: Defining relational structures inside document schemas, including nested sub-document arrays.
2.  **State Synchronization**: Syncing child forms, sidebar detail states, and board components fluidly.
3.  **RESTful API Patterns**: Structuring nested route endpoints (`/applications/:id/tasks/:taskId`) matching clean REST norms.
4.  **Stateless JWT Sessions**: Handling authentication tokens in HTTP clients and validating routing guards.
5.  **Data Visualizations**: Parsing custom aggregates into clean charts using SVG wrappers (`Recharts`).


## Author 
**Shravani Hande**
Linkedin Link : https://www.linkedin.com/in/shravani-hande-a443ab331?utm_source=share_via&utm_content=profile&utm_medium=member_android

Github link : https://github.com/shravani120625/Job-Application-Tracker-Portal.git