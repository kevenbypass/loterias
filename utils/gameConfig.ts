import { LotteryGame, LotteryGameSpecialRange } from "../types";

export interface CountConfig {
  min: number;
  max: number;
  default: number;
}

export const clampCount = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
};

export const getMainCountConfig = (game: LotteryGame): CountConfig => {
  const min = Math.max(1, game.minCount ?? game.defaultCount);
  const max = Math.max(min, game.maxCount ?? game.defaultCount);
  const defaultValue = clampCount(game.defaultCount, min, max);
  return { min, max, default: defaultValue };
};

export const getSpecialCountConfig = (
  specialRange: LotteryGameSpecialRange | undefined
): CountConfig | null => {
  if (!specialRange) return null;

  const fixedCount = typeof specialRange.count === "number" ? specialRange.count : undefined;
  const min = Math.max(1, specialRange.minCount ?? fixedCount ?? 1);
  const max = Math.max(min, specialRange.maxCount ?? fixedCount ?? min);
  const defaultValue = clampCount(specialRange.defaultCount ?? fixedCount ?? min, min, max);
  return { min, max, default: defaultValue };
};

export const getMainCountLabel = (game: LotteryGame): string => game.countLabel ?? "dezenas";

export const getSuperSeteColumnRule = (totalMarks: number): string => {
  if (totalMarks <= 7) return "1 numero por coluna.";
  if (totalMarks <= 14) return "entre 1 e 2 numeros por coluna.";
  return "entre 2 e 3 numeros por coluna.";
};
