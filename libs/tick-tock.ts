export function tick() {
  const startTime = performance.now();
  const tock = () => {
    const finishTime = performance.now();
    const duration = finishTime - startTime;
    return {
      milliseconds: Math.ceil(duration),
      seconds: Math.ceil(duration / 1000),
    };
  };
  return tock;
}
