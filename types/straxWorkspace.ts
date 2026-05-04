export type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  created_at: string;
};

export type Assessment = {
  id: string;
  client_id: string;
  iia: number | null;
  ira: number | null;
  mie_percent: number | null;
  founder_dependency: string | null;
  process_level: string | null;
  raw_result: Record<string, unknown> | null;
  created_at: string;
};

export type RoadmapItem = {
  id: string;
  client_id: string;
  phase: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

export type Session = {
  id: string;
  client_id: string;
  session_type: string;
  session_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Decision = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  impact: string | null;
  created_at: string;
};

export type Risk = {
  id: string;
  client_id: string;
  title: string;
  severity: string;
  impact: string | null;
  status: string;
  created_at: string;
};
