export const generateRandomNumbers = (
  count: number,
  min: number,
  max: number,
  exclude: number[] = [],
  allowRepeats: boolean = false
): number[] => {
  if (allowRepeats) {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return result;
  }

  const numbers = new Set<number>(exclude);

  if (max - min + 1 < count) {
    return Array.from({ length: count }, (_, i) => min + i);
  }

  while (numbers.size < count + exclude.length) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }

  const result = Array.from(numbers).filter((n) => !exclude.includes(n));
  return result.sort((a, b) => a - b);
};

