import type { PointerEventHandler } from 'react';
import { Hand } from 'lucide-react';

export type DragHandleState = 'default' | 'hover' | 'dragging';

export const DRAG_HANDLE_SPEC = {
  default: {
    width: 57,
    height: 57,
    borderRadius: 0,
    stroke: '1.7px #2e2e2e',
    opacity: 1,
    spacing: 0,
  },
  hover: {
    width: 46.6,
    height: 46.6,
    borderRadius: 23.3,
    stroke: '1px solid #2e2e2e',
    opacity: 1,
    spacing: 0,
  },
  dragging: {
    width: 46.6,
    height: 46.6,
    borderRadius: 23.3,
    stroke: '2px dashed #e8e8ea',
    opacity: 1,
    spacing: 0,
  },
  motion: {
    durationMs: 360,
    easing: [0.34, 1.3, 0.64, 1] as const,
  },
  position: {
    anchor: 'near-fillet' as const,
    arcRadius: 28.5,
    circle: 46.6,
    filletRadius: 38.7,
  },
} as const;

interface Props {
  state: DragHandleState;
  onFocus: () => void;
  onBlur: () => void;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onPointerUp: PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: PointerEventHandler<HTMLButtonElement>;
}

/** Presentational drag handle. Placement and corner selection stay outside. */
export default function DragHandle({
  state,
  onFocus,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}: Props) {
  return (
    <button
      type="button"
      className="drag-handle"
      data-state={state}
      aria-label="Escolher uma das quatro bordas da tela"
      title="Segure e solte para escolher uma borda"
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <svg className="drag-handle__arc" viewBox="-36 -36 72 72" aria-hidden="true">
        <circle r="28.5" fill="none" stroke="#2e2e2e" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="44.77 179.07" />
      </svg>
      <span className="drag-handle__disc" aria-hidden="true">
        <Hand size={21} strokeWidth={2} fill="currentColor" />
      </span>
    </button>
  );
}
