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

const BADGE_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-[11px]",
};

interface GameIconTheme {
  label: string;
  from: string;
  to: string;
  ring: string;
  text: string;
  glow: string;
}

const DEFAULT_THEME: GameIconTheme = {
  label: "LT",
  from: "#0f766e",
  to: "#14b8a6",
  ring: "rgba(255,255,255,0.30)",
  text: "#f0fdfa",
  glow: "rgba(20,184,166,0.55)",
};

const GAME_THEMES: Record<string, GameIconTheme> = {
  "mega-sena": {
    label: "MS",
    from: "#0f9f6e",
    to: "#34d399",
    ring: "rgba(134,239,172,0.55)",
    text: "#ecfdf5",
    glow: "rgba(16,185,129,0.55)",
  },
  lotofacil: {
    label: "LF",
    from: "#7e22ce",
    to: "#c084fc",
    ring: "rgba(216,180,254,0.55)",
    text: "#faf5ff",
    glow: "rgba(168,85,247,0.5)",
  },
  quina: {
    label: "QN",
    from: "#1d4ed8",
    to: "#60a5fa",
    ring: "rgba(147,197,253,0.55)",
    text: "#eff6ff",
    glow: "rgba(59,130,246,0.52)",
  },
  lotomania: {
    label: "LM",
    from: "#ea580c",
    to: "#fb923c",
    ring: "rgba(253,186,116,0.55)",
    text: "#fff7ed",
    glow: "rgba(249,115,22,0.52)",
  },
  timemania: {
    label: "TM",
    from: "#0f766e",
    to: "#14b8a6",
    ring: "rgba(94,234,212,0.55)",
    text: "#ecfeff",
    glow: "rgba(20,184,166,0.52)",
  },
  "dupla-sena": {
    label: "DS",
    from: "#be123c",
    to: "#fb7185",
    ring: "rgba(253,164,175,0.55)",
    text: "#fff1f2",
    glow: "rgba(244,63,94,0.5)",
  },
  "dia-de-sorte": {
    label: "D+",
    from: "#0369a1",
    to: "#38bdf8",
    ring: "rgba(125,211,252,0.55)",
    text: "#f0f9ff",
    glow: "rgba(14,165,233,0.5)",
  },
  "super-sete": {
    label: "S7",
    from: "#4d7c0f",
    to: "#84cc16",
    ring: "rgba(190,242,100,0.55)",
    text: "#f7fee7",
    glow: "rgba(132,204,22,0.48)",
  },
  milionaria: {
    label: "+M",
    from: "#0f766e",
    to: "#0ea5a6",
    ring: "rgba(45,212,191,0.55)",
    text: "#ecfeff",
    glow: "rgba(13,148,136,0.5)",
  },
  federal: {
    label: "FED",
    from: "#312e81",
    to: "#818cf8",
    ring: "rgba(165,180,252,0.55)",
    text: "#eef2ff",
    glow: "rgba(99,102,241,0.52)",
  },
};

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const theme = GAME_THEMES[game.id] ?? DEFAULT_THEME;

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl overflow-visible",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <span
        className={[
          "relative inline-flex items-center justify-center rounded-full",
          "font-black tracking-tight leading-none select-none",
          BADGE_CLASS[size],
        ].join(" ")}
        style={{
          color: theme.text,
          background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
          border: `1px solid ${theme.ring}`,
          boxShadow: `0 12px 26px -16px ${theme.glow}`,
        }}
      >
        <span className="absolute inset-[1px] rounded-full border border-white/20 dark:border-white/10 pointer-events-none" />
        <span className="relative">{theme.label}</span>
      </span>
    </span>
  );
};

export default GameIcon;
