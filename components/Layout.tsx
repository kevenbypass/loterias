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
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-[color:var(--ink)] selection:bg-emerald-500/25 selection:text-emerald-950 dark:selection:text-emerald-100">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_18%_10%,var(--glow-brand),transparent_55%),radial-gradient(900px_circle_at_82%_18%,var(--glow-gold),transparent_60%),linear-gradient(180deg,var(--bg0),var(--bg1))]" />
        <div className="absolute inset-0 clover-pattern opacity-[0.16] dark:opacity-[0.10]" />
        <div className="absolute inset-0 noise-texture opacity-[0.035] dark:opacity-[0.04]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-5xl px-4 pt-4 md:pt-6">
          <div className="ticket-cut relative flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_22px_60px_-30px_var(--shadow)]">
            <button
              type="button"
              className="flex items-center gap-3 group active:scale-[0.98] transition-transform"
              onClick={() => onNavigate('home')}
            >
              <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_12px_30px_-18px_rgba(16,185,129,0.9)]">
                <Clover size={18} className="text-emerald-950/90" />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/30 dark:ring-white/10" />
              </span>
              <span className="leading-tight text-left">
                <span className="block text-[15px] md:text-base font-black tracking-tight font-display">
                  Loto<span className="text-emerald-600 dark:text-emerald-400">Sorte</span>
                </span>
                <span className="hidden md:block text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">
                  Trevo, bilhetes e palpites
                </span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 rounded-full p-1 bg-[color:var(--surface-2)] border border-[color:var(--border)]">
              {NAV_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id as ViewState)}
                    className={[
                      "relative px-4 py-2 rounded-full text-sm font-bold tracking-tight transition-all",
                      isActive
                        ? "text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_14px_34px_-18px_rgba(16,185,129,0.85)]"
                        : "text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-[color:var(--surface-2)] border border-[color:var(--border)] text-[11px] font-extrabold tracking-wide text-emerald-700 dark:text-emerald-300">
                <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Verde Trevo</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="relative p-2.5 rounded-2xl bg-[color:var(--surface-2)] border border-[color:var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label={isDarkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col relative pt-28 md:pt-44 pb-28 md:pb-14 mx-auto max-w-5xl w-full px-4 md:px-6">
        {children}
      </main>

      {/* Legal footer */}
      <footer className="relative z-10 mx-auto max-w-5xl w-full px-4 md:px-6 pb-24 md:pb-8">
        <div className="ticket-cut bg-[color:var(--surface)] border border-[color:var(--border)] px-4 py-3 md:px-5 md:py-4 text-center shadow-[0_16px_50px_-40px_var(--shadow)]">
          <p className="text-[11px] md:text-xs leading-relaxed text-[color:var(--muted)] font-semibold">
            Este site e apenas um gerador de numeros para apostas das Loterias Caixa, sem qualquer vinculo com a Caixa
            Economica Federal. Nao realizamos apostas, pagamentos ou operacoes oficiais de loteria.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] md:text-xs font-bold">
            <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href="/como-jogar/">
              Como jogar
            </a>
            <span aria-hidden="true" className="text-[color:var(--muted)]">
              |
            </span>
            <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href="/resultados/">
              Resultados
            </a>
            <span aria-hidden="true" className="text-[color:var(--muted)]">
              |
            </span>
            <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href="/faq/">
              FAQ
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="ticket-cut flex items-center justify-between gap-2 px-2 py-2 backdrop-blur-xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_20px_56px_-28px_var(--shadow)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon === 'Home' ? Home : item.icon === 'Bookmark' ? Bookmark : BarChart;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id as ViewState)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-1 active:scale-[0.98] transition-transform"
              >
                <span
                  className={[
                    "inline-flex items-center justify-center w-11 h-11 rounded-2xl transition-all",
                    isActive
                      ? "bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-[0_16px_40px_-22px_rgba(16,185,129,0.9)]"
                      : "bg-[color:var(--surface-2)] border border-[color:var(--border)] text-[color:var(--muted)]",
                  ].join(" ")}
                >
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className={["text-[10px] font-extrabold tracking-wide", isActive ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]"].join(" ")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
