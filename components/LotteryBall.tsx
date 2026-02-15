import React from 'react';

interface LotteryBallProps {
  number: number;
  color?: string;
  delay?: number;
  size?: 'normal' | 'small';
  label?: string;
  labelPosition?: 'top' | 'bottom';
}

const LotteryBall: React.FC<LotteryBallProps> = ({ 
  number, 
  color = 'emerald', 
  delay = 0, 
  size = 'normal',
  label,
  labelPosition = 'bottom'
}) => {
  const formattedNumber = number.toString().padStart(2, '0');
  const isThreeDigits = formattedNumber.length > 2;
  const colorName = color === 'emerald' ? 'emerald' : color;

  const getDelayClass = (rawDelay: number) => {
    const idx = Number.isFinite(rawDelay) ? Math.round(rawDelay) : 0;
    const clamped = Math.max(0, Math.min(60, idx));
    return `anim-delay-${clamped}`;
  };

  const delayClass = getDelayClass(delay);

  // Premium Glow & Glassmorphism Styles
  const getBallStyles = () => {
    // Keep comments outside template literals: Tailwind v4 class extraction can be tripped up by
    // block comment tokens (/* ... */) inside className strings, which results in missing CSS.
    return `
      shadow-[0_4px_20px_-4px_var(--tw-shadow-color)]
      shadow-${colorName}-500/30
      dark:shadow-${colorName}-500/50

      md:group-hover:shadow-[0_0_30px_-4px_var(--tw-shadow-color)]
      md:group-hover:shadow-${colorName}-500/70

      border border-${colorName}-200/60
      dark:border-${colorName}-500/30
      md:group-hover:border-${colorName}-400
      dark:md:group-hover:border-${colorName}-400/80

      bg-gradient-to-br
      from-[#ffffff] via-[#f8fafc] to-${colorName}-100/80
      dark:from-[#1e293b] dark:via-[#0f172a] dark:to-${colorName}-900/40
    `;
  };

  // Adjusted sizes for better mobile fitting
  const sizeClasses = size === 'small' 
    ? `w-9 h-9 md:w-10 md:h-10 ${isThreeDigits ? 'text-[9px] md:text-[10px]' : 'text-xs md:text-sm'}`
    : `w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${isThreeDigits ? 'text-sm md:text-base lg:text-lg' : 'text-lg md:text-xl lg:text-2xl'}`;

  // Helper for inner ring color (for the flash effect)
  const getFlashColorClass = () => `text-${colorName}-500`;

  return (
    <div className="flex flex-col items-center gap-1 md:gap-2 group select-none">
      {label && labelPosition === 'top' && (
        <span className="text-[8px] md:text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest transition-colors md:group-hover:text-slate-600 dark:md:group-hover:text-slate-300">
          {label}
        </span>
      )}
      
      <div 
        className={`
          relative flex items-center justify-center 
          rounded-full 
          ${sizeClasses}
          ${getBallStyles()}
          transform transition-all duration-300 ease-out
          md:group-hover:scale-110 md:group-hover:-translate-y-1.5
          animate-pop-in cursor-default
          ${delayClass}
        `}
      >
        {/* FLASH FILL EFFECT */}
        <div 
            className={`absolute inset-0 rounded-full animate-flash-in ${getFlashColorClass()} ${delayClass}`}
        ></div>

        {/* Inner Glossy Gradient Overlays for 3D effect */}
        <div className={`absolute inset-0 rounded-full opacity-40 dark:opacity-20 bg-gradient-to-br from-white/80 via-transparent to-black/5 dark:to-black/40 pointer-events-none`}></div>
        
        {/* Color Hint at bottom - Enhanced for Gradient feel */}
        <div className={`absolute bottom-0 inset-x-0 h-2/3 rounded-b-full opacity-20 dark:opacity-40 bg-gradient-to-t from-${colorName}-500 via-${colorName}-500/10 to-transparent transition-opacity duration-300 md:group-hover:opacity-30 dark:md:group-hover:opacity-50`}></div>

        {/* Text color */}
        <span className={`relative z-10 font-bold font-mono tracking-tighter text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-md transition-colors duration-300 md:group-hover:text-${colorName}-700 dark:md:group-hover:text-${colorName}-200`}>
            {formattedNumber}
        </span>
        
        {/* Top Shine - Specular highlight - Made sharper for "Gem" look */}
        <div className="absolute top-[10%] left-[15%] w-[40%] h-[25%] bg-gradient-to-b from-white/90 to-transparent rounded-full blur-[1px] opacity-80 dark:opacity-60 pointer-events-none"></div>
      </div>

      {label && labelPosition === 'bottom' && (
        <span className="text-[8px] md:text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest transition-colors md:group-hover:text-slate-600 dark:md:group-hover:text-slate-300">
          {label}
        </span>
      )}
    </div>
  );
};

export default LotteryBall;
