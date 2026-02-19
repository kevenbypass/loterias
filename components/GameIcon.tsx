import React from "react";
import { LotteryGame } from "../types";

interface GameIconProps {
  game: LotteryGame;
  size?: "sm" | "md";
}

const SIZE_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
};

const SVG_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
};

interface GameIconPalette {
  light: string;
  dark: string;
  stem: string;
  glow: string;
}

const DEFAULT_PALETTE: GameIconPalette = {
  light: "#d1fae5",
  dark: "#10b981",
  stem: "#047857",
  glow: "rgba(16,185,129,0.45)",
};

const GAME_PALETTES: Record<string, GameIconPalette> = {
  "mega-sena": {
    light: "#d1fae5",
    dark: "#00a651",
    stem: "#007d3d",
    glow: "rgba(0,166,81,0.45)",
  },
  lotofacil: {
    light: "#f3e8ff",
    dark: "#91278f",
    stem: "#6f1d6e",
    glow: "rgba(145,39,143,0.45)",
  },
  quina: {
    light: "#e0e7ff",
    dark: "#2e3192",
    stem: "#1f2370",
    glow: "rgba(46,49,146,0.45)",
  },
  lotomania: {
    light: "#ffedd5",
    dark: "#e67200",
    stem: "#b45309",
    glow: "rgba(230,114,0,0.45)",
  },
  timemania: {
    light: "#fef9c3",
    dark: "#fff200",
    stem: "#038141",
    glow: "rgba(255,242,0,0.5)",
  },
  "dupla-sena": {
    light: "#ffe4e6",
    dark: "#a62b43",
    stem: "#7f2033",
    glow: "rgba(166,43,67,0.45)",
  },
  "dia-de-sorte": {
    light: "#fef9c3",
    dark: "#e3c021",
    stem: "#7e6906",
    glow: "rgba(227,192,33,0.45)",
  },
  "super-sete": {
    light: "#ecfccb",
    dark: "#bed730",
    stem: "#038141",
    glow: "rgba(190,215,48,0.45)",
  },
  milionaria: {
    light: "#e0e7ff",
    dark: "#2a3580",
    stem: "#1f2964",
    glow: "rgba(42,53,128,0.45)",
  },
  federal: {
    light: "#dbeafe",
    dark: "#0b4ea2",
    stem: "#0b3d7a",
    glow: "rgba(11,78,162,0.45)",
  },
};

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const palette = GAME_PALETTES[game.id] ?? DEFAULT_PALETTE;

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl overflow-visible",
        "drop-shadow-[0_6px_12px_rgba(2,6,23,0.2)]",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={SVG_CLASS[size]}
        style={{
          filter: `drop-shadow(0 6px 12px ${palette.glow})`,
        }}
      >
        <path d="M32 31c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" fill={palette.dark} />
        <path d="M14 31c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" fill={palette.light} />
        <path d="M32 49c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" fill={palette.light} />
        <path d="M14 49c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" fill={palette.dark} />
        <path
          d="M33 39c-2 8-7 14-12 17a2 2 0 0 0 1 4c7-2 13-8 16-16 1-2 1-4 0-5-1-1-4-1-5 0Z"
          fill={palette.stem}
        />
      </svg>
    </span>
  );
};

export default GameIcon;
