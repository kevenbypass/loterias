import React from "react";
import { Bookmark, Copy, Trash2, Shield } from "lucide-react";
import { SavedGame } from "../types";
import { GAMES, MONTH_NAMES } from "../constants";
import { sanitizeGameColor } from "../utils/gameColors";

interface SavedViewProps {
  savedGames: SavedGame[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

const SavedView: React.FC<SavedViewProps> = ({ savedGames, onDelete, onCopy }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[color:var(--ink)] flex items-center justify-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-[22px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <Bookmark size={26} />
          </span>
          Bilhetes Salvos
        </h2>
        <p className="mt-3 text-sm md:text-base text-[color:var(--muted)] font-semibold">
          Seus palpites guardados, prontos para copiar.
        </p>
      </div>

      {savedGames.length === 0 ? (
        <div className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_22px_80px_-64px_var(--shadow)] px-6 py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-[26px] bg-[color:var(--surface-2)] border border-[color:var(--border)] flex items-center justify-center">
            <Bookmark size={28} className="text-[color:var(--muted)]" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-black tracking-tight">Nada salvo ainda</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)] max-w-sm mx-auto">
            Gere um bilhete na Home e toque em <span className="font-extrabold text-[color:var(--ink)]">Salvar</span>.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {savedGames.map((game) => {
            const gameDef = GAMES.find((g) => g.id === game.gameId) || GAMES[0];
            const gameColor = sanitizeGameColor(gameDef.color);
            const dense = game.numbers.length > 20;

            return (
              <div
                key={game.id}
                className="ticket-cut relative overflow-hidden bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_24px_90px_-68px_var(--shadow)]"
              >
                <div className={`h-2 w-full bg-gradient-to-r from-${gameColor}-500 to-${gameColor}-600`} />

                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-${gameColor}-100 dark:bg-${gameColor}-500/20 text-${gameColor}-700 dark:text-${gameColor}-300 border border-${gameColor}-200/60 dark:border-${gameColor}-500/30`}
                        >
                          {gameDef.name}
                        </span>
                        <span className="text-xs font-bold tracking-wide text-[color:var(--muted)]">
                          {game.date}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {game.numbers.map((n, i) => (
                          <span
                            key={i}
                            className={[
                              "inline-flex items-center justify-center rounded-[18px] bg-[color:var(--surface-2)] border border-[color:var(--border)] font-mono font-black text-[color:var(--ink)] shadow-[0_12px_40px_-32px_var(--shadow)]",
                              dense ? "w-8 h-8 text-[11px]" : "w-10 h-10 text-sm",
                            ].join(" ")}
                          >
                            {n.toString().padStart(2, "0")}
                          </span>
                        ))}

                        {game.specialNumbers && game.specialNumbers.length > 0 && (
                          <>
                            <span className="mx-1 text-[color:var(--muted)] font-black">+</span>
                            {game.specialNumbers.map((n, i) => (
                              <span
                                key={`s-${i}`}
                                className={[
                                  "inline-flex items-center justify-center rounded-[18px] bg-emerald-500/10 border border-emerald-500/20 font-mono font-black text-emerald-700 dark:text-emerald-300",
                                  dense ? "w-8 h-8 text-[11px]" : "w-10 h-10 text-sm",
                                ].join(" ")}
                              >
                                {gameDef.id === "dia-de-sorte"
                                  ? MONTH_NAMES[n - 1]?.substring(0, 3).toUpperCase()
                                  : n.toString().padStart(2, "0")}
                              </span>
                            ))}
                          </>
                        )}

                        {game.extraString && (
                          <span className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[color:var(--surface-2)] border border-[color:var(--border)] text-xs font-extrabold tracking-wide text-[color:var(--ink)]">
                            <Shield size={14} className="text-[color:var(--gold)]" />
                            <span className="uppercase">{game.extraString}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:self-start">
                      <button
                        type="button"
                        onClick={() => {
                          let text = `Jogar em ${gameDef.name}: ${game.numbers.join(", ")}`;
                          if (game.specialNumbers) text += ` + ${game.specialNumbers.join(", ")}`;
                          if (game.extraString) text += ` + ${game.extraString}`;
                          onCopy(text);
                        }}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-[20px] bg-[color:var(--surface-2)] border border-[color:var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Copiar"
                      >
                        <Copy size={18} className="text-[color:var(--muted)]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(game.id)}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-[20px] bg-[color:var(--surface-2)] border border-[color:var(--border)] hover:bg-red-500/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedView;
