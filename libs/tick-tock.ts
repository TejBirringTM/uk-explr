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

type Fn = () => void;
type AsyncFn = () => Promise<void>;

export function withTickTockSync(
  fn: Fn,
  onCompleteCallback: (duration: TickTockDuration) => void,
) {
  const tock = tick();
  fn();
  const duration = tock();
  onCompleteCallback(duration);
}

export async function withTickTockAsync(fn: AsyncFn) {
  const tock = tick();
  await fn();
  const duration = tock();
  return duration;
}
