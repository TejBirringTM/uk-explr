export type TickTockDuration = {
  inMilliseconds: number;
  inSeconds: number;
};

export function tick() {
  const startTime = performance.now();
  const tock = (): TickTockDuration => {
    const finishTime = performance.now();
    const duration = finishTime - startTime;
    return {
      inMilliseconds: Math.ceil(duration),
      inSeconds: Math.ceil(duration / 1000),
    };
  };
  return tock;
}
