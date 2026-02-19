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

const ICON_SIZE_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-6 h-6",
  md: "w-7 h-7",
};

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const isSprite = game.icon.type === "sprite";

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl border border-emerald-500/25 dark:border-emerald-400/20",
        "bg-[linear-gradient(145deg,rgba(16,185,129,0.20),rgba(16,185,129,0.04))]",
        "dark:bg-[linear-gradient(145deg,rgba(52,211,153,0.16),rgba(16,185,129,0.05))]",
        "shadow-[0_10px_24px_-18px_rgba(16,185,129,0.8)]",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <span
        className={`${ICON_SIZE_CLASS[size]} block bg-no-repeat bg-center`}
        style={
          isSprite
            ? {
                backgroundImage: "url('/game-icons/icos_loterias.png')",
                backgroundPosition: `left ${game.icon.yOffset ?? 0}px`,
              }
            : {
                backgroundImage: `url('${game.icon.imagePath}')`,
                backgroundSize: "contain",
              }
        }
      />
    </span>
  );
};

export default GameIcon;
