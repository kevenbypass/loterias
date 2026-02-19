import React from "react";
import { LotteryGame } from "../types";

interface GameIconProps {
  game: LotteryGame;
  size?: "sm" | "md";
}

interface IconTheme {
  label: string;
  from: string;
  to: string;
  fg: string;
}

const SIZE_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
};

const INNER_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-[11px]",
};

const DEFAULT_ICON: IconTheme = {
  label: "LT",
  from: "#0f766e",
  to: "#14b8a6",
  fg: "#ecfeff",
};

const GAME_ICON_THEMES: Record<string, IconTheme> = {
  "mega-sena": { label: "MS", from: "#0f9f6e", to: "#34d399", fg: "#ecfdf5" },
  lotofacil: { label: "LF", from: "#7e22ce", to: "#c084fc", fg: "#faf5ff" },
  quina: { label: "QN", from: "#1d4ed8", to: "#60a5fa", fg: "#eff6ff" },
  lotomania: { label: "LM", from: "#ea580c", to: "#fb923c", fg: "#fff7ed" },
  timemania: { label: "TM", from: "#0f766e", to: "#14b8a6", fg: "#ecfeff" },
  "dupla-sena": { label: "DS", from: "#be123c", to: "#fb7185", fg: "#fff1f2" },
  "dia-de-sorte": { label: "D+", from: "#0369a1", to: "#38bdf8", fg: "#f0f9ff" },
  "super-sete": { label: "S7", from: "#4d7c0f", to: "#a3e635", fg: "#f7fee7" },
  milionaria: { label: "+M", from: "#0f766e", to: "#14b8a6", fg: "#ecfeff" },
  federal: { label: "FD", from: "#312e81", to: "#818cf8", fg: "#eef2ff" },
};

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const theme = GAME_ICON_THEMES[game.id] ?? DEFAULT_ICON;

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl",
        "border border-white/25 dark:border-white/15",
        "bg-white/30 dark:bg-black/20",
        "shadow-[0_10px_24px_-20px_rgba(2,6,23,0.95)]",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <span
        className={[
          "relative inline-flex items-center justify-center rounded-xl font-black tracking-tight",
          INNER_CLASS[size],
        ].join(" ")}
        style={{
          color: theme.fg,
          background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        }}
      >
        {theme.label}
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.32),transparent_52%)]" />
      </span>
    </span>
  );
};

export default GameIcon;
