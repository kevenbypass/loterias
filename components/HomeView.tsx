import React, { useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Clover,
  Sparkles,
  Copy,
  Bookmark,
  Shield,
  Dices,
  Zap,
  Trophy,
  History,
  ExternalLink,
} from "lucide-react";
import { GAMES, MONTH_NAMES } from "../constants";
import LotteryBall from "./LotteryBall";
import GameIcon from "./GameIcon";
import { sanitizeGameColor } from "../utils/gameColors";
import {
  getMainCountConfig,
  getMainCountLabel,
  getSpecialCountConfig,
  getSuperSeteColumnRule,
} from "../utils/gameConfig";

interface HomeViewProps {
  selectedGameId: string;
  setSelectedGameId: (id: string) => void;
  numCount: number;
  setNumCount: (n: number) => void;
  specialCount: number;
  setSpecialCount: (n: number) => void;
  generatedNumbers: number[];
  generatedNumberLabels: string[];
  specialNumbers: number[];
  extraString?: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onSave: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  selectedGameId,
  setSelectedGameId,
  numCount,
  setNumCount,
  specialCount,
  setSpecialCount,
  generatedNumbers,
  generatedNumberLabels,
  specialNumbers,
  extraString,
  isGenerating,
  onGenerate,
  onCopy,
  onSave,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedGame = GAMES.find((g) => g.id === selectedGameId) || GAMES[0];
  const selectedGameColor = sanitizeGameColor(selectedGame.color);
  const selectedMainCountConfig = getMainCountConfig(selectedGame);
  const selectedSpecialCountConfig = getSpecialCountConfig(selectedGame.specialRange);
  const selectedMainCountLabel = getMainCountLabel(selectedGame);

