# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Open Source Developers & Indie Builders**: Developers with abandoned side projects, half-built tools, or looking for existing codebases to contribute to and revive rather than starting from scratch.
- **Founders & Startups**: Creators seeking to hand over, transfer, or adopt unfinished MVPs, prototypes, and side projects with existing traction or solid foundations.

## Product Purpose

`projectrevive` is a developer hub to discover, list, adopt, and collaborate on abandoned, unfinished, and open-source software codebases. It gives stalled projects a second life by connecting their original authors with eager builders, maintainers, and new owners. Success means dead repositories being revitalized into active, production-grade open source projects or commercial software.

## Positioning

Unlike generic repository directories or project boards, `projectrevive` combines:
- **Verified GitHub SSO**: Authentic developer identity tied directly to GitHub profiles and activity, preventing bot manipulation.
- **Atomic 1-User-1-Vote Ranking**: Fair, manipulation-proof community curation backed by PostgreSQL composite unique constraints without synthetic offsets.
- **Live Repository Discovery & Ingestion**: Automated scraping of metadata, stars, tech stack, and readme information directly from GitHub.
- **In-App Adoption Requests & Scoped Negotiation**: Secure messaging threads enabling original authors and adopters to negotiate code handovers, co-founder proposals, and access transfers.

## Operating Context

- Used via desktop and mobile web browsers by developers browsing repositories, filtering by tech stacks (TypeScript, Next.js, Python, Rust, etc.), and managing project listings.
- Tight integration with GitHub ecosystem (GitHub OAuth, GitHub Search API, repository links).
- Data-dense workflow: search, faceted status filters (`Open`, `Abandoned`, `Open Source`, `Freelance`, `Closed`), project type filters (`Open Source`, `Freelance`, `Company Project`, `Personal Project`, `Startup`), code preview drawers, and live upvote counts.

## Capabilities and Constraints

- **Capabilities**:
  - Centralized TanStack Table v8 project explorer with faceted multi-select filtering, sorting, tech stack tags, and codebase preview drawers.
  - GitHub OAuth 2.0 single sign-on with signed JWT session cookies (`jose`).
  - Atomic PostgreSQL-backed upvote system.
  - Private adoption request threads with participant-scoped messaging.
  - Live GitHub API discovery engine with domain whitelist validation and rate limiting.
- **Constraints**:
  - Full-stack Next.js 15 App Router architecture with Neon Serverless PostgreSQL.
  - Strict security posture: Zod validation, sliding-window rate limiting, SSRF domain whitelisting, and strict HTTP headers.

## Brand Commitments

- **Name**: `projectrevive`
- **Voice**: Clean, developer-native, authentic, transparent, and utility-focused.
- **Identity**: Rooted in developer tooling, open source collaboration, and craft.

## Evidence on Hand

- Production Next.js 15 + React 19 codebase with full database schema in `src/` and SQL migrations.
- Working components for project tables, authentication modals, request drawers, analytics, and leaderboards.
- Live Neon PostgreSQL integration and GitHub API integration.

## Product Principles

1. **Proof Over Noise**: Ground project value in real GitHub activity, verifiable codebases, and authentic developer identities.
2. **Frictionless Discovery**: Keep data density high and discovery immediate through robust filtering, keyboard navigation, and preview drawers.
3. **Respect for Codebases**: Treat unfinished and abandoned projects as valuable creative artifacts worthy of care, attribution, and structured handoff.
4. **Fair & Transparent Curation**: Protect community trust with atomic 1-person-1-vote ranking and zero artificial gaming.
