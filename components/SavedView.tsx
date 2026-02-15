import React from 'react';
import { Bookmark, Copy, Trash2, Wand2, Shield, Plus } from 'lucide-react';
import { SavedGame, LotteryGame } from '../types';
import { GAMES, MONTH_NAMES } from '../constants';

interface SavedViewProps {
  savedGames: SavedGame[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

const SavedView: React.FC<SavedViewProps> = ({ savedGames, onDelete, onCopy }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in duration-500">
      <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white flex items-center justify-center gap-3">
        <Bookmark className="text-emerald-500" size={32} />
        Jogos Salvos
      </h2>

      {savedGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <Bookmark size={40} className="opacity-50" />
          </div>
          <p className="font-medium">Nenhum palpite salvo ainda.</p>
          <p className="text-sm mt-2">Gere novos números e salve para ver aqui.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedGames.map((game) => {
            const gameDef = GAMES.find((g) => g.id === game.gameId);
            return (
              <div
                key={game.id}
                className="group relative bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-2xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg dark:hover:bg-white/10 animate-slide-up"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Side: Game Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`
                            px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest
                            bg-${gameDef?.color || 'emerald'}-100 dark:bg-${gameDef?.color || 'emerald'}-900/40 
                            text-${gameDef?.color || 'emerald'}-700 dark:text-${gameDef?.color || 'emerald'}-300
                        `}>
                            {gameDef?.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{game.date}</span>
                        {game.source === 'ai' && (
                            <span className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                                <Wand2 size={10} /> Sonho IA
                            </span>
                        )}
                    </div>

                    {game.note && (
                        <p className="mb-3 text-sm italic text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            "{game.note}"
                        </p>
                    )}

                    {/* Numbers */}
                    <div className="flex flex-wrap items-center gap-2">
                        {game.numbers.map((n, i) => (
                            <span key={i} className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">
                                {n.toString().padStart(2, '0')}
                            </span>
                        ))}
                        
                        {/* Special Numbers */}
                        {game.specialNumbers && game.specialNumbers.length > 0 && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                {game.specialNumbers.map((n, i) => (
                                    <span key={`s-${i}`} className={`font-mono font-bold text-lg text-${gameDef?.specialRange?.color || 'emerald'}-600 dark:text-${gameDef?.specialRange?.color || 'emerald'}-400`}>
                                        {gameDef?.id === 'dia-de-sorte' ? MONTH_NAMES[n-1].substring(0,3).toUpperCase() : n.toString().padStart(2, '0')}
                                    </span>
                                ))}
                            </>
                        )}

                        {/* Extra String */}
                        {game.extraString && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <span className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded flex items-center gap-1">
                                    <Shield size={10} /> {game.extraString}
                                </span>
                            </>
                        )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-white/5 pt-3 md:pt-0 md:border-t-0 md:pl-4 md:border-l">
                    <button
                        onClick={() => {
                            let text = `Jogar em ${gameDef?.name}: ${game.numbers.join(', ')}`;
                            if (game.specialNumbers) text += ` + ${game.specialNumbers.join(', ')}`;
                            if (game.extraString) text += ` + ${game.extraString}`;
                            onCopy(text);
                        }}
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Copiar"
                    >
                        <Copy size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(game.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
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