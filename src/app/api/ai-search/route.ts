import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import {
  chunkSearchQuery,
  cosineSimilarity,
  createEmbedding,
  createEmbeddings,
  getEmbeddingProvider,
  localEmbedding,
  projectSearchText,
} from '@/lib/search/semantic';

export const runtime = 'nodejs';

function lexicalScore(queryText: string, projectText: string): number {
  const queryTokens = new Set(queryText.toLowerCase().match(/[a-z0-9+#.-]+/g) || []);
  const projectTokens = new Set(projectText.toLowerCase().match(/[a-z0-9+#.-]+/g) || []);
  if (!queryTokens.size) return 0;
  let matches = 0;
  queryTokens.forEach((token) => {
    if (projectTokens.has(token)) matches += 1;
  });
  return matches / queryTokens.size;
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(getClientIp(req), 30, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Search rate limit reached. Try again in ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const search = typeof body.query === 'string' ? body.query.trim().slice(0, 300) : '';
    if (!search) return NextResponse.json({ results: [], mode: 'empty' });

    await ensureDatabaseInitialized();
    const chunks = chunkSearchQuery(search);
    const queryEmbedding = await createEmbedding(chunks.map((chunk) => chunk.text).join('. '));
    const result = await query(`
      SELECT
        p.id, p.title, p.tagline, p.description, p.status, p.type,
        p.tech_stack as "techStack", p.looking_for as "lookingFor",
        p.abandon_reason as "abandonReason", p.adoption_pitch as "adoptionPitch",
        p.search_embedding as "searchEmbedding", u.full_name as "ownerName"
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      ORDER BY p.updated_at DESC
      LIMIT 500;
    `);

    const provider = getEmbeddingProvider();
    const rowsWithText = result.rows.map((row) => ({
      row,
      text: projectSearchText({
        title: row.title,
        tagline: row.tagline,
        description: row.description,
        status: row.status,
        type: row.type,
        techStack: row.techStack || [],
        lookingFor: row.lookingFor || [],
        abandonReason: row.abandonReason,
        adoptionPitch: row.adoptionPitch,
        ownerName: row.ownerName,
      }),
    }));
    const missing = rowsWithText.filter(({ row }) => {
      const cached = row.searchEmbedding;
      return !(cached && !Array.isArray(cached) && cached.provider === provider);
    });
    const freshEmbeddings = await createEmbeddings(missing.map(({ text }) => text)).catch(() =>
      missing.map(({ text }) => localEmbedding(text))
    );
    const freshById = new Map<string, number[]>();
    missing.forEach(({ row }, index) => freshById.set(row.id, freshEmbeddings[index]));

    if (missing.length) {
      const updates = missing.map(({ row }) => ({
        id: row.id,
        embedding: { provider, vector: freshById.get(row.id) },
      }));
      await query(
        `UPDATE projects AS p
         SET search_embedding = updates.embedding, search_indexed_at = NOW()
         FROM jsonb_to_recordset($1::jsonb) AS updates(id uuid, embedding jsonb)
         WHERE p.id = updates.id`,
        [JSON.stringify(updates)]
      );
    }

    const scored = [];
    for (const { row } of rowsWithText) {
      const cachedEmbedding = row.searchEmbedding;
      let embedding =
        cachedEmbedding && !Array.isArray(cachedEmbedding) && cachedEmbedding.provider === provider
          ? cachedEmbedding.vector
          : freshById.get(row.id) || [];

      const semantic = cosineSimilarity(queryEmbedding, embedding);
      const projectText = projectSearchText({
        title: row.title,
        tagline: row.tagline,
        description: row.description,
        status: row.status,
        type: row.type,
        techStack: row.techStack || [],
        lookingFor: row.lookingFor || [],
        abandonReason: row.abandonReason,
        adoptionPitch: row.adoptionPitch,
        ownerName: row.ownerName,
      });
      const lexical = lexicalScore(search, projectText);
      const score = semantic * 0.75 + lexical * 0.25;
      scored.push({
        id: row.id,
        score,
        match: lexical > 0.5 ? 'Direct match' : semantic > 0.35 ? 'Semantic match' : 'Related project',
      });
    }

    scored.sort((left, right) => right.score - left.score);
    return NextResponse.json({
      results: scored.slice(0, 8),
      mode: provider === 'local' ? 'local-vector-fallback' : 'semantic',
      chunks: chunks.map((chunk) => chunk.text),
    });
  } catch (error: any) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to search projects right now.' },
      { status: 500 }
    );
  }
}