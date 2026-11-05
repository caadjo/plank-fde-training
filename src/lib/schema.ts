/** Idempotent startup schema, shared by PostgreSQL and PGlite. */
export const schema = [
  `CREATE TABLE IF NOT EXISTS requests (
    sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
    id uuid PRIMARY KEY,
    title text NOT NULL CHECK (length(btrim(title)) BETWEEN 3 AND 120),
    details text NOT NULL DEFAULT '' CHECK (length(details) <= 5000),
    team text NOT NULL CHECK (team IN ('operations', 'finance', 'support')),
    priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS requests_created_idx ON requests (created_at DESC, sequence DESC)`,
  `CREATE INDEX IF NOT EXISTS requests_filters_idx ON requests (team, status)`,
] as const;
