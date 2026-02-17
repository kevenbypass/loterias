import React, { useEffect, useRef, useState } from "react";
import { Trophy, Calendar, RefreshCw, AlertCircle, Plus, Shield } from "lucide-react";
import { GAMES, MONTH_NAMES } from "../constants";
import { LotteryResult } from "../types";
import { fetchAllResults } from "../services/officialLotteryService";
import LotteryBall from "./LotteryBall";
import { sanitizeGameColor } from "../utils/gameColors";

const ResultsView: React.FC = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const inFlightRef = useRef(false);

  const AUTO_REFRESH_MS = 5 * 60 * 1000;

  const loadData = async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const data = await fetchAllResults({ force });
      setResults(data);
      setError(false);
      setLastUpdatedAt(new Date());
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadData();

    const intervalId = window.setInterval(() => {
      loadData({ silent: true });
    }, AUTO_REFRESH_MS);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        loadData({ silent: true });
      }
    };

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-6 md:pt-10">
        <div className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_24px_90px_-72px_var(--shadow)] p-6 md:p-8">
          <div className="h-7 w-56 bg-black/10 dark:bg-white/10 rounded-2xl" />
          <div className="mt-3 h-4 w-72 bg-black/10 dark:bg-white/10 rounded-2xl" />
          <div className="mt-8 grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ticket-cut h-44 bg-black/5 dark:bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[color:var(--ink)] flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-[22px] bg-[color:var(--surface)] border border-[color:var(--border)]">
              <Trophy size={24} className="text-[color:var(--gold)]" />
            </span>
            Resultados Oficiais
          </h2>
          <p className="mt-3 text-sm md:text-base text-[color:var(--muted)] font-semibold flex items-center gap-2">
            <span className={"w-2.5 h-2.5 rounded-full " + (refreshing ? "bg-[color:var(--gold)] animate-pulse" : "bg-emerald-500 animate-pulse")} />
            {refreshing
              ? "Atualizando agora..."
              : lastUpdatedAt
              ? `Atualizado às ${lastUpdatedAt.toLocaleTimeString("pt-BR")}`
              : "Atualizado pela Caixa"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData({ force: true })}
          disabled={loading || refreshing}
          className={[
            "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[22px] font-extrabold tracking-wide",
            "bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl",
            "hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
            (loading || refreshing) ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]",
          ].join(" ")}
        >
          <RefreshCw size={18} className={(loading || refreshing) ? "animate-spin text-[color:var(--muted)]" : "text-[color:var(--muted)]"} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_22px_80px_-68px_var(--shadow)] p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-[20px] bg-amber-500/10 border border-amber-500/20">
                <AlertCircle size={20} className="text-amber-500" />
              </span>
              <div>
                <div className="font-black tracking-tight text-[color:var(--ink)]">Não foi possível carregar agora</div>
                <div className="text-sm text-[color:var(--muted)] font-semibold">
                  A API pode oscilar. Tente atualizar em alguns segundos.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadData({ force: true })}
              className="px-5 py-3 rounded-[22px] font-extrabold tracking-wide bg-emerald-600 text-white shadow-[0_22px_70px_-54px_rgba(16,185,129,0.95)] active:scale-[0.98]"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {results.map((result) => {
          const gameDef = GAMES.find((g) => g.id === result.gameId);
          if (!gameDef) return null;
          const gameColor = sanitizeGameColor(gameDef.color);
          const specialColor = sanitizeGameColor(gameDef.specialRange?.color || "emerald");

          return (
            <div key={result.gameId} className="relative">
              <div className="ticket-cut relative overflow-hidden bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_26px_100px_-74px_var(--shadow)]">
                <div className={`h-2 w-full bg-gradient-to-r from-${gameColor}-500 to-${gameColor}-600`} />

                <div className="p-5 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-black tracking-tight text-[color:var(--ink)]">
                        {gameDef.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-wide text-[color:var(--muted)]">
                        <span className="px-2.5 py-1 rounded-full bg-[color:var(--surface-2)] border border-[color:var(--border)]">
                          CONCURSO {result.contestNumber}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} /> {result.date}
                        </span>
                      </div>
                    </div>

                    {result.accumulated && (
                      <span className="self-start px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-600 text-white shadow-[0_18px_60px_-44px_rgba(79,70,229,0.65)]">
                        Acumulou
                      </span>
                    )}
                  </div>

                  <div className="mt-6 ticket-cut bg-[color:var(--surface-2)] border border-[color:var(--border)] p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                      {result.numbers.map((n, i) => (
                        <LotteryBall key={i} number={n} color={gameColor} size="small" delay={i} />
                      ))}

                      {result.specialNumbers && result.specialNumbers.length > 0 && (
                        <>
                          <span className="mx-1 text-[color:var(--muted)] font-black">
                            <Plus size={16} />
                          </span>
                          {result.specialNumbers.map((n, i) => (
                            <LotteryBall
                              key={`sp-${i}`}
                              number={n}
                              color={specialColor}
                              size="small"
                              label={gameDef.id === "dia-de-sorte" ? MONTH_NAMES[n - 1]?.substring(0, 3) : undefined}
                              labelPosition="bottom"
                            />
                          ))}
                        </>
                      )}

                      {result.extraString && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)]">
                          <Shield size={14} className="text-[color:var(--gold)]" />
                          <span className="text-xs font-extrabold tracking-wide uppercase text-[color:var(--ink)]">
                            {result.extraString}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black tracking-widest uppercase text-[color:var(--muted)]">
                        Próximo prêmio
                      </div>
                      <div className="mt-1 font-display text-2xl md:text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-300">
                        {result.nextPrize}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[10px] font-black tracking-widest uppercase text-[color:var(--muted)]">
                        Próximo sorteio
                      </div>
                      <div className="mt-1 font-mono font-black text-[color:var(--ink)]">{result.nextDate}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-[-10px] left-0 right-0 z-10 h-4 receipt-zigzag bg-[color:var(--surface)]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center text-xs font-semibold text-[color:var(--muted)] flex items-center justify-center gap-2">
        {error && <AlertCircle size={12} className="text-amber-500" />}
        Dados obtidos via endpoint oficial (sujeito a disponibilidade).
      </div>
    </div>
  );
};

export default ResultsView;
