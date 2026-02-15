import React, { useState, useEffect } from 'react';
import { GAMES, MONTH_NAMES } from './constants';
import { SavedGame, ViewState } from './types';
import Layout from './components/Layout';
import { generateRandomNumbers } from './services/lotteryNumberService';

// Import newly refactored views
import HomeView from './components/HomeView';
import ResultsView from './components/ResultsView';
import SavedView from './components/SavedView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES[0].id);
  const [numCount, setNumCount] = useState<number>(GAMES[0].defaultCount);
  
  // State for Main Numbers and Special Numbers (e.g. Trevos, Mês)
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [extraString, setExtraString] = useState<string | undefined>(undefined);

  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem('lotosorte_theme');
    if (storedTheme === 'dark') return true;
    if (storedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update DOM when theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('lotosorte_theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('lotosorte_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Update numCount when game changes
  useEffect(() => {
    const game = GAMES.find(g => g.id === selectedGameId);
    if (game) {
      setNumCount(game.defaultCount);
    }
  }, [selectedGameId]);

  // Initial setup only (Load saved games) - Auto-generation removed
  useEffect(() => {
    const saved = localStorage.getItem('lotosorte_saved');
    if (saved) {
      setSavedGames(JSON.parse(saved));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

  // Handler for manual game switching in HomeView
  const handleGameChange = (id: string) => {
    setSelectedGameId(id);
    // Reset data immediately when user switches game manually
    setGeneratedNumbers([]);
    setSpecialNumbers([]);
    setExtraString(undefined);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate slight delay for effect
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate Main Numbers
    const numbers = generateRandomNumbers(numCount, selectedGame.minNumber, selectedGame.maxNumber, [], selectedGame.allowRepeats);
    setGeneratedNumbers(numbers);

    // Generate Special Numbers (if any)
    if (selectedGame.specialRange) {
      const special = generateRandomNumbers(
        selectedGame.specialRange.count,
        selectedGame.specialRange.min,
        selectedGame.specialRange.max
      );
      setSpecialNumbers(special);
    } else {
      setSpecialNumbers([]);
    }

    // Generate Extra String (e.g. Timemania Team)
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
        text = `Meus números para ${selectedGame.name}: ${generatedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}`;
        if (specialNumbers.length > 0 && selectedGame.specialRange) {
            const labels = selectedGame.id === 'dia-de-sorte' 
                ? specialNumbers.map(n => MONTH_NAMES[n-1]).join(', ')
                : specialNumbers.join(', ');
            text += ` | ${selectedGame.specialRange.label}: ${labels}`;
        }
        if (extraString && selectedGame.extraOptions) {
            text += ` | ${selectedGame.extraOptions.label}: ${extraString}`;
        }
    }
    
    navigator.clipboard.writeText(text);
    triggerToast("Copiado para a área de transferência!");
  };

  const saveGame = () => {
    const newSave: SavedGame = {
      id: Date.now().toString(),
      gameId: selectedGame.id,
      numbers: generatedNumbers,
      specialNumbers: specialNumbers.length > 0 ? specialNumbers : undefined,
      extraString: extraString,
      date: new Date().toLocaleDateString('pt-BR')
    };
    const updated = [newSave, ...savedGames];
    setSavedGames(updated);
    localStorage.setItem('lotosorte_saved', JSON.stringify(updated));
    triggerToast("Jogo salvo com sucesso!");
  };

  const deleteSavedGame = (id: string) => {
    const updated = savedGames.filter(g => g.id !== id);
    setSavedGames(updated);
    localStorage.setItem('lotosorte_saved', JSON.stringify(updated));
    triggerToast("Jogo removido.");
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      
      {/* Toast Notification */}
      <div className={`fixed top-20 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 md:top-24 z-[70] transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             {toastMessage}
          </div>
      </div>

      {currentView === 'home' && (
        <HomeView 
          selectedGameId={selectedGameId}
          setSelectedGameId={handleGameChange}
          numCount={numCount}
          setNumCount={setNumCount}
          generatedNumbers={generatedNumbers}
          specialNumbers={specialNumbers}
          extraString={extraString}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onCopy={() => copyToClipboard()}
          onSave={saveGame}
        />
      )}

      {currentView === 'saved' && (
        <SavedView 
          savedGames={savedGames}
          onDelete={deleteSavedGame}
          onCopy={copyToClipboard}
        />
      )}

      {currentView === 'results' && (
        <ResultsView />
      )}

    </Layout>
  );
};

export default App;
