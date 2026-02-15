import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, Clover, Sparkles, Copy, Bookmark, Shield, Dices, ArrowRight, Zap, Trophy, History, BarChart } from 'lucide-react';
import { LotteryGame } from '../types';
import { GAMES, MONTH_NAMES } from '../constants';
import LotteryBall from './LotteryBall';

interface HomeViewProps {
  selectedGameId: string;
  setSelectedGameId: (id: string) => void;
  numCount: number;
  setNumCount: (n: number) => void;
  generatedNumbers: number[];
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
  generatedNumbers,
  specialNumbers,
  extraString,
  isGenerating,
  onGenerate,
  onCopy,
  onSave
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];
  const filteredGames = GAMES.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Close dropdown logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  // Focus Input
  useEffect(() => {
    if (isDropdownOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    else setTimeout(() => setSearchTerm(''), 300);
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pb-8">
      
      {/* 1. HERO SECTION: Adaptive Colors */}
      <div className="flex flex-col items-center text-center mb-6 md:mb-12 w-full max-w-3xl mx-auto px-2 mt-8 md:mt-16">
          
          {/* Headline - Dark Text in Light Mode */}
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 md:mb-4 leading-[1.1] animate-slide-up [animation-delay:100ms]">
            Sua aposta <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-400 bg-[length:200%_auto] animate-shine">
                vencedora.
            </span>
          </h1>

          {/* Subheadline - Slate Text in Light Mode */}
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg max-w-xl mx-auto mb-6 md:mb-8 font-light leading-relaxed animate-slide-up [animation-delay:200ms] hidden md:block">
            Utilize nosso algoritmo proprietário para gerar combinações otimizadas baseadas em padrões históricos e aleatoriedade quântica.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xs mx-auto mb-6 font-light leading-relaxed animate-slide-up [animation-delay:200ms] md:hidden">
            Algoritmo proprietário para combinações otimizadas.
          </p>

      </div>

      {/* 2. THE CONSOLE: Mobile-First Card - Light/Dark Adaptive */}
      <div className="w-full max-w-3xl relative group md:perspective-1000 animate-slide-up [animation-delay:400ms]">
          
          {/* Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-blue-600/10 rounded-[2rem] blur-xl opacity-30 md:opacity-50 group-hover:opacity-70 transition duration-1000"></div>
          
          {/* Main Card */}
          <div className="relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl md:rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors duration-500">
            
            {/* Console Header */}
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] gap-3">
                
                {/* Game Selector (The Dropdown) */}
                <div className="relative z-50 w-full md:w-auto" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-full md:w-64 gap-3 bg-white dark:bg-black/40 active:bg-slate-50 dark:active:bg-black/60 md:hover:bg-slate-50 dark:md:hover:bg-black/60 px-4 py-3 md:py-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all group shadow-sm dark:shadow-none"
                  >
                     <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-${selectedGame.color}-100 dark:bg-${selectedGame.color}-500/20 text-${selectedGame.color}-600 dark:text-${selectedGame.color}-400`}>
                           <Clover size={16} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase">{selectedGame.name}</span>
                     </div>
                     <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 overflow-hidden z-[100] animate-zoom-in">
                      <div className="p-2 border-b border-slate-100 dark:border-white/5">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Filtrar jogo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-400"
                            />
                          </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                        {filteredGames.map(game => (
                          <button
                            key={game.id}
                            onClick={() => { setSelectedGameId(game.id); setIsDropdownOpen(false); }}
                            className={`
                              flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition-all active:scale-[0.98]
                              ${selectedGameId === game.id 
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold' 
                                : 'text-slate-500 dark:text-slate-400 active:bg-slate-50 dark:active:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}
                            `}
                          >
                            <div className={`w-2 h-2 rounded-full ${selectedGameId === game.id ? `bg-${game.color}-500 shadow-[0_0_8px_currentColor]` : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                            <span className="text-sm md:text-xs font-bold uppercase tracking-wider">{game.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration Tabs */}
                {!selectedGame.allowRepeats && (
                    <div className="w-full md:w-auto overflow-x-auto hide-scrollbar">
                      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 min-w-max mx-auto md:mx-0">
                          {[selectedGame.defaultCount, selectedGame.defaultCount + 1, selectedGame.defaultCount + 2]
                            .filter(n => n <= selectedGame.maxCount)
                            .map(n => (
                            <button
                              key={n}
                              onClick={() => setNumCount(n)}
                              className={`
                                flex-1 md:flex-none px-4 md:px-3 py-2 md:py-1 rounded-md text-[11px] md:text-[10px] font-bold transition-all
                                ${numCount === n 
                                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/5' 
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                              `}
                            >
                              {n} Dezenas
                            </button>
                          ))}
                      </div>
                    </div>
                )}
            </div>

            {/* Display Area - Light/Dark Adaptive */}
            <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] bg-slate-50 dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#020617] relative transition-colors duration-500">
               
               {/* Digital Grid Background - Adaptive Opacity */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)] pointer-events-none"></div>

               {generatedNumbers.length === 0 ? (
                  <div className="flex flex-col items-center text-center z-10 opacity-60">
                     <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 animate-pulse shadow-sm dark:shadow-none">
                        <Dices size={28} className="text-slate-400" strokeWidth={1.5} />
                     </div>
                     <h3 className="text-base md:text-lg font-medium text-slate-400 dark:text-slate-300">Aguardando processamento</h3>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">Selecione os parâmetros acima e inicie a geração.</p>
                  </div>
               ) : (
                   <div className="w-full z-10 flex flex-col items-center animate-zoom-in">
                      {/* Main Numbers */}
                      <div className={`
                         flex flex-wrap justify-center gap-2 md:gap-4 mb-6
                         ${selectedGame.id === 'lotomania' ? 'max-w-2xl' : ''}
                      `}>
                         {generatedNumbers.map((num, idx) => {
                              const isSuperSete = selectedGame.id === 'super-sete';
                              const label = isSuperSete ? `C${idx + 1}` : undefined;
                              const size = selectedGame.id === 'lotomania' ? 'small' : 'normal';
                              return (
                                  <LotteryBall 
                                    key={`${selectedGameId}-${num}-${idx}`} 
                                    number={num} 
                                    color={selectedGame.color} 
                                    delay={idx}
                                    label={label}
                                    labelPosition="top"
                                    size={size}
                                  />
                              );
                         })}
                      </div>

                      {/* Extras */}
                      {(specialNumbers.length > 0 || extraString) && (
                         <div className="flex items-center flex-wrap justify-center gap-3 md:gap-4 py-2 md:py-3 px-4 md:px-6 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 backdrop-blur-sm animate-slide-up [animation-delay:200ms] shadow-sm dark:shadow-none">
                             {specialNumbers.map((num, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{selectedGame.specialRange?.label}:</span>
                                    <span className={`text-${selectedGame.color}-500 dark:text-${selectedGame.color}-400 font-bold font-mono text-sm md:text-base`}>
                                        {selectedGame.id === 'dia-de-sorte' ? MONTH_NAMES[num-1].substring(0,3).toUpperCase() : num}
                                    </span>
                                </div>
                             ))}
                             {extraString && (
                                <div className="flex items-center gap-2">
                                    <Shield size={12} className="text-amber-500 dark:text-amber-400" />
                                    <span className="text-amber-600 dark:text-amber-200 font-bold text-[10px] md:text-xs uppercase tracking-wider">{extraString}</span>
                                </div>
                             )}
                         </div>
                      )}
                   </div>
               )}
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={`
                      relative w-full md:flex-1 py-4 md:py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-white shadow-lg overflow-hidden group
                      ${isGenerating ? 'cursor-not-allowed opacity-80' : 'active:scale-[0.97] transition-all duration-150 hover:shadow-emerald-500/20'}
                    `}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-500"></div>
                    <div className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shine_2s_linear_infinite]"></div>
                    
                    <span className="relative flex items-center justify-center gap-3">
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processando...
                            </span>
                        ) : (
                            <>
                                <Sparkles size={18} className="text-emerald-100" />
                                Gerar Jogo
                            </>
                        )}
                    </span>
                </button>

                {generatedNumbers.length > 0 && (
                    <div className="flex w-full md:w-auto gap-2 animate-fade-in">
                        <button 
                          onClick={onCopy}
                          className="flex-1 md:flex-none px-4 py-4 md:py-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 active:text-slate-900 dark:active:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-sm dark:shadow-none"
                        >
                           <Copy size={16} /> Copiar
                        </button>
                        <button 
                          onClick={onSave}
                          className="flex-1 md:flex-none px-4 py-4 md:py-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 active:text-slate-900 dark:active:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-sm dark:shadow-none"
                        >
                           <Bookmark size={16} /> Salvar
                        </button>
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* 3. TRUST SIGNALS: The Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-16 max-w-4xl w-full px-6 opacity-60 grayscale md:hover:grayscale-0 transition-all duration-500">
          {[
              { label: "Algoritmo Quântico", icon: Zap },
              { label: "Base Histórica", icon: History },
              { label: "Análise Preditiva", icon: BarChart },
              { label: "Alta Performance", icon: Trophy }
          ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                  <item.icon size={16} className="text-emerald-500 mb-0 md:mb-1" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 text-center">{item.label}</span>
              </div>
          ))}
      </div>
    </div>
  );
};

export default HomeView;
