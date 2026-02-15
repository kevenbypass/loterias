import React from 'react';
import { Clover, Moon, Sun, Home, Bookmark, BarChart, Zap } from 'lucide-react';
import { ViewState } from '../types';
import { NAV_ITEMS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isDarkMode, toggleTheme }) => {
  return (
    <div className={`
      min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 font-sans selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200
      ${isDarkMode 
        ? 'bg-[#020617] text-slate-100' 
        : 'bg-[#FDFDFD] text-slate-900'}
    `}>
      
      {/* Premium Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {isDarkMode ? (
           <>
             {/* Deep Mesh Gradient - Optimized for Mobile (less opacity) */}
             <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen"></div>
             
             {/* Noise Texture */}
             <div className="absolute inset-0 noise-texture opacity-[0.03]"></div>
             
             {/* Grid overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
           </>
         ) : (
           <>
             {/* Light Mode subtle gradients */}
             <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[80px] mix-blend-multiply"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[80px] mix-blend-multiply"></div>
             
             {/* Light Noise */}
             <div className="absolute inset-0 noise-texture opacity-[0.015]"></div>
             
             {/* Subtle Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]"></div>
           </>
         )}
      </div>

      {/* Header - Native App Bar on Mobile / Floating Pill on Desktop */}
      <header className={`
        fixed z-50 flex items-center justify-between transition-all duration-500 ease-out

        top-0 left-0 right-0 w-full px-5 py-3 border-b shadow-sm backdrop-blur-xl

        md:top-6 md:left-1/2 md:-translate-x-1/2 md:max-w-5xl md:w-[calc(100%-3rem)] md:rounded-full md:border md:shadow-2xl md:px-6 md:py-3 md:backdrop-blur-3xl
        
        ${isDarkMode 
          ? 'bg-[#0f172a]/80 md:bg-[#0f172a]/60 border-white/5 shadow-black/5 md:shadow-black/20' 
          : 'bg-white/80 md:bg-white/60 border-slate-200 shadow-slate-200/50 md:shadow-slate-200/30'}
      `}>
        <div 
          className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => onNavigate('home')}
        >
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
             <Clover className={`relative w-6 h-6 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400`} />
          </div>
          <span className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Loto<span className="text-emerald-600 dark:text-emerald-500">Sorte</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}>
          {NAV_ITEMS.map((item) => (
             <button 
               key={item.id}
               onClick={() => onNavigate(item.id as ViewState)}
               className={`
                 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                 ${currentView === item.id 
                   ? `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/20` 
                   : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'}
               `}
             >
               {item.label}
             </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
           <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <Zap size={12} fill="currentColor" />
              <span>Pro</span>
           </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors active:bg-black/5 dark:active:bg-white/10 ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
             {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content - Adjusted Padding for Mobile vs Desktop */}
      <main className="flex-1 flex flex-col relative z-10 pt-24 md:pt-36 pb-28 md:pb-12 max-w-5xl mx-auto w-full px-4 md:px-6">
        {children}
      </main>

      {/* Mobile Bottom Nav - Glassmorphism Dock */}
      <nav className={`
        md:hidden fixed bottom-6 left-4 right-4 flex justify-between items-center px-2 py-2 z-50 rounded-2xl border backdrop-blur-2xl shadow-2xl ring-1 
        ${isDarkMode 
          ? 'bg-[#0f172a]/90 border-white/10 shadow-black/40 ring-white/5' 
          : 'bg-white/90 border-slate-200 shadow-slate-200/50 ring-slate-200/50'}
      `}>
        {NAV_ITEMS.map((item) => {
            const Icon = item.icon === 'Home' ? Home : item.icon === 'Bookmark' ? Bookmark : BarChart;
            const isActive = currentView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 group active:scale-90"
              >
                <div className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 translate-y-[-6px]' 
                    : 'text-slate-400 dark:text-slate-400'}
                `}>
                  <Icon size={20} strokeWidth={2} />
                </div>
              </button>
            )
        })}
      </nav>
    </div>
  );
};

export default Layout;
