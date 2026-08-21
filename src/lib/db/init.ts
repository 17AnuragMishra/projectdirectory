import { query } from './index';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;

  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        github_username VARCHAR(100),
        bio TEXT,
        reputation INTEGER DEFAULT 100 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // 2. Projects Table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(100) NOT NULL,
        tagline VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(30) NOT NULL,
        type VARCHAR(30) NOT NULL,
        codebase_url TEXT,
        is_codebase_public BOOLEAN DEFAULT TRUE NOT NULL,
        tech_stack TEXT[] DEFAULT '{}' NOT NULL,
        github_stars INTEGER DEFAULT 0 NOT NULL,
        github_forks INTEGER DEFAULT 0 NOT NULL,
        github_open_issues INTEGER DEFAULT 0 NOT NULL,
        github_last_commit TIMESTAMP WITH TIME ZONE,
        upvotes_count INTEGER DEFAULT 0 NOT NULL,
        weekly_upvotes_count INTEGER DEFAULT 0 NOT NULL,
        last_leaderboard_featured_at TIMESTAMP WITH TIME ZONE,
        abandon_reason TEXT,
        adoption_pitch TEXT,
        looking_for TEXT[] DEFAULT '{}' NOT NULL,
        license VARCHAR(50) DEFAULT 'MIT',
        demo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // Ensure migration for existing tables: add last_leaderboard_featured_at if missing
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='projects' AND column_name='last_leaderboard_featured_at'
        ) THEN
          ALTER TABLE projects ADD COLUMN last_leaderboard_featured_at TIMESTAMP WITH TIME ZONE;
        END IF;
      END $$;
    `);

    // Search embeddings are cached as JSON so semantic search remains optional
    // and existing databases do not require the pgvector extension.
    await query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS search_embedding JSONB,
      ADD COLUMN IF NOT EXISTS search_indexed_at TIMESTAMP WITH TIME ZONE;
    `);

    // 3. Upvotes Table (Prevents double-upvotes at DB level)
    await query(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE (user_id, project_id)
      );
    `);

    // 4. Codebase Requests Table
    await query(`
      CREATE TABLE IF NOT EXISTS codebase_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        requester_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
        role_proposed VARCHAR(50) NOT NULL,
        initial_message TEXT NOT NULL,
        repo_access_grant_link TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // 5. Request Messages Table (Private Chat)
    await query(`
      CREATE TABLE IF NOT EXISTS request_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES codebase_requests(id) ON DELETE CASCADE NOT NULL,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // 6. Activities Table
    await query(`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(30) NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        detail TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // High performance enterprise indexes for 10k-50k concurrent users
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_weekly_upvotes ON projects(weekly_upvotes_count DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_last_featured ON projects(last_leaderboard_featured_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_upvotes_user_project ON upvotes(user_id, project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_requests_requester ON codebase_requests(requester_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_requests_project ON codebase_requests(project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_request ON request_messages(request_id);`);

    isInitialized = true;
  } catch (err) {
    console.error('Database verification error:', err);
    throw err;
  }
}

