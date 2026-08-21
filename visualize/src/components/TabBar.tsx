import type { TabName } from '../graph/types.js';

const TABS: TabName[] = ['business', 'technical', 'xsrc'];

interface Props {
  tab: TabName;
  onTabChange: (tab: TabName) => void;
  showCross: boolean;
  onShowCrossChange: (value: boolean) => void;
}

export function TabBar({ tab, onTabChange, showCross, onShowCrossChange }: Props) {
  return (
    <nav className="tabbar">
      <div role="tablist" aria-label="Prompt kinds">
        {TABS.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={name === tab}
            className={name === tab ? 'tab tab--active' : 'tab'}
            onClick={() => onTabChange(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <label className="cross-toggle">
        <input
          type="checkbox"
          checked={showCross}
          onChange={(event) => onShowCrossChange(event.target.checked)}
        />
        show implementations
      </label>
    </nav>
  );
}
