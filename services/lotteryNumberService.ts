export const generateRandomNumbers = (
  count: number,
  min: number,
  max: number,
  exclude: number[] = [],
  allowRepeats: boolean = false
): number[] => {
  const start = Math.min(min, max);
  const end = Math.max(min, max);
  const excludeSet = new Set(
    exclude.filter((value) => Number.isInteger(value) && value >= start && value <= end)
  );
  const availableNumbers = Array.from({ length: end - start + 1 }, (_, idx) => start + idx).filter(
    (value) => !excludeSet.has(value)
  );

  if (allowRepeats) {
    if (!availableNumbers.length) return [];

    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      const randomIdx = Math.floor(Math.random() * availableNumbers.length);
      result.push(availableNumbers[randomIdx]);
    }
    return result;
  }

  if (availableNumbers.length <= count) {
    return availableNumbers;
  }

  const pool = [...availableNumbers];
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * pool.length);
    result.push(pool[randomIdx]);
    pool.splice(randomIdx, 1);
  }

  return result.sort((a, b) => a - b);
};
