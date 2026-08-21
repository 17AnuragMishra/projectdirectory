import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 5, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Discovery rate limit reached. Please wait ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    await ensureDatabaseInitialized();

    const githubToken = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'projectrevive-App',
    };

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Query GitHub Search API for popular help-wanted & looking-for-maintainers repositories
    const searchQueries = [
      'topic:looking-for-maintainers stars:>50',
      'topic:help-wanted stars:>100',
      'topic:side-project stars:>50',
    ];

    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      randomQuery
    )}&sort=updated&order=desc&per_page=10`;

    const ghRes = await fetch(searchUrl, { headers });

    if (!ghRes.ok) {
      return NextResponse.json(
        { error: `GitHub API responded with status ${ghRes.status}` },
        { status: ghRes.status }
      );
    }

    const ghData = await ghRes.json();
    const items = ghData.items || [];

    let importedCount = 0;

    for (const item of items) {
      // Find or create GitHub user profile
      const ownerLogin = item.owner?.login || 'github-maintainer';
      const ownerAvatar = item.owner?.avatar_url || `https://avatars.githubusercontent.com/${ownerLogin}`;

      let userRes = await query(`SELECT id FROM users WHERE username = $1;`, [ownerLogin.toLowerCase()]);
      let ownerId: string;

      if (userRes.rows.length === 0) {
        const newUser = await query(
          `
          INSERT INTO users (username, email, password_hash, full_name, avatar_url, github_username, bio, reputation)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 300)
          ON CONFLICT (username) DO UPDATE SET avatar_url = EXCLUDED.avatar_url
          RETURNING id;
        `,
          [
            ownerLogin.toLowerCase(),
            `${ownerLogin.toLowerCase()}@users.noreply.github.com`,
            '$2a$12$e7kY70JzWJk6e0wV3YQYm.qG4y3zW1W9gH0f7a7j3w7y4q8k9z0m', // default hash
            ownerLogin,
            ownerAvatar,
            ownerLogin,
            'GitHub Open Source Maintainer',
          ]
        );
        ownerId = newUser.rows[0].id;
      } else {
        ownerId = userRes.rows[0].id;
      }

      // Check if project already exists
      const existingProj = await query(`SELECT id FROM projects WHERE codebase_url = $1;`, [item.html_url]);
      if (existingProj.rows.length > 0) continue;

      const topics: string[] = Array.isArray(item.topics) ? item.topics : [];
      const techStackSet = new Set<string>();
      if (item.language) techStackSet.add(item.language);
      topics.slice(0, 5).forEach((t) => {
        techStackSet.add(t.charAt(0).toUpperCase() + t.slice(1));
      });
      if (techStackSet.size === 0) {
        techStackSet.add('TypeScript');
        techStackSet.add('Open Source');
      }

      const lastPushed = item.pushed_at ? new Date(item.pushed_at) : new Date();
      const monthsSincePush = (Date.now() - lastPushed.getTime()) / (1000 * 3600 * 24 * 30);
      const isAbandoned = monthsSincePush > 6;

      await query(
        `
        INSERT INTO projects (
          title, tagline, description, owner_id, status, type, codebase_url,
          is_codebase_public, tech_stack, github_stars, github_forks,
          github_open_issues, github_last_commit, upvotes_count, weekly_upvotes_count,
          abandon_reason, adoption_pitch, looking_for, license
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);
      `,
        [
          item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/[-_]/g, ' '),
          (item.description || 'Open source project looking for contributors and new maintainers.').slice(0, 190),
          item.description || `Community project ${item.full_name}. Active repository looking for contributions and feature additions.`,
          ownerId,
          isAbandoned ? 'Abandoned' : 'Open Source',
          'Open Source',
          item.html_url,
          !item.private,
          Array.from(techStackSet).slice(0, 6),
          item.stargazers_count || 0,
          item.forks_count || 0,
          item.open_issues_count || 0,
          item.pushed_at || item.updated_at || new Date().toISOString(),
          0,
          0,
          isAbandoned ? 'No commits in over 6 months. Needs new active maintainers.' : null,
          'Looking for contributors to resolve open issues and build out new integrations.',
          ['Contributors', 'Maintainers', 'Reviewers'],
          item.license?.spdx_id || item.license?.name || 'MIT',
        ]
      );

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully discovered and indexed ${importedCount} real projects from GitHub.`,
    });
  } catch (error: any) {
    console.error('GitHub discover error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover GitHub repositories' },
      { status: 500 }
    );
  }
}
