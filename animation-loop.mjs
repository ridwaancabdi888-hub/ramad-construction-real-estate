/**
 * Create a requestAnimationFrame loop that can be paused and resumed safely.
 * Repeated start calls are ignored so visibility changes cannot create duplicate
 * animation chains.
 */
export function createAnimationLoop({ requestFrame, cancelFrame, render }) {
  let active = false;
  let frameId = null;

  const tick = timestamp => {
    frameId = null;
    if (!active) return;
    render(timestamp);
    if (active) frameId = requestFrame(tick);
  };

  return {
    start() {
      if (active) return;
      active = true;
      frameId = requestFrame(tick);
    },
    stop() {
      active = false;
      if (frameId !== null) cancelFrame(frameId);
      frameId = null;
    },
    get running() {
      return active;
    }
  };
}
