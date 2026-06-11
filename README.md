# User Manager Application

A premium, full-stack Next.js 14 user management dashboard featuring role-based access control, secure JSON Web Token (JWT) sessions, password hashing, comprehensive User CRUD operations, and Google OAuth2 mailer integrations.

### 🔗 Live Demo / Production URL: [https://user-manager-app-weld.vercel.app](https://user-manager-app-weld.vercel.app)

---

## 🎯 Target User Story

This application is designed and implemented to fulfill the following core User Story:

> **As a System Administrator**,  
> I want to manage system users (Create, Read, Update, and Delete operations) through a secure, responsive, and visually appealing interface,  
> **so that** I can maintain the user database, prevent accidental self-deletion of my active administrator account, and automatically or manually send custom welcoming and motivational emails to inspire users to continue studying.

### Key Acceptance Criteria Met:
* **Role-Based Access Control:** Standard users can view their own dashboard, while administrators have exclusive access to the `/admin/users` management panel.
* **Account Safety Checks (Self-Deletion Prevention):** Administrators cannot delete their own active account, neither from the frontend user interface nor via raw backend API calls.
* **Google OAuth2 Email Delivery:** The system sends credentials to new users upon creation and sends customized motivational study reminders to existing users on demand.
* **Premium Futurism Design:** A modern, clean light theme built on a slate-100 background, featuring Outfit rounded typography, glassmorphism containers, and sky blue accents.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Database** | MongoDB Atlas + Mongoose |
| **Authentication** | JWT (`jsonwebtoken`) + timing-safe `bcryptjs` |
| **Design / UI** | Tailwind CSS + HeroUI + Lucide Icons |
| **Email Delivery** | Nodemailer + Google Cloud OAuth2 |
| **Security Validation** | `zxcvbn` (Password strength estimation) |

---

## 📂 Project Architecture

```text
user-manager/
├── src/
│   ├── app/
│   │   ├── admin/users/page.tsx     ← Administrator user CRUD panel
│   │   ├── api/
│   │   │   ├── auth/login/route.ts  ← POST login, returns signed JWT
│   │   │   ├── auth/register/route.ts ← POST public user registration
│   │   │   ├── users/route.ts       ← GET users list / POST create new user (Admin-only)
│   │   │   ├── users/[id]/route.ts  ← PUT update / DELETE user (Admin-only + Self-delete guard)
│   │   │   └── users/[id]/welcome/route.ts ← POST manual motivational study email
│   │   ├── dashboard/page.tsx       ← Standard protected dashboard
│   │   ├── login/page.tsx           ← Login and registration page
│   │   ├── globals.css              ← CSS variables, theme configuration, and fonts
│   │   ├── layout.tsx               ← Main HTML structure and wrapper
│   │   └── providers.tsx            ← HeroUI and Framer Motion wrappers
│   ├── components/
│   │   ├── UserCard.tsx             ← Reusable card representing a user
│   │   ├── UserFormModal.tsx        ← Dialog for creating/editing users
│   │   ├── DeleteConfirmModal.tsx   ← Safety dialog for user deletion
│   │   └── PasswordStrengthBar.tsx  ← Real-time password safety indicator
│   ├── hooks/
│   │   ├── useAuth.ts               ← Custom hook encapsulating auth state & helpers
│   │   ├── useUsers.ts              ← Custom hook encapsulating users state & CRUD
│   │   └── usePasswordStrength.ts   ← Real-time zxcvbn evaluation hook
│   ├── lib/
│   │   ├── mongodb.ts               ← Cached Mongoose database connection client
│   │   ├── auth.ts                  ← JWT sign/verify and header helpers
│   │   └── mailer.ts                ← Nodemailer SMTP configuration & welcome templates
│   ├── models/
│   │   └── User.ts                  ← Mongoose schema + pre-save password hash hooks
│   └── services/
│       ├── authService.ts           ← Fetch wrappers for auth endpoints
│       └── userService.ts           ← Fetch wrappers for user CRUD endpoints
├── public/
│   └── logo.jpg                     ← Custom application logo
├── tailwind.config.js               ← Tailwind theme and custom plugins
└── tsconfig.json                    ← TypeScript configuration
```

---

## 🚀 Installation & Local Setup

Follow these steps to run the application locally on your machine.

### 1. Clone the repository and install dependencies
```bash
git clone <repository-url>
cd user-manager-app
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and fill in the required variables (details in the section below).

### 3. Generate a secure JWT Secret
Run the following node script to generate a strong 64-character secret key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it into the `JWT_SECRET` variable in your `.env` file.

### 4. Run the Development Server
To avoid conflicts with Service Workers registered on port 3000 by other projects, it is highly recommended to run on port **`3001`**:
```bash
npx next dev -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser. You will be redirected to the `/login` page.

---

## 🔑 Environment Variables Configuration

The `.env` file must contain the following variables:

```env
# MongoDB Connection URI
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/database-name"

# JWT Options
JWT_SECRET="your_generated_64_char_hex_string"
JWT_EXPIRES_IN="7d"

# Google Cloud OAuth2 Credentials for Mail Delivery
GMAIL_USER="your-email@gmail.com"
OAUTH_CLIENT_ID="your_google_cloud_client_id"
OAUTH_CLIENT_SECRET="your_google_cloud_client_secret"
OAUTH_REFRESH_TOKEN="your_google_oauth2_playground_refresh_token"

# App URL (used for absolute links inside sent emails)
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### Google Cloud OAuth2 Configuration Guide:

1. **Create a Google Cloud Project:**
   * Go to the [Google Cloud Console](https://console.cloud.google.com/).
   * Click on **Google Auth Platform** on the left menu (or search for it).
2. **Configure Consent Screen & Test Users:**
   * Under **"Información de la marca"** (Brand Info), configure your App Name (`User Manager`) and support email.
   * Under **"Público"** (Audience), add your own Gmail address as a **Test User** (critical for testing mode).
3. **Create Credentials:**
   * Go to **"Clientes"** (Clients) in the left menu.
   * Click **Create Client** and select **Application Type: Web Application**.
   * Under **Authorized redirect URIs**, click **Add URI** and paste: `https://developers.google.com/oauthplayground`
   * Click **Save** and copy the generated **Client ID** and **Client Secret**.
4. **Acquire the Refresh Token:**
   * Go to [Google OAuth2 Playground](https://developers.google.com/oauthplayground).
   * Click the **Configuration Gear ⚙️** (top-right) -> check **Use your own OAuth credentials** -> fill in your Client ID and Client Secret.
   * In Step 1 (left list), type `https://mail.google.com/` in the custom scope field and click **Authorize APIs**.
   * Log in with your Gmail address (click *Advanced* -> *Go to User Manager (unsafe)* when warned by Google).
   * In Step 2, click **Exchange authorization code for tokens** and copy the resulting **Refresh Token**.
5. Save all credentials to your `.env` file!

---

## 🛠️ Verification & Building for Production

To verify that the application compiles correctly with clean TypeScript types and optimized assets, trigger a production build:

```bash
# Ensure no other server is running, then run:
npm run build
```

This will output static and dynamic paths, confirming that the application compiles successfully and is ready for Vercel/production deployment.
