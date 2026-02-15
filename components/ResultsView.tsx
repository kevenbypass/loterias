import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, DollarSign, Clover, Plus, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { GAMES, MONTH_NAMES } from '../constants';
import { LotteryResult } from '../types';
import { fetchAllResults } from '../services/officialLotteryService';
import LotteryBall from './LotteryBall';

const ResultsView: React.FC = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllResults();
      setResults(data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-20 pt-10 px-4">
         <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
         </div>
         <div className="grid gap-8 mt-10">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-white/5 h-64 rounded-2xl border border-slate-200 dark:border-white/5 animate-pulse"></div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-10 relative">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-3 tracking-tight">
          <Trophy className="text-yellow-500 fill-yellow-500" size={32} /> 
          Resultados Oficiais
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 font-medium flex items-center justify-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           Dados atualizados da Caixa
        </p>
        <button 
           onClick={loadData}
           className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors"
           title="Atualizar"
        >
            <RefreshCw size={16} className="text-slate-500 dark:text-slate-300" />
        </button>
      </div>

      <div className="grid gap-8">
        {results.map((result) => {
          const gameDef = GAMES.find((g) => g.id === result.gameId);
          if (!gameDef) return null;

          return (
            <div key={result.gameId} className="relative group perspective-1000 animate-slide-up">
              
              {/* Card Container simulating a receipt */}
              <div className="relative bg-white dark:bg-[#1e293b] rounded-t-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-x border-t border-slate-100 dark:border-white/5">
                
                {/* Header Strip */}
                <div className={`
                  h-2 w-full bg-gradient-to-r 
                  from-${gameDef.color}-500 to-${gameDef.color}-600
                `}></div>

                <div className="p-0">
                  {/* Top Section: Identity */}
                  <div className="px-6 py-5 flex items-start justify-between bg-slate-50 dark:bg-white/5 border-b border-dashed border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-12 h-12 rounded-xl rotate-3 flex items-center justify-center shadow-lg
                            bg-gradient-to-br from-${gameDef.color}-500 to-${gameDef.color}-700 text-white
                        `}>
                            <Clover size={24} />
                        </div>
                        <div>
                            <h3 className={`font-black text-xl uppercase tracking-tight text-slate-800 dark:text-white`}>
                                {gameDef.name}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs font-mono text-slate-500 dark:text-gray-400 mt-1">
                                <span className="bg-slate-200 dark:bg-black/40 px-2 py-0.5 rounded">CONCURSO {result.contestNumber}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1"><Calendar size={12}/> {result.date}</span>
                            </div>
                        </div>
                    </div>
                    
                    {result.accumulated && (
                        <div className="flex flex-col items-end">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] md:text-xs font-bold uppercase rounded-full shadow-lg animate-pulse tracking-wide">
                                Acumulou!
                            </span>
                        </div>
                    )}
                  </div>

                  {/* Body: Numbers */}
                  <div className="px-6 py-6 bg-white dark:bg-[#1e293b]">
                     <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                        {result.numbers.map((n, i) => (
                           <LotteryBall key={i} number={n} color={gameDef.color} size="small" delay={i} />
                        ))}
                        {/* Special Numbers */}
                        {result.specialNumbers && result.specialNumbers.map((n, i) => (
                           <div key={`sp-${i}`} className="flex items-center ml-2">
                              <span className="mr-2 text-slate-300"><Plus size={16}/></span>
                              <LotteryBall 
                                 number={n} 
                                 color={gameDef.specialRange?.color || 'emerald'} 
                                 size="small" 
                                 label={gameDef.id === 'dia-de-sorte' ? MONTH_NAMES[n-1]?.substring(0,3) : undefined} 
                                 labelPosition="bottom"
                              />
                           </div>
                        ))}
                        {/* Timemania Team */}
                        {result.extraString && (
                            <div className="flex items-center ml-2 pl-2 border-l border-slate-200 dark:border-white/10">
                                <span className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 text-xs font-bold flex items-center gap-2 uppercase tracking-wide">
                                    <Shield size={14} className="fill-amber-200" /> {result.extraString}
                                </span>
                            </div>
                        )}
                     </div>
                  </div>

                  {/* Footer: Prize Info */}
                  <div className="px-6 py-5 bg-slate-50 dark:bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="text-center sm:text-left">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                           Próximo Prêmio
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-2xl tracking-tight">
                           <span className="text-lg opacity-60">R$</span>
                           {result.nextPrize.includes('R$') ? result.nextPrize.replace('R$', '').trim() : result.nextPrize}
                        </div>
                     </div>
                     <div className="text-center sm:text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                           Próximo Sorteio
                        </p>
                        <p className="text-slate-700 dark:text-slate-200 font-bold font-mono">
                           {result.nextDate}
                        </p>
                     </div>
                  </div>
                </div>

                {/* Zig-Zag Bottom Edge (Pure CSS Receipt Effect) */}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-4 bg-white dark:bg-[#1e293b]"
                    style={{
                        maskImage: 'radial-gradient(circle at 10px -5px, transparent 12px, black 13px)',
                        maskSize: '20px 20px',
                        maskRepeat: 'repeat-x',
                        maskPosition: 'bottom',
                        WebkitMaskImage: 'radial-gradient(circle at 10px -5px, transparent 12px, black 13px)',
                        WebkitMaskSize: '20px 20px',
                        WebkitMaskRepeat: 'repeat-x',
                        WebkitMaskPosition: 'bottom',
                        bottom: '-10px',
                        zIndex: 10
                    }}
                ></div>
              </div>
            </div>
          );
        })}
        
        <div className="text-center text-xs text-slate-400 dark:text-gray-600 mt-8 mb-8 flex items-center justify-center gap-2">
           {error && <AlertCircle size={12} className="text-amber-500" />}
           Dados obtidos via API pública (sujeito a disponibilidade).
        </div>
      </div>
    </div>
  );
};

export default ResultsView;