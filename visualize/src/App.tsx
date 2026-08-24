import { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas.js';
import { DocumentView } from './components/DocumentView.js';
import { DriftBanner } from './components/DriftBanner.js';
import { SidePanel } from './components/SidePanel.js';
import { TabBar } from './components/TabBar.js';
import { loadGraph, selectForTab } from './graph/load.js';
import type { Graph, TabName } from './graph/types.js';

export function App({ graph = loadGraph() }: { graph?: Graph }) {
  const [tab, setTab] = useState<TabName>('business');
  const [showCross, setShowCross] = useState(false);
  const [driftOnly, setDriftOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A business rule and a technical decision are prose. The reader reads them as documents.
  // An xsrc prompt describes functions, and the canvas shows those links.
  const isDocument = tab !== 'xsrc';

  const view = useMemo(() => {
    const picked = selectForTab(graph, tab, showCross);
    if (!driftOnly) return picked;
    const nodes = picked.nodes.filter((n) => n.drift.length > 0);
    const ids = new Set(nodes.map((n) => n.id));
    return { nodes, edges: picked.edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
  }, [graph, tab, showCross, driftOnly]);

  const selected = graph.nodes.find((n) => n.id === selectedId) ?? null;

  function jump(id: string): void {
    const target = graph.nodes.find((n) => n.id === id);
    if (!target) return;
    setTab(target.tab);
    setDriftOnly(false);
    setSelectedId(id);
  }

  return (
    <div className="app">
      <TabBar
        tab={tab}
        onTabChange={setTab}
        showCross={showCross}
        onShowCrossChange={setShowCross}
        showCrossToggle={!isDocument}
      />
      <DriftBanner
        summary={graph.driftSummary}
        driftOnly={driftOnly}
        onDriftOnlyChange={setDriftOnly}
        showFilter={!isDocument}
      />
      <div className="app__body">
        {isDocument ? (
          <DocumentView
            graph={graph}
            tab={tab}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <>
            <Canvas
              nodes={view.nodes}
              edges={view.edges}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selected && (
              <SidePanel
                graph={graph}
                node={selected}
                onJump={jump}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
