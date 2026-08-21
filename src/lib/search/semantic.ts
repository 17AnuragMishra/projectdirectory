const EMBEDDING_DIMENSIONS = 256;

function getEmbeddingConfig() {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      endpoint: 'https://openrouter.ai/api/v1/embeddings',
      model: process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small',
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      endpoint: 'https://api.openai.com/v1/embeddings',
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    };
  }

  return null;
}

export function getEmbeddingProvider(): string {
  return getEmbeddingConfig()?.provider || 'local';
}

export interface SearchChunk {
  text: string;
  weight: number;
}

export function chunkSearchQuery(query: string): SearchChunk[] {
  const normalized = query.trim().replace(/\s+/g, ' ');
  if (!normalized) return [];

  const words = normalized.split(' ');
  const chunks: SearchChunk[] = [{ text: normalized, weight: 1 }];

  for (let index = 0; index < words.length - 1; index += 1) {
    chunks.push({ text: `${words[index]} ${words[index + 1]}`, weight: 0.7 });
  }

  words.forEach((word) => {
    if (word.length >= 3) chunks.push({ text: word, weight: 0.35 });
  });

  return chunks;
}

function hashToken(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function localEmbedding(text: string): number[] {
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9+#.-]+/g) || [];

  tokens.forEach((token) => {
    const hash = hashToken(token);
    const index = hash % EMBEDDING_DIMENSIONS;
    vector[index] += 1;
    vector[(index * 31 + 17) % EMBEDDING_DIMENSIONS] += 0.35;
  });

  return normalizeVector(vector);
}

export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return magnitude ? vector.map((value) => value / magnitude) : vector;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (!left.length || left.length !== right.length) return 0;
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function projectSearchText(project: {
  title: string;
  tagline: string;
  description: string;
  status: string;
  type: string;
  techStack: string[];
  lookingFor: string[];
  abandonReason?: string | null;
  adoptionPitch?: string | null;
  ownerName?: string | null;
}): string {
  return [
    project.title,
    project.title,
    project.tagline,
    project.description,
    project.status,
    project.type,
    project.techStack.join(' '),
    project.lookingFor.join(' '),
    project.abandonReason || '',
    project.adoptionPitch || '',
    project.ownerName || '',
  ].join('. ');
}

export async function createEmbedding(text: string): Promise<number[]> {
  const config = getEmbeddingConfig();
  if (!config) return localEmbedding(text);

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.provider === 'openrouter'
        ? {
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
            'X-Title': process.env.OPENROUTER_APP_NAME || 'GitRevive',
          }
        : {}),
    },
    body: JSON.stringify({
      model: config.model,
      input: text,
      dimensions: Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 256),
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding provider returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return normalizeVector(data.data?.[0]?.embedding || []);
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const config = getEmbeddingConfig();
  if (!config) return texts.map(localEmbedding);

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.provider === 'openrouter'
        ? {
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
            'X-Title': process.env.OPENROUTER_APP_NAME || 'GitRevive',
          }
        : {}),
    },
    body: JSON.stringify({
      model: config.model,
      input: texts,
      dimensions: Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 256),
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding provider returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return (data.data || [])
    .sort((left: { index: number }, right: { index: number }) => left.index - right.index)
    .map((item: { embedding: number[] }) => normalizeVector(item.embedding));
}