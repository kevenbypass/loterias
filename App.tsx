import React, { Suspense, lazy, useEffect, useState } from "react";
import { GAMES, MONTH_NAMES } from "./constants";
import { SavedGame, ViewState } from "./types";
import Layout from "./components/Layout";
import {
  generateRandomNumbers,
  generateSuperSeteNumbers,
} from "./services/lotteryNumberService";
import { clampCount, getMainCountConfig, getSpecialCountConfig } from "./utils/gameConfig";

import HomeView from "./components/HomeView";
const ResultsView = lazy(() => import("./components/ResultsView"));
const SavedView = lazy(() => import("./components/SavedView"));

const generateSavedGameId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatSuperSeteByColumn = (numbers: number[], labels: string[]): string => {
  const grouped = new Map<string, number[]>();

  labels.forEach((label, index) => {
    const number = numbers[index];
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)?.push(number);
  });

  return Array.from(grouped.entries())
    .map(([label, values]) => `${label}: ${values.join(", ")}`)
    .join(" | ");
};

const initialMainCountConfig = getMainCountConfig(GAMES[0]);
const initialSpecialCountConfig = getSpecialCountConfig(GAMES[0].specialRange);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES[0].id);
  const [numCount, setNumCount] = useState<number>(initialMainCountConfig.default);
  const [specialCount, setSpecialCount] = useState<number>(initialSpecialCountConfig?.default ?? 0);

  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [generatedNumberLabels, setGeneratedNumberLabels] = useState<string[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [extraString, setExtraString] = useState<string | undefined>(undefined);

  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem("lotosorte_theme");
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("lotosorte_theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("lotosorte_theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const game = GAMES.find((g) => g.id === selectedGameId);
    if (!game) return;

    const mainConfig = getMainCountConfig(game);
    const specialConfig = getSpecialCountConfig(game.specialRange);
    setNumCount(mainConfig.default);
    setSpecialCount(specialConfig?.default ?? 0);
  }, [selectedGameId]);

  useEffect(() => {
    try {
      localStorage.removeItem("lotosorte_internal_key");
    } catch {
      // ignore
    }

    const saved = localStorage.getItem("lotosorte_saved");
    if (saved) {
      try {
        setSavedGames(JSON.parse(saved) as SavedGame[]);
      } catch {
        setSavedGames([]);
      }
    }
  }, []);

  const selectedGame = GAMES.find((g) => g.id === selectedGameId) || GAMES[0];

  const handleGameChange = (id: string) => {
    setSelectedGameId(id);
    setGeneratedNumbers([]);
    setGeneratedNumberLabels([]);
    setSpecialNumbers([]);
    setExtraString(undefined);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mainConfig = getMainCountConfig(selectedGame);
    const safeMainCount = clampCount(numCount, mainConfig.min, mainConfig.max);
    setNumCount(safeMainCount);

    if (selectedGame.id === "super-sete") {
      const picks = generateSuperSeteNumbers(safeMainCount);
      setGeneratedNumbers(picks.map((pick) => pick.number));
      setGeneratedNumberLabels(picks.map((pick) => pick.label));
    } else {
      const numbers = generateRandomNumbers(
        safeMainCount,
        selectedGame.minNumber,
        selectedGame.maxNumber,
        [],
        selectedGame.allowRepeats
      );
      setGeneratedNumbers(numbers);
      setGeneratedNumberLabels([]);
    }

    if (selectedGame.specialRange) {
      const specialConfig = getSpecialCountConfig(selectedGame.specialRange);
      const safeSpecialCount = specialConfig
        ? clampCount(specialCount, specialConfig.min, specialConfig.max)
        : selectedGame.specialRange.count ?? 0;
      setSpecialCount(safeSpecialCount);

      const special = generateRandomNumbers(
        safeSpecialCount,
        selectedGame.specialRange.min,
        selectedGame.specialRange.max
      );
      setSpecialNumbers(special);
    } else {
      setSpecialNumbers([]);
    }

    if (selectedGame.extraOptions) {
      const options = selectedGame.extraOptions.options;
      const randomChoice = options[Math.floor(Math.random() * options.length)];
      setExtraString(randomChoice);
    } else {
      setExtraString(undefined);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = (textToCopy?: string) => {
    let text = textToCopy;

    if (!text) {
      if (
        selectedGame.id === "super-sete" &&
        generatedNumberLabels.length === generatedNumbers.length
      ) {
        text = `Meus numeros para ${selectedGame.name}: ${formatSuperSeteByColumn(
          generatedNumbers,
          generatedNumberLabels
        )}`;
      } else {
        const useRawDigits = selectedGame.id === "federal";
        text = `Meus numeros para ${selectedGame.name}: ${generatedNumbers
          .map((n) => (useRawDigits ? String(n) : n.toString().padStart(2, "0")))
          .join(", ")}`;
      }

      if (specialNumbers.length > 0 && selectedGame.specialRange) {
        const labels =
          selectedGame.id === "dia-de-sorte"
            ? specialNumbers.map((n) => MONTH_NAMES[n - 1] || String(n)).join(", ")
            : specialNumbers.join(", ");
        text += ` | ${selectedGame.specialRange.label}: ${labels}`;
      }

      if (extraString && selectedGame.extraOptions) {
        text += ` | ${selectedGame.extraOptions.label}: ${extraString}`;
      }
    }

    navigator.clipboard.writeText(text);
    triggerToast("Copiado para a area de transferencia!");
  };

  const saveGame = () => {
    const newSave: SavedGame = {
      id: generateSavedGameId(),
      gameId: selectedGame.id,
      numbers: generatedNumbers,
      numberLabels:
        generatedNumberLabels.length === generatedNumbers.length ? generatedNumberLabels : undefined,
      specialNumbers: specialNumbers.length > 0 ? specialNumbers : undefined,
      extraString,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    const updated = [newSave, ...savedGames];
    setSavedGames(updated);
    localStorage.setItem("lotosorte_saved", JSON.stringify(updated));
    triggerToast("Jogo salvo com sucesso!");
  };

  const deleteSavedGame = (id: string) => {
    const updated = savedGames.filter((g) => g.id !== id);
    setSavedGames(updated);
    localStorage.setItem("lotosorte_saved", JSON.stringify(updated));
    triggerToast("Jogo removido.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const viewFallback = (
    <div className="w-full max-w-4xl mx-auto pt-6 md:pt-10">
      <div className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_24px_90px_-72px_var(--shadow)] p-6 md:p-8">
        <div className="h-7 w-56 bg-black/10 dark:bg-white/10 rounded-2xl" />
        <div className="mt-3 h-4 w-72 bg-black/10 dark:bg-white/10 rounded-2xl" />
        <div className="mt-8 grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="ticket-cut h-36 bg-black/5 dark:bg-white/5 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ticket-cut w-full max-w-xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_34px_110px_-62px_var(--shadow)] p-6 md:p-7 animate-zoom-in">
            <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight text-[color:var(--ink)]">
              Aviso Importante
            </h2>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-[color:var(--muted)]">
              Este site e apenas um gerador de numeros para apostas das Loterias Caixa.
            </p>
            <div className="mt-4 rounded-2xl bg-[color:var(--surface-2)] border border-[color:var(--border)] p-4">
              <p className="text-sm leading-relaxed text-[color:var(--ink)]">
                Nao somos afiliados a Caixa Economica Federal e nao operamos apostas, pagamentos,
                sorteios oficiais ou qualquer servico vinculado ao sistema oficial da Caixa.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                Para apostar de forma oficial, utilize somente os canais autorizados da Caixa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDisclaimerModal(false)}
              className="mt-6 w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold tracking-wide shadow-[0_18px_54px_-34px_rgba(16,185,129,0.9)] active:scale-[0.99]"
            >
              Entendi, continuar
            </button>
          </div>
        </div>
      )}

      <div
        className={`fixed top-20 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 md:top-24 z-[70] transition-all duration-300 ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] backdrop-blur-xl shadow-[0_22px_70px_-54px_var(--shadow)] px-5 py-3 font-extrabold text-sm text-[color:var(--ink)] flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-400 animate-pulse shadow-[0_0_18px_rgba(16,185,129,0.65)]"></span>
          {toastMessage}
        </div>
      </div>

      {currentView === "home" && (
        <HomeView
          selectedGameId={selectedGameId}
          setSelectedGameId={handleGameChange}
          numCount={numCount}
          setNumCount={setNumCount}
          specialCount={specialCount}
          setSpecialCount={setSpecialCount}
          generatedNumbers={generatedNumbers}
          generatedNumberLabels={generatedNumberLabels}
          specialNumbers={specialNumbers}
          extraString={extraString}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onCopy={() => copyToClipboard()}
          onSave={saveGame}
        />
      )}

      {currentView === "saved" && (
        <Suspense fallback={viewFallback}>
          <SavedView savedGames={savedGames} onDelete={deleteSavedGame} onCopy={copyToClipboard} />
        </Suspense>
      )}

      {currentView === "results" && (
        <Suspense fallback={viewFallback}>
          <ResultsView />
        </Suspense>
      )}
    </Layout>
  );
};

export default App;
