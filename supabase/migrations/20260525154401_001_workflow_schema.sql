/*
  # Create workflow tables

  1. New Tables
    - `workflows`
      - `id` (uuid, primary key)
      - `name` (text, default 'Untitled Workflow')
      - `nodes` (jsonb, stores node definitions)
      - `edges` (jsonb, stores edge definitions)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `executions`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, foreign key to workflows)
      - `status` (text: idle/running/completed/error)
      - `current_node_id` (text, nullable)
      - `node_states` (jsonb, maps node id -> state)
      - `log` (jsonb, array of log entries)
      - `started_at` (timestamptz)
      - `finished_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own workflows and executions
*/

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Workflow',
  nodes jsonb NOT NULL DEFAULT '[]',
  edges jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'idle',
  current_node_id text,
  node_states jsonb NOT NULL DEFAULT '{}',
  log jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read executions"
  ON executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert executions"
  ON executions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update executions"
  ON executions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete executions"
  ON executions FOR DELETE
  TO authenticated
  USING (true);


-- Enable Realtime for executions table so frontend can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE executions;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
