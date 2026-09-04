export type DriftKind =
  | 'missing-prompt'
  | 'orphan-prompt'
  | 'missing-function'
  | 'orphan-function'
  | 'call-drift'
  | 'broken-ref';

export const DRIFT_KINDS: DriftKind[] = [
  'missing-prompt',
  'orphan-prompt',
  'missing-function',
  'orphan-function',
  'call-drift',
  'broken-ref',
];

export interface Drift {
  kind: DriftKind;
  id: string;
  message: string;
}

/** `business` and `technical` are fixed. Every other tab is a source root from config.json. */
export type TabName = string;
export type NodeKind = 'business' | 'technical' | 'file' | 'function';
export type EdgeKind =
  | 'relates_to'
  | 'driven_by'
  | 'supersedes'
  | 'implements'
  | 'decisions'
  | 'implemented_by'
  | 'calls';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  tab: TabName;
  parent: string | null;
  data: Record<string, unknown>;
  body: string;
  drift: Drift[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  tab: TabName | 'cross';
  drift: Drift[];
}

export interface Graph {
  generatedAt: string;
  /** The source-root tabs, in config order, that follow business and technical. */
  tabs: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  driftSummary: Record<DriftKind, number>;
}
