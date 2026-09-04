import type { TabName } from '../graph/types.js';

interface Props {
  tab: TabName;
  /** The source-root tabs that follow business and technical. */
  srcTabs: string[];
  onTabChange: (tab: TabName) => void;
  showCross: boolean;
  onShowCrossChange: (value: boolean) => void;
  /** The switch filters canvas nodes. A document tab draws no canvas, so it hides the switch. */
  showCrossToggle: boolean;
}

export function TabBar({
  tab,
  srcTabs,
  onTabChange,
  showCross,
  onShowCrossChange,
  showCrossToggle,
}: Props) {
  return (
    <nav className="tabbar">
      <div role="tablist" aria-label="Prompt kinds">
        {['business', 'technical', ...srcTabs].map((name) => (
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
      {showCrossToggle && (
        <label className="cross-toggle">
          <input
            type="checkbox"
            checked={showCross}
            onChange={(event) => onShowCrossChange(event.target.checked)}
          />
          show implementations
        </label>
      )}
    </nav>
  );
}
