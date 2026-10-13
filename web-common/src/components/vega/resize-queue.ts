/** A resize reruns the chart's whole Vega dataflow, so a dashboard whose charts all resize together would freeze one frame for their sum. */
const FRAME_BUDGET_MS = 8;

const pending = new Map<object, () => void>();
let draining = false;

function drain() {
  const start = performance.now();
  for (const [owner, resize] of pending) {
    pending.delete(owner);
    resize();
    if (performance.now() - start > FRAME_BUDGET_MS) break;
  }
  if (pending.size) requestAnimationFrame(drain);
  else draining = false;
}

/** Runs `resize` within a per-frame budget. A later call for the same `owner` replaces its pending one. */
export function queueResize(owner: object, resize: () => void) {
  pending.set(owner, resize);
  if (draining) return;
  draining = true;
  requestAnimationFrame(drain);
}

export function cancelResize(owner: object) {
  pending.delete(owner);
}
