import { useState } from 'react';
import DragHandle, { type DragHandleState } from './DragHandle';

interface Props {
  orientation: 'vertical' | 'horizontal';
  isDragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

/** A non-layout SVG proximity target around the placement handle. */
export default function ProximityCurve({
  orientation,
  isDragging,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}: Props) {
  const [near, setNear] = useState(false);
  const [focused, setFocused] = useState(false);

  const state: DragHandleState = isDragging ? 'dragging' : near || focused ? 'hover' : 'default';

  return (
    <div
      className={`proximity-curve proximity-curve--${orientation}`}
      onPointerEnter={() => setNear(true)}
      onPointerLeave={() => { if (!isDragging) setNear(false); }}
      aria-hidden="false"
    >
      <DragHandle
        state={state}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </div>
  );
}
