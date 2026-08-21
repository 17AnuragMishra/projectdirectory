<div align="center">

# 🌌 GitRevive

**Discover, Adopt & Revive Open Source & Abandoned Codebases.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3.0-blue.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00e699?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-architecture--tech-stack">Tech Stack</a> •
  <a href="#-quickstart--local-setup">Quickstart</a> •
  <a href="#-discovery-engine">Discovery Engine</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license--intellectual-property">License</a>
</p>

</div>

---

## 📖 About The Project

Every year, millions of high-potential developer tools, open-source libraries, SaaS MVPs, and software prototypes are abandoned or frozen on GitHub. Creators usually pause them not because the ideas are bad, but because they ran out of personal bandwidth, switched jobs, or lacked a specific partner (e.g., a great backend engineer who lacked a frontend/design partner).

At the same time, millions of ambitious developers and aspiring founders spend hundreds of hours recreating basic boilerplate from scratch because they don't have an interesting, real-world project to adopt or contribute to.

**GitRevive** bridges this gap:
* **Recycle & Revive**: Prevents thousands of hours of developer intellectual effort from going to waste.
* **Skip the 0-to-1 Boilerplate**: Enables developers to pick up half-built, high-quality codebases and immediately focus on the 1-to-N phase—shipping to production, fixing bugs, and growing users.
* **Frictionless Succession**: Provides a structured platform with verified GitHub developer identity, in-app negotiation rooms, and private repository access-grant workflows.
* **Community-Curated Leaderboard**: A gamified weekly spotlight where developers upvote the most promising dormant codebases.

---

## 🌟 Key Features

### 1. Centralized Project Discovery Table
* Powered by **TanStack Table v8** with low-latency client-side faceted filtering.
* Filter by **Status** (`Abandoned`, `Open Source`, `Freelance`, `Closed`) and **Type** (`Open Source`, `Startup`, `Personal Project`, `Freelance`, `Company Project`).
* Multi-select technology tags, column sorting, pagination, and instant repository detail drawers.

### 2. Weekly Revival Leaderboard
* **Community Spotlight**: Weekly podium highlighting the `#1 Weekly Winner`, `#2 Spotlight`, and `#3 Spotlight`.
* **Fairness Threshold**: The podium activates only when at least 3 distinct projects have received community upvotes.
* **3-Month Anti-Monopoly Cooldown**: Projects featured on the podium enter a 90-day cooldown period to ensure fair rotation and visibility for new creators.

### 3. Verified GitHub OAuth 2.0 SSO & Atomic Upvotes
* Single Sign-On (SSO) exclusively via **GitHub OAuth 2.0** to eliminate spam and fake accounts.
* **Atomic 1-User-1-Vote Integrity**: Strictly enforced via PostgreSQL composite unique constraints `UNIQUE (user_id, project_id)`.

### 4. Codebase Requests & Private Negotiation Rooms
* Creator-to-Adopter private chat channels for discussing maintainership transfers, co-founder proposals, and code access.
* Protected against **IDOR** (Insecure Direct Object References)—only verified conversation participants can read or send messages.
* Direct in-chat repository access grant key transfers.

### 5. Instant GitHub Auto-Scraping & Intelligent Tagging
* Scrapes repository metadata, topics, license, stars, open issues, and commit history directly from any GitHub URL.
* **120+ Canonical Tech Stack Vocabulary**: Automatic tag normalization and debounced autocomplete.

### 6. Enterprise Security & Scalability
* **Strict Content Security Policy (CSP)**, HSTS (`max-age=63072000`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
* **SSRF Defense**: Strict regex validation and IP filtering on all outbound scraping endpoints.
* **High-Concurrency Ready**: Multi-column PostgreSQL B-tree indexes and HTTP Edge Caching (`Cache-Control: public, s-maxage=10, stale-while-revalidate=60`).

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19, Server Components) |
| **Styling & Components** | [Tailwind CSS](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons, Canvas Confetti |
| **State & Tables** | [TanStack Table v8](https://tanstack.com/table/v8), React Hooks |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) (`pg` connection pool with SSL) |
| **Authentication** | GitHub OAuth 2.0 + Cryptographically Signed JWT Cookies ([`jose`](https://github.com/panva/jose)) |
| **Validation & Security** | [Zod](https://zod.dev/) runtime validation, sliding-window Rate Limiter, HTML/XSS Sanitizer |
| **SEO & Metadata** | Dynamic JSON-LD Structured Data, Open Graph, Twitter Cards, `sitemap.ts`, `robots.ts` |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.17 or higher)
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
* A [Neon PostgreSQL](https://neon.tech/) database (or any PostgreSQL instance)
* A [GitHub OAuth App](https://github.com/settings/developers)

### 1. Clone the Repository
```bash
git clone https://github.com/17AnuragMishra/projectdirectory.git
cd projectdirectory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Neon PostgreSQL Database Connection String
DATABASE_URL="postgresql://neondb_owner:password@ep-your-database-pooler.region.neon.tech/neondb?sslmode=require"

# GitHub Personal Access Token (for high rate limits on repository discovery)
GITHUB_TOKEN="github_pat_your_token_here"

# JWT Secret for Cryptographically Signed HTTP-Only Auth Cookies (min 32 characters)
JWT_SECRET="your_custom_super_secure_32_character_jwt_secret_key"

# GitHub OAuth App Credentials (https://github.com/settings/developers)
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"
```

> **Note on GitHub OAuth Callback**:
> In your GitHub OAuth App settings, set the **Authorization callback URL** to:
> - Local: `http://localhost:3000/api/auth/callback`
> - Production: `https://your-domain.com/api/auth/callback`

### 4. Seed & Ingest Real Projects (Optional)
Run the automated repository discovery engine to index live open-source projects into your database:
```bash
# Ingest curated repositories across all strategies
node scripts/discover.js --count 4 --update
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Discovery Engine

GitRevive includes an enterprise discovery engine (`scripts/discover.js`) with 35+ targeted search heuristics to unearth high-potential abandoned and maintainer-seeking repositories.

```bash
# Scan a specific category
node scripts/discover.js --category maintainers --count 10

# Scan dormant developer tools and libraries
node scripts/discover.js --category dormant --count 10

# Update existing projects with fresh GitHub stars, forks, and commit dates
node scripts/discover.js --update

# Dry run (test queries without writing to database)
node scripts/discover.js --category ecosystems --dry-run
```

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🔒 Security & Responsible Disclosure

If you discover a security vulnerability within GitRevive, please review our security policy and open a confidential report or contact the maintainers directly. All security vulnerabilities will be promptly addressed.

---

## ⚖️ License & Intellectual Property

This project is licensed under the **GNU Affero General Public License v3.0 (GNU AGPLv3)** — see the [LICENSE](LICENSE) file for details.

### What This Means For You:
* **Open & Auditable**: You are free to run, study, modify, and contribute to this codebase.
* **Network Copyleft Protection**: If you modify this software and run it over a network (e.g. as a hosted web service / SaaS), **you are legally required to release your complete source code under the same AGPLv3 license**.
* **Attribution & Anti-Plagiarism**: You **must** retain all original copyright notices (`Copyright (C) 2026 Anurag Mishra`), state all modifications, and you **cannot** re-license, close-source, or claim this project or its trademark as your own original work.

---

<div align="center">
  <p>Built with ❤️ for the open-source developer community.</p>
  <p><strong>Copyright &copy; 2026 Anurag Mishra. All rights reserved.</strong></p>
</div>