  const filteredGames = GAMES.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setTimeout(() => setSearchTerm(""), 250);
    }
  }, [isDropdownOpen]);

  const getRangeLabel = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return "";

    const config = getMainCountConfig(game);
    const label = getMainCountLabel(game);
    if (config.min === config.max) {
      return `${config.default} ${label}`;
    }
    return `${config.min} a ${config.max} ${label}`;
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-8">
      <section className="w-full max-w-4xl mx-auto text-center pt-2 md:pt-6">
        <div className="relative px-1">
          <Clover
            className="absolute left-1/2 top-0 -translate-x-1/2 w-[280px] h-[280px] md:w-[460px] md:h-[460px] text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none"
            strokeWidth={1.1}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_14px_40px_-30px_var(--shadow)]">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-400 text-white shadow-[0_14px_40px_-30px_rgba(16,185,129,0.9)]">
                <Clover size={16} />
              </span>
              <span className="text-xs md:text-sm font-extrabold tracking-wide text-[color:var(--ink)]">
                Gerador de bilhetes
              </span>
            </div>

            <h1 className="mt-6 md:mt-8 font-display text-4xl md:text-7xl font-black tracking-tight leading-[0.95] text-[color:var(--ink)]">
              Sua aposta{" "}
              <span className="block text-transparent bg-clip-text bg-[linear-gradient(90deg,oklch(0.75_0.18_155),oklch(0.78_0.15_170),oklch(0.86_0.16_85))]">
                vencedora.
              </span>
            </h1>

            <p className="mt-4 md:mt-5 text-sm md:text-lg leading-relaxed text-[color:var(--muted)] max-w-2xl mx-auto">
              Escolha o jogo, ajuste a quantidade e gere um bilhete no formato da Caixa.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto mt-8 md:mt-12">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-[30px] bg-[radial-gradient(800px_circle_at_25%_0%,rgba(16,185,129,0.35),transparent_55%),radial-gradient(700px_circle_at_85%_15%,rgba(250,204,21,0.25),transparent_60%)] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />

          <div className="ticket-cut relative overflow-hidden backdrop-blur-xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_28px_90px_-54px_var(--shadow)]">
            <div className="absolute inset-0 pointer-events-none clover-pattern opacity-[0.10] dark:opacity-[0.07]" />

            <div className="relative px-5 py-5 md:px-7 md:py-6 bg-[color:var(--surface-2)] border-b border-[color:var(--border)] flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                <div className="relative z-50 w-full md:w-auto" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-full md:w-[360px] gap-3 px-4 py-3 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_14px_50px_-40px_var(--shadow)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GameIcon game={selectedGame} size="md" />
                      <div className="min-w-0 text-left">
                        <span className="block text-[10px] font-extrabold tracking-widest uppercase text-[color:var(--muted)]">
                          Jogo
                        </span>
                        <span className="block font-black tracking-tight text-[color:var(--ink)] truncate">
                          {selectedGame.name}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-[color:var(--muted)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full md:w-[460px] ticket-cut bg-[color:var(--surface)] backdrop-blur-xl border border-[color:var(--border)] shadow-[0_26px_70px_-44px_var(--shadow)] overflow-hidden z-[100] animate-zoom-in">
                      <div className="p-3 border-b border-[color:var(--border)] bg-[color:var(--surface-2)]">
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
                          />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Filtrar jogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2.5 pl-9 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/35"
                          />
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredGames.length === 0 && (
                          <div className="px-3 py-4 text-sm text-[color:var(--muted)]">
                            Nenhum jogo encontrado.
                          </div>
                        )}

                        {filteredGames.map((game) => {
                          const active = selectedGameId === game.id;
                          return (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => {
                                setSelectedGameId(game.id);
                                setIsDropdownOpen(false);
                              }}
                              className={[
                                "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-colors border",
                                active
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-[color:var(--ink)]"
                                  : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[color:var(--muted)]",
                              ].join(" ")}
                            >
                              <GameIcon game={game} size="sm" />
                              <div className="min-w-0">
                                <span className="block font-extrabold tracking-tight truncate">{game.name}</span>
                                <span className="block text-[11px] font-bold tracking-wide opacity-80">
                                  {getRangeLabel(game.id)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold tracking-wide text-[color:var(--muted)]">
                    <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedGame.selectionHint}</span>
                    <a
                      href={selectedGame.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-[color:var(--ink)]"
                    >
                      Regra oficial
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold tracking-widest uppercase text-[color:var(--muted)]">
                      Quantidade de {selectedMainCountLabel}
                    </span>
                    <span className="text-xs font-black tracking-wide text-[color:var(--ink)]">
                      {numCount}
                    </span>
                  </div>

                  {selectedMainCountConfig.min === selectedMainCountConfig.max ? (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] text-xs font-extrabold text-[color:var(--muted)]">
                      Valor fixo: {selectedMainCountConfig.default}
                    </div>
                  ) : (
                    <>
                      <input
                        type="range"
                        min={selectedMainCountConfig.min}
                        max={selectedMainCountConfig.max}
                        value={numCount}
                        onChange={(e) => setNumCount(Number(e.target.value))}
                        className="mt-2 w-full accent-emerald-600"
                      />
                      <div className="mt-2 w-full overflow-x-auto hide-scrollbar">
                        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] min-w-max">
                          {Array.from(
                            { length: selectedMainCountConfig.max - selectedMainCountConfig.min + 1 },
                            (_, idx) => selectedMainCountConfig.min + idx
                          ).map((n) => {
                            const active = numCount === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setNumCount(n)}
                                className={[
                                  "px-3 py-2 rounded-2xl text-xs font-extrabold tracking-wide transition-all",
                                  active
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_18px_50px_-36px_rgba(16,185,129,0.95)]"
                                    : "text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/5",
                                ].join(" ")}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {selectedSpecialCountConfig && (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold tracking-widest uppercase text-[color:var(--muted)]">
                        {selectedGame.specialRange?.label}
                      </span>
                      <span className="text-xs font-black tracking-wide text-[color:var(--ink)]">
                        {specialCount}
                      </span>
                    </div>

                    {selectedSpecialCountConfig.min === selectedSpecialCountConfig.max ? (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] text-xs font-extrabold text-[color:var(--muted)]">
                        Valor fixo: {selectedSpecialCountConfig.default}
                      </div>
                    ) : (
                      <>
                        <input
                          type="range"
                          min={selectedSpecialCountConfig.min}
                          max={selectedSpecialCountConfig.max}
                          value={specialCount}
                          onChange={(e) => setSpecialCount(Number(e.target.value))}
                          className="mt-2 w-full accent-emerald-600"
                        />
                        <div className="mt-2 w-full overflow-x-auto hide-scrollbar">
                          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] min-w-max">
                            {Array.from(
                              {
                                length:
                                  selectedSpecialCountConfig.max - selectedSpecialCountConfig.min + 1,
                              },
                              (_, idx) => selectedSpecialCountConfig.min + idx
                            ).map((n) => {
                              const active = specialCount === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setSpecialCount(n)}
                                  className={[
                                    "px-3 py-2 rounded-2xl text-xs font-extrabold tracking-wide transition-all",
                                    active
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_18px_50px_-36px_rgba(16,185,129,0.95)]"
                                      : "text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/5",
                                  ].join(" ")}
                                >
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedGame.id === "super-sete" && (
                  <div className="text-[11px] font-bold tracking-wide text-[color:var(--muted)]">
                    Regra por coluna: {getSuperSeteColumnRule(numCount)}
                  </div>
                )}
              </div>
            </div>

            <div className="relative p-6 md:p-10">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(850px_circle_at_50%_0%,rgba(16,185,129,0.10),transparent_60%)]" />

              {generatedNumbers.length === 0 ? (
                <div className="relative flex flex-col items-center text-center py-14 md:py-16">
                  <div className="w-16 h-16 rounded-[26px] bg-[color:var(--surface-2)] border border-[color:var(--border)] shadow-[0_18px_60px_-44px_var(--shadow)] flex items-center justify-center">
                    <Dices
                      size={28}
                      className="text-emerald-600 dark:text-emerald-400"
                      strokeWidth={1.7}
                    />
                  </div>
                  <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
                    Pronto para girar
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)] max-w-sm">
                    Escolha o jogo, ajuste as quantidades e aperte{" "}
                    <span className="font-extrabold text-[color:var(--ink)]">Gerar bilhete</span>.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="ticket-cut bg-[color:var(--surface-2)] border border-[color:var(--border)] shadow-[0_18px_70px_-52px_var(--shadow)] p-5 md:p-7">
                    <div
                      className={`flex flex-wrap justify-center gap-2 md:gap-4 ${
                        selectedGame.id === "lotomania" ? "max-w-3xl mx-auto" : ""
                      }`}
                    >
                      {generatedNumbers.map((num, idx) => {
                        const label =
                          generatedNumberLabels[idx] ||
                          (selectedGame.id === "super-sete" ? `C${idx + 1}` : undefined);
                        const size = selectedGame.id === "lotomania" ? "small" : "normal";

                        return (
                          <LotteryBall
                            key={`${selectedGameId}-${num}-${idx}`}
                            number={num}
                            color={selectedGameColor}
                            delay={idx}
                            label={label}
                            labelPosition="top"
                            size={size}
                          />
                        );
                      })}
                    </div>

                    {(specialNumbers.length > 0 || extraString) && (
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                        {specialNumbers.map((num, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/5 border border-[color:var(--border)]"
                          >
                            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[color:var(--muted)]">
                              {selectedGame.specialRange?.label}
                            </span>
                            <span
                              className={`font-mono font-black text-${selectedGameColor}-600 dark:text-${selectedGameColor}-300`}
                            >
                              {selectedGame.id === "dia-de-sorte"
                                ? MONTH_NAMES[num - 1]?.substring(0, 3).toUpperCase()
                                : num}
                            </span>
                          </div>
                        ))}

                        {extraString && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/5 border border-[color:var(--border)]">
                            <Shield size={14} className="text-[color:var(--gold)]" />
                            <span className="text-xs font-extrabold tracking-wide uppercase text-[color:var(--ink)]">
                              {extraString}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative px-5 py-5 md:px-7 md:py-6 bg-[color:var(--surface-2)] border-t border-[color:var(--border)] flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className={[
                  "relative w-full md:flex-1 px-6 py-4 rounded-[22px] font-black uppercase tracking-widest text-sm text-white overflow-hidden",
                  "shadow-[0_22px_70px_-48px_rgba(16,185,129,0.95)] transition-transform",
                  isGenerating
                    ? "opacity-80 cursor-not-allowed"
                    : "active:scale-[0.98] hover:brightness-[1.03]",
                ].join(" ")}
              >
                <span className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.66_0.18_155),oklch(0.76_0.15_170),oklch(0.84_0.16_85))]" />
                <span className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.22)_50%,transparent_75%,transparent_100%)] bg-[length:240%_240%] animate-shine" />
                <span className="relative flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="text-white/90" />
                      Gerar bilhete
                    </>
                  )}
                </span>
              </button>

              {generatedNumbers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="flex-1 px-4 py-4 rounded-[22px] bg-[color:var(--surface)] border border-[color:var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-extrabold uppercase tracking-widest text-xs text-[color:var(--ink)] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    className="flex-1 px-4 py-4 rounded-[22px] bg-[color:var(--surface)] border border-[color:var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-extrabold uppercase tracking-widest text-xs text-[color:var(--ink)] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Bookmark size={16} />
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto mt-10 md:mt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Trevo Verde", icon: Clover },
            { label: "Bilhete rapido", icon: Zap },
            { label: "Historico na mao", icon: History },
            { label: "Resultados oficiais", icon: Trophy },
          ].map((item, i) => (
            <div
              key={i}
              className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl px-4 py-4 shadow-[0_16px_60px_-50px_var(--shadow)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <item.icon size={18} />
                </span>
                <div className="text-left">
                  <div className="text-[11px] font-black tracking-wide text-[color:var(--ink)]">
                    {item.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
