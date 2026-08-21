# projectrevive — Discover, Adopt & Contribute to Open Source & Unfinished Codebases

projectrevive is a developer platform built to discover, list, adopt, and contribute to abandoned, half-built, and open-source software codebases.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38bdf8?style=flat-square&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e699?style=flat-square&logo=postgresql)

---

## 🌟 Key Features

1. **Centralized Project Table**:
   - Built with **TanStack Table v8**.
   - Faceted search, multi-select filters for Status (`Open`, `Abandoned`, `Open Source`, `Freelance`, `Closed`) and Type (`Open Source`, `Freelance`, `Company Project`, `Personal Project`, `Startup`).
   - Tech stack tags, column sorting, pagination, and direct codebase preview drawers.

2. **Official GitHub OAuth 2.0 Authentication**:
   - Single Sign-On (SSO) exclusively via GitHub.
   - Eliminates fake profiles and password breaches.
   - Verified developer accounts with official GitHub avatars and public repository badges.

3. **Atomic Upvote System**:
   - Strictly enforced **1 verified user = 1 upvote per project** via PostgreSQL composite unique constraints `UNIQUE (user_id, project_id)`.
   - Zero synthetic/dummy upvote offsets.

4. **Codebase Requests & In-App Chat**:
   - Negotiate project adoptions, co-founder proposals, and transfer private repository invitations.
   - IDOR-protected messaging threads scoped strictly to conversation participants.

5. **Live GitHub Repository Ingestion & Scraping**:
   - Live discovery engine powered by GitHub Search API.
   - Automatic metadata scraping from any GitHub repository URL.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19, App Router, Server Actions)
- **Database**: Neon Serverless PostgreSQL (`pg` + SSL)
- **Authentication**: GitHub OAuth 2.0 + Signed JWT Cookies (`jose`)
- **Data Table**: TanStack Table v8
- **Styling**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion
- **Security**: Zod runtime validation, sliding-window Rate Limiter, SSRF domain regex whitelist, and Strict HTTP Security Headers.

---

## 🚀 Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Neon PostgreSQL Database Connection String
DATABASE_URL="postgresql://neondb_owner:npg_...@ep-....c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# GitHub Personal Access Token (for high rate limits on live repository discovery)
GITHUB_TOKEN="github_pat_..."

# JWT Secret for Cryptographically Signed HTTP-Only Auth Cookies
JWT_SECRET="your_32_char_jwt_secret"

# GitHub OAuth App Credentials
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"
```

---

## 📦 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` into the **Environment Variables** section in the Vercel project settings.
4. Set the **Authorization callback URL** in your GitHub OAuth App to `https://your-vercel-domain.vercel.app/api/auth/callback`.
5. Deploy!
