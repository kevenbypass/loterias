export interface LotteryGameIcon {
  type: "sprite" | "image";
  yOffset?: number;
  imagePath?: string;
}

export interface LotteryGameSpecialRange {
  label: string;
  min: number;
  max: number;
  count?: number;
  minCount?: number;
  maxCount?: number;
  defaultCount?: number;
  color?: string;
}

export interface LotteryGame {
  id: string;
  name: string;
  minNumber: number;
  maxNumber: number;
  minCount: number;
  defaultCount: number;
  maxCount: number;
  color: string; // Tailwind color class prefix or hex
  icon: LotteryGameIcon;
  officialUrl: string;
  selectionHint?: string;
  countLabel?: string;
  allowRepeats?: boolean; // For games like Super Sete or Federal
  specialRange?: LotteryGameSpecialRange;
  extraOptions?: {
    label: string;
    options: string[];
  };
}

export interface SavedGame {
  id: string;
  gameId: string;
  numbers: number[];
  numberLabels?: string[];
  specialNumbers?: number[]; // For secondary ranges (trevos/mes etc.)
  extraString?: string; // For text based picks (time do coracao)
  date: string;
}

export interface LotteryResult {
  gameId: string;
  contestNumber: string;
  date: string;
  numbers: number[];
  specialNumbers?: number[];
  extraString?: string;
  accumulated: boolean;
  nextPrize: string;
  nextDate: string;
}

export type ViewState = "home" | "saved" | "results";
