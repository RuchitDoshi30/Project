<div align="center">
  <img src="frontend/public/favicon.svg" alt="PlacementPrep Logo" width="100" height="100">
  
  # 🎓 PlacementPrep
  
  **The Ultimate University Placement Preparation & Management Portal**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    A comprehensive full-stack platform engineered to bridge the gap between students and top-tier companies through curated coding challenges, timed aptitude tests, and streamlined placement drive management.
  </p>

</div>

<hr />

## 🌟 Why PlacementPrep?

University placement seasons can be chaotic for both students and placement officers. **PlacementPrep** provides a single, unified ecosystem where students can hone their technical and analytical skills, while administrators can effortlessly track performance, manage upcoming drives, and communicate directly with candidates.

---

## 🔥 Key Features

### 👨‍🎓 For Students
*   💻 **Interactive Coding Environment:** High-performance, in-browser code editor powered by Monaco Editor.
*   🧠 **Aptitude Mastery Engine:** Practice timed, realistic MCQs spanning Quants, Logical Reasoning, and Verbal Ability domains.
*   📊 **Real-time Analytics Dashboard:** Monitor daily learning progress, view historical submissions, and analyze testing strengths & weaknesses.
*   🏆 **Global Leaderboards:** Foster healthy competition by comparing your aptitude and coding scores against your peers.
*   📢 **Placement & Drive Hub:** Never miss an opportunity. Get instant updates on campus drives, eligibility criteria, and administrative announcements.

### 🛡️ For Administrators (TPO / Faculty)
*   👥 **Advanced Student Management:** Import, sort, and continuously track individual or batch performance.
*   📝 **Dynamic Content System:** Easily create, test, and deploy programming problems, unit tests, and aptitude questions.
*   🏢 **Drive & Recruitment Manager:** Post placement drives, manage applications, and define stringent eligibility criteria directly from the dashboard.
*   📧 **Integrated Bulk Mailing:** Dispatch targeted email campaigns (shortlists, test links, updates) to filtered student groups using our native Nodemailer SMTP integration.
*   📈 **Batch Performance Reports:** Generate comprehensive visual reports to assess the batch's employment readiness prior to company visits.

---

## 🛠⚙️ Technology Architecture

Our application is built on a modern **MERN-like** stack utilizing TypeScript across both ends.

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19.x, Vite, TypeScript, TailwindCSS, React Router V7, Lucide React, Monaco Editor, Zod |
| **Backend** | Node.js, Express.js, TypeScript, JWT (Authentication), Bcrypt, Nodemailer |
| **Database** | MongoDB, Mongoose (ODM) |
| **Tooling** | ESLint, Prettier, Husky, Vitest |

---

## 🚀 1-Minute Quick Setup

Get the portal running locally on your machine in under **60 seconds**.

### 📋 Prerequisites
*   **Node.js** (v18.x or higher)
*   **MongoDB** (Local instance or Atlas URI)
*   **Git**

### 1️⃣ Clone & Install
Open your terminal and clone the repository. Then, install dependencies for both servers.

```bash
# Clone the repo (if not already done)
git clone https://github.com/your-username/PlacementPrep.git
cd PlacementPrep

# Setup backend
cd backend
npm install

# Open a new terminal instance and setup frontend
cd ../frontend
npm install
```

### 2️⃣ Environment Configuration
You need strictly two `.env` files. Create them in their respective directories.

<details>
<summary><b>Backend <code>.env</code> Configuration</b> <i>(Click to expand)</i></summary>

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal # Or your Atlas URI
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173

# (Optional) For Bulk Email functionality
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```
</details>

<details>
<summary><b>Frontend <code>.env</code> Configuration</b> <i>(Click to expand)</i></summary>

Create `frontend/.env`:
```env
# The URL where your backend is running
VITE_API_URL=http://localhost:5000/api/v1
```
</details>

### 3️⃣ Fire It Up! 🔥

**Terminal 1 (Backend):**
```bash
cd backend
npm run seed  # Vital: Injects the master admin account and initial data
npm run dev   # Boots up the backend on port 5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev   # Boots up the frontend on port 5173
```

🎉 **You are live!** Open `http://localhost:5173` in your browser. 
*(Log in using the admin configuration generated during the `npm run seed` phase).*

---

## 📂 Project Structure

```text
PlacementPrep/
├── backend/               # Node.js/Express Backend Server
│   ├── src/
│   │   ├── controllers/   # Route handlers (Auth, Coding, Aptitude, etc.)
│   │   ├── middlewares/   # Auth guards, Error handlers
│   │   ├── models/        # Mongoose Database Schemas
│   │   ├── routes/        # API route definitions
│   │   ├── scripts/       # DB Seeding scripts
│   │   └── services/      # Business logic (e.g. EmailService)
│   └── package.json
│
└── frontend/              # Vite + React Client
    ├── src/
    │   ├── pages/         # Application pages/views (Admin & Student)
    │   ├── components/    # Reusable UI components
    │   └── lib/           # Types, API client setup, Utility functions
    ├── tailwind.config.js # Styling configuration
    └── package.json
```

---

## 🤝 Contributing

We welcome contributions from developers, recruiters, and students! 

1. **Fork** the Project
2. Create your Feature Branch: `git checkout -b feature/NewFeature`
3. Commit your Changes: `git commit -m 'Add some NewFeature'`
4. Push to the Branch: `git push origin feature/NewFeature`
5. Open a **Pull Request**

<div align="center">
  <p>Built with ❤️ to redefine campus placements and coding excellence.</p>
</div>
