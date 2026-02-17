const ALLOWED_GAME_COLORS = [
  "emerald",
  "purple",
  "blue",
  "orange",
  "amber",
  "rose",
  "sky",
  "lime",
  "teal",
  "indigo",
] as const;

export type GameColor = (typeof ALLOWED_GAME_COLORS)[number];

const ALLOWED_COLOR_SET = new Set<string>(ALLOWED_GAME_COLORS);

export const DEFAULT_GAME_COLOR: GameColor = "emerald";

export const sanitizeGameColor = (value: string | null | undefined): GameColor => {
  if (!value) return DEFAULT_GAME_COLOR;
  return ALLOWED_COLOR_SET.has(value) ? (value as GameColor) : DEFAULT_GAME_COLOR;
};

