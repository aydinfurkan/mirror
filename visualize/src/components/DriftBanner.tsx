import { DRIFT_KINDS, type DriftKind } from '../graph/types.js';

interface Props {
  summary: Record<DriftKind, number>;
  driftOnly: boolean;
  onDriftOnlyChange: (value: boolean) => void;
  /** The filter hides canvas nodes. A document tab draws no canvas, so it hides the filter. */
  showFilter: boolean;
}

export function DriftBanner({ summary, driftOnly, onDriftOnlyChange, showFilter }: Props) {
  const total = DRIFT_KINDS.reduce((sum, kind) => sum + summary[kind], 0);
  return (
    <div className={total > 0 ? 'banner banner--warn' : 'banner'} data-testid="drift-banner">
      {total === 0 ? (
        <span>The prompts and the code agree.</span>
      ) : (
        <>
          <span>
            <strong>{total}</strong> drift
          </span>
          {DRIFT_KINDS.filter((kind) => summary[kind] > 0).map((kind) => (
            <span key={kind} className="banner__chip">
              {kind} <strong>{summary[kind]}</strong>
            </span>
          ))}
          {showFilter && (
            <button onClick={() => onDriftOnlyChange(!driftOnly)}>
              {driftOnly ? 'show everything' : 'show drift only'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
