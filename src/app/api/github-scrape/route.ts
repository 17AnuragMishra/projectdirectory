import { NextRequest, NextResponse } from 'next/server';
import { githubUrlValidator } from '@/lib/security/validators';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 20, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Scrape rate limit exceeded. Please wait ${rate.resetSeconds}s.` },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const body = await req.json();
    const parseResult = githubUrlValidator.safeParse(body.url);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid repository format' },
        { status: 400 }
      );
    }

    const inputUrl = parseResult.data;

    // Strict regex extraction of owner and repo (SSRF protection)
    let cleaned = inputUrl.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\/$/, '');
    const [owner, repo] = cleaned.split('/');

    // Security check: Only alphanumeric, dashes, dots, underscores allowed
    const validIdentifier = /^[a-zA-Z0-9_.-]+$/;
    if (!validIdentifier.test(owner) || !validIdentifier.test(repo)) {
      return NextResponse.json(
        { error: 'Invalid repository or owner name. Special characters are forbidden.' },
        { status: 400 }
      );
    }

    const githubApiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'projectrevive-App',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(githubApiUrl, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Repository '${owner}/${repo}' not found on GitHub. Please check spelling or ensure the repository is public.` },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded or access forbidden.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Fetch README safely
    let readmeExcerpt = '';
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
        headers: { ...headers, 'Accept': 'application/vnd.github.raw' },
      });
      if (readmeRes.ok) {
        const fullReadme = await readmeRes.text();
        readmeExcerpt = fullReadme.slice(0, 1500);
      }
    } catch {
      // ignore
    }

    // Build tech stack list
    const topics: string[] = Array.isArray(data.topics) ? data.topics : [];
    const language = data.language;
    const techStackSet = new Set<string>();

    if (language) techStackSet.add(language);
    topics.forEach((t: string) => {
      const cleanTopic = t.charAt(0).toUpperCase() + t.slice(1);
      techStackSet.add(cleanTopic);
    });

    if (techStackSet.size === 0) {
      techStackSet.add('TypeScript');
      techStackSet.add('Open Source');
    }

    // Determine inactivity
    const lastPushed = data.pushed_at ? new Date(data.pushed_at) : new Date();
    const monthsSincePush = (Date.now() - lastPushed.getTime()) / (1000 * 3600 * 24 * 30);
    const suggestedStatus = monthsSincePush > 6 ? 'Abandoned' : 'Open Source';

    return NextResponse.json({
      success: true,
      scrapedData: {
        title: (data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/[-_]/g, ' ')).slice(0, 100),
        description: (data.description || `A community open-source project: ${data.full_name}`).slice(0, 2000),
        ownerName: (data.owner?.login || owner).slice(0, 100),
        ownerUsername: (data.owner?.login || owner).slice(0, 100),
        ownerAvatar: data.owner?.avatar_url || `https://avatars.githubusercontent.com/${owner}`,
        codebaseUrl: data.html_url || `https://github.com/${owner}/${repo}`,
        isCodebasePublic: !data.private,
        techStack: Array.from(techStackSet).slice(0, 7),
        githubStars: typeof data.stargazers_count === 'number' ? data.stargazers_count : 0,
        githubForks: typeof data.forks_count === 'number' ? data.forks_count : 0,
        githubOpenIssues: typeof data.open_issues_count === 'number' ? data.open_issues_count : 0,
        githubLastCommit: data.pushed_at || data.updated_at || new Date().toISOString(),
        license: (data.license?.spdx_id || data.license?.name || 'MIT').slice(0, 50),
        readmeExcerpt: readmeExcerpt.slice(0, 1500),
        suggestedStatus,
      },
    });

  } catch (error: any) {
    console.error('GitHub scrape error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while scraping GitHub repository' },
      { status: 500 }
    );
  }
}
