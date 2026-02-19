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

export interface SuperSetePick {
  number: number;
  label: string;
}

const shuffle = <T>(items: T[]): T[] => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i--) {
    const randomIdx = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[randomIdx]] = [cloned[randomIdx], cloned[i]];
  }
  return cloned;
};

export const generateSuperSeteNumbers = (totalMarks: number): SuperSetePick[] => {
  const clampedTotal = Math.max(7, Math.min(21, Math.round(totalMarks)));
  const columns = 7;
  const perColumnMin = clampedTotal <= 7 ? 1 : clampedTotal <= 14 ? 1 : 2;
  const perColumnMax = clampedTotal <= 14 ? 2 : 3;

  const quotas = Array.from({ length: columns }, () => perColumnMin);
  let remaining = clampedTotal - perColumnMin * columns;

  const expandableColumns = shuffle(Array.from({ length: columns }, (_, idx) => idx));
  let cursor = 0;
  while (remaining > 0) {
    const columnIndex = expandableColumns[cursor % expandableColumns.length];
    if (quotas[columnIndex] < perColumnMax) {
      quotas[columnIndex] += 1;
      remaining -= 1;
    }
    cursor += 1;
  }

  const picks: SuperSetePick[] = [];
  for (let columnIdx = 0; columnIdx < columns; columnIdx++) {
    const digits = shuffle(Array.from({ length: 10 }, (_, digit) => digit))
      .slice(0, quotas[columnIdx])
      .sort((a, b) => a - b);

    for (const digit of digits) {
      picks.push({
        number: digit,
        label: `C${columnIdx + 1}`,
      });
    }
  }

  return picks;
};
