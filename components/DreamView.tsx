import React, { useState } from 'react';
import { Wand2, Sparkles, ChevronDown, Clover } from 'lucide-react';
import { LotteryGame } from '../types';
import { GAMES } from '../constants';

interface DreamViewProps {
  dreamText: string;
  setDreamText: (text: string) => void;
  onInterpret: (gameId: string) => void;
  isGenerating: boolean;
  selectedGame: LotteryGame; // Passed as initial value
}

const DreamView: React.FC<DreamViewProps> = ({ 
  dreamText, 
  setDreamText, 
  onInterpret, 
  isGenerating, 
  selectedGame 
}) => {
  const [localGameId, setLocalGameId] = useState<string>(selectedGame.id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const targetGame = GAMES.find(g => g.id === localGameId) || GAMES[0];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] animate-zoom-in pb-20">
      <div className="text-center mb-8 mt-4">
        <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Wand2 size={40} className="relative z-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-300 dark:to-indigo-400 tracking-tight">
          Interpretador de Sonhos
        </h2>
        <p className="text-slate-500 dark:text-gray-400 mt-3 text-base max-w-md mx-auto">
            A IA transforma os elementos do seu sonho em números da sorte para o jogo que você escolher.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-white/5 backdrop-blur-xl border border-purple-200 dark:border-purple-500/20 rounded-3xl p-6 shadow-2xl relative z-10">
        
        {/* Game Selector - Independent from Home */}
        <div className="relative mb-5 z-50">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">
                Para qual jogo é o seu sonho?
            </label>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all 
                    bg-slate-50 dark:bg-black/20 text-slate-700 dark:text-white 
                    hover:border-purple-400 dark:hover:border-purple-500/50
                    ${isDropdownOpen ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-slate-100 dark:border-white/10'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        bg-${targetGame.color}-100 dark:bg-${targetGame.color}-900/40 
                        text-${targetGame.color}-600 dark:text-${targetGame.color}-400
                    `}>
                        <Clover size={16} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-sm leading-tight">{targetGame.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {targetGame.defaultCount} dezenas
                        </span>
                    </div>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown List */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-slide-up">
                    <div className="p-1">
                        {GAMES.map(game => (
                            <button
                                key={game.id}
                                onClick={() => { setLocalGameId(game.id); setIsDropdownOpen(false); }}
                                className={`
                                    w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors
                                    ${localGameId === game.id 
                                        ? 'bg-purple-50 dark:bg-purple-500/20' 
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                                `}
                            >
                                <div className={`w-2 h-2 rounded-full bg-${game.color}-500 shadow-[0_0_8px_currentColor]`}></div>
                                <span className={`text-sm font-bold ${localGameId === game.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {game.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Text Area */}
        <div className="relative">
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Descreva seu sonho com detalhes... Ex: Sonhei que estava voando sobre um campo verde e encontrava uma chave dourada..."
              className="w-full h-40 bg-slate-50 dark:bg-black/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 resize-none transition-all duration-300"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                IA
            </div>
        </div>

        <button
          onClick={() => onInterpret(localGameId)}
          disabled={isGenerating || !dreamText.trim()}
          className={`
            w-full mt-6 py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-900/20
            bg-gradient-to-r from-purple-600 to-indigo-600 
            hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99]
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center gap-2 group
          `}
        >
          {isGenerating ? (
              <span className="flex items-center gap-2">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Interpretando...
              </span>
          ) : (
              <>
                <Sparkles size={20} className="group-hover:animate-pulse" />
                Gerar Palpite para {targetGame.name}
              </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DreamView;