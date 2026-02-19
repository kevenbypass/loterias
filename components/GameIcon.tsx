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

const ICON_CLASS: Record<NonNullable<GameIconProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
};

const GameIcon: React.FC<GameIconProps> = ({ game, size = "md" }) => {
  const isSprite = game.icon.type === "sprite";
  const iconStyle: React.CSSProperties =
    isSprite
      ? {
          backgroundImage: "url('/game-icons/icos_loterias.png')",
          backgroundPosition: `left ${game.icon.yOffset ?? 0}px`,
        }
      : {
          backgroundImage: `url('${game.icon.imagePath}')`,
          backgroundSize: "contain",
        };

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-2xl",
        SIZE_CLASS[size],
      ].join(" ")}
    >
      <span
        className={[
          "block bg-no-repeat bg-center drop-shadow-[0_3px_8px_rgba(2,6,23,0.35)]",
          ICON_CLASS[size],
        ].join(" ")}
        style={iconStyle}
      />
    </span>
  );
};

export default GameIcon;
