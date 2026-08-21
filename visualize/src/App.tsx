import { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas.js';
import { TabBar } from './components/TabBar.js';
import { loadGraph, selectForTab } from './graph/load.js';
import type { Graph, TabName } from './graph/types.js';

export function App({ graph = loadGraph() }: { graph?: Graph }) {
  const [tab, setTab] = useState<TabName>('business');
  const [showCross, setShowCross] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(() => selectForTab(graph, tab, showCross), [graph, tab, showCross]);

  return (
    <div className="app">
      <TabBar
        tab={tab}
        onTabChange={setTab}
        showCross={showCross}
        onShowCrossChange={setShowCross}
      />
      <Canvas
        nodes={view.nodes}
        edges={view.edges}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
