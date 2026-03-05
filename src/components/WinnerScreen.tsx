import React from 'react';
import { TDEF } from '../constants';

interface WinnerScreenProps {
  winner: { i: number; s: number; name: string };
  scores: { name: string; score: number }[];
  onNewGame: () => void;
  onViewHistory: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  winner, scores, onNewGame, onViewHistory
}) => {
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const med = ['🥇', '🥈', '🥉'];
  const pcl = [
    'bg-[rgba(240,180,41,0.15)] border-2 border-[var(--gold)] h-[140px] order-2 lg:h-[170px]', 
    'bg-[rgba(192,192,192,0.1)] border-2 border-[rgba(192,192,192,0.4)] h-[105px] order-1 lg:h-[130px]', 
    'bg-[rgba(205,127,50,0.1)] border-2 border-[rgba(205,127,50,0.4)] h-[75px] order-3 lg:h-[95px]'
  ];
  const ord = sorted.slice(0, 3);

  return (
    <div id="scr-win" className="flex flex-1 flex-col items-center justify-center p-5 text-center overflow-y-auto min-h-0">
      <div className="text-[68px] animate-[flt_3s_ease_infinite] mb-2 lg:text-[80px]">🏆</div>
      <div className="font-oswald text-[clamp(26px,7vw,50px)] font-bold text-[var(--gold)] [text-shadow:var(--glow-gold)] mb-1 leading-tight">{winner.name}</div>
      <div className="text-[var(--text2)] text-xs mb-8 lg:text-sm uppercase tracking-widest font-bold">🏅 {winner.s} балл жинады</div>
      
      <div className="flex items-end justify-center mb-10 gap-1">
        {ord.map((t, r) => (
          <div key={r} className={`flex flex-col items-center p-3 md:p-4 rounded-t-2xl min-w-[90px] md:min-w-[130px] ${pcl[r]}`}>
            <div className="text-2xl mb-1 lg:text-3xl">{med[r]}</div>
            <div className="font-oswald text-[10px] md:text-xs font-semibold text-[var(--text)] truncate max-w-[80px] md:max-w-[120px]">{t.name}</div>
            <div className={`font-oswald text-xl md:text-2xl font-bold ${r === 0 ? 'text-[var(--gold)]' : r === 1 ? 'text-[#c0c0c0]' : 'text-[#cd7f32]'}`}>{t.score}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center pb-10">
        <button 
          className="px-8 py-3 rounded-xl font-oswald text-sm font-black tracking-widest uppercase transition-all bg-gradient-to-br from-[var(--gold)] to-[#b07010] text-[#1a0f00] shadow-xl hover:scale-105" 
          onClick={onNewGame}
        >
          🔄 Жаңа ойын
        </button>
        <button 
          className="px-8 py-3 rounded-xl font-oswald text-sm font-black tracking-widest uppercase transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-105" 
          onClick={onViewHistory}
        >
          📜 Тарих
        </button>
      </div>
    </div>
  );
};
