export interface LotteryGame {
  id: string;
  name: string;
  minNumber: number;
  maxNumber: number;
  defaultCount: number;
  maxCount: number;
  color: string; // Tailwind color class prefix or hex
  allowRepeats?: boolean; // For games like Super Sete or Federal
  specialRange?: {
    label: string;
    min: number;
    max: number;
    count: number;
    color?: string;
  };
  // New: For things like "Time do Coração" which are strings from a list
  extraOptions?: {
    label: string;
    options: string[];
  };
}

export interface SavedGame {
  id: string;
  gameId: string;
  numbers: number[];
  specialNumbers?: number[]; // For secondary ranges (Trevos, Mês numeric)
  extraString?: string; // For text based picks (Time do Coração)
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

export type ViewState = 'home' | 'saved' | 'results';
