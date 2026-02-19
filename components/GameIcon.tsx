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

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const isSprite = game.icon.type === "sprite";

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)]",
        "bg-white/85 dark:bg-white/10",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <span
        className="block w-7 h-7 bg-no-repeat bg-center"
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
