import { LotteryGame } from "../types";

interface DreamInterpretationResponse {
  main?: unknown;
  special?: unknown;
  extraString?: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

const parseApiResponse = (payload: DreamInterpretationResponse) => {
  const main = Array.isArray(payload.main) ? payload.main : [];
  const special = Array.isArray(payload.special) ? payload.special : [];
  const extraString =
    typeof payload.extraString === "string" ? payload.extraString : undefined;

  return { main, special, extraString };
};

const getInternalKey = () => {
  try {
    const raw = localStorage.getItem("lotosorte_internal_key");
    return (raw ?? "").trim();
  } catch {
    return "";
  }
};

const requestDreamInterpretation = async (
  dreamText: string,
  game: LotteryGame
) => {
  const internalKey = getInternalKey();
  const response = await fetch(apiUrl("/api/interpret-dream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(internalKey ? { "X-Internal-Key": internalKey } : {}),
    },
    body: JSON.stringify({ dreamText, game }),
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Gemini API request failed with status ${response.status}`;

    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as { error?: unknown };
        if (typeof payload?.error === "string") {
          code = payload.error;
          message = payload.error;
        } else {
          message = JSON.stringify(payload);
        }
      } else {
        const text = await response.text();
        if (text) message = text;
      }
    } catch {
      // ignore parse errors; fall back to generic message.
    }

    throw new ApiError(message, response.status, code);
  }

  const payload = (await response.json()) as DreamInterpretationResponse;
  return parseApiResponse(payload);
};

export const interpretDream = async (
  dreamText: string,
  game: LotteryGame
): Promise<{ main: number[]; special: number[]; extraString?: string }> => {
  const result = await requestDreamInterpretation(dreamText, game);
  const main = result.main || [];
  const special = result.special || [];
  const extraString = result.extraString;

  let validMain = main
    .filter(
      (n: number) =>
        typeof n === "number" && n >= game.minNumber && n <= game.maxNumber
    )
    .slice(0, game.maxCount);

  let validSpecial = [];
  if (game.specialRange) {
    validSpecial = special
      .filter(
        (n: number) =>
          typeof n === "number" &&
          n >= game.specialRange!.min &&
          n <= game.specialRange!.max
      )
      .slice(0, game.specialRange.count);
  }

  if (validMain.length < game.defaultCount) {
    const needed = game.defaultCount - validMain.length;
    const extras = generateRandomNumbers(
      needed,
      game.minNumber,
      game.maxNumber,
      validMain,
      game.allowRepeats
    );
    validMain = [...validMain, ...extras];
  }

  if (game.specialRange && validSpecial.length < game.specialRange.count) {
    const needed = game.specialRange.count - validSpecial.length;
    const extras = generateRandomNumbers(
      needed,
      game.specialRange.min,
      game.specialRange.max,
      validSpecial
    );
    validSpecial = [...validSpecial, ...extras];
  }

  if (!game.allowRepeats) {
    validMain.sort((a: number, b: number) => a - b);
    validSpecial.sort((a: number, b: number) => a - b);
  }

  let validExtraString = extraString;
  if (
    game.extraOptions &&
    (!validExtraString || !game.extraOptions.options.includes(validExtraString))
  ) {
    validExtraString =
      game.extraOptions.options[
        Math.floor(Math.random() * game.extraOptions.options.length)
      ];
  }

  return { main: validMain, special: validSpecial, extraString: validExtraString };
};

export const generateRandomNumbers = (
  count: number,
  min: number,
  max: number,
  exclude: number[] = [],
  allowRepeats: boolean = false
): number[] => {
  if (allowRepeats) {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return result;
  }

  const numbers = new Set<number>(exclude);

  if (max - min + 1 < count) {
    return Array.from({ length: count }, (_, i) => min + i);
  }

  while (numbers.size < count + exclude.length) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }

  const result = Array.from(numbers).filter((n) => !exclude.includes(n));
  return result.sort((a, b) => a - b);
};

