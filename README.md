# 🌐 User Manager App

A modern, high-performance Full-Stack user management dashboard built with **Next.js**, **TypeScript**, and **Tailwind CSS**, featuring a premium translucent glassmorphic authentication gateway and server-side persistence.

---

## 🚀 Key Features

* **Premium UI/UX:** Futuristic Glassmorphism login panel with smooth interactive states and dynamic radiant background orbs.
* **Modern Stack:** Configured with Next.js App Router, TypeScript JSX, and Tailwind CSS.
* **Custom React Hooks:** Optimized modular state management for seamless cross-component data synchronization (`useUsers`, `useAuth`).
* **Database Integration:** Scalable backend support via Mongoose schemas for custom multi-role architectures.

---

## 🛠️ Prerequisites

Before installing, ensure you have the following tools set up on your machine:

* **Node.js** (v18.x or higher recommended)
* **npm** or **yarn** / **pnpm**
* **MongoDB** (Local instance or Atlas Cluster URI)

---

## 📦 Installation & Setup

Follow these steps to set up the development environment from scratch:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/user-manager-app.git](https://github.com/your-username/user-manager-app.git)
cd user-manager-app
2. Install Project Dependencies
Install all core framework utilities, custom adapters, and Tailwind engines:

Bash
npm install
Note: If you are setting up Tailwind CSS v4+ with PostCSS manually, ensure the dedicated compiler adapter is installed:

Bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
3. Environment Variables Setup
Create a .env file in the root directory of your project:

Bash
touch .env
Populate the file with your system credentials:

Fragmento de código
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/user_manager
NEXT_PUBLIC_API_URL=http://localhost:3000/api
JWT_SECRET=your_super_secret_jwt_key
⚙️ Core Compilation Configuration
To ensure Turbopack structures your atomic CSS framework pipelines flawlessly without execution evaluation bugs, verify that your core configuration nodes are aligned as follows:

postcss.config.js
JavaScript
module.exports = {
  plugins: [
    '@tailwindcss/postcss',
    'autoprefixer',
  ],
}
tailwind.config.js
JavaScript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
🏃‍♂️ Running the Application
Development Server
Run the local compiler engine in development mode:

Bash
npm run dev
Open http://localhost:3000 or http://localhost:3001 in your browser to inspect the application.

Production Build
Compile the application stack into optimized, static, server-ready deployment modules:

Bash
npm run build
npm run start
💡 Troub