import React from 'react';
import { motion } from 'motion/react';
import { CATS, TC, TCR, TDEF } from '../constants';
import { Category, GameState } from '../types';

interface GameScreenProps {
  state: GameState;
  categories: Category[];
  projectorMode?: boolean;
  onOpenQ: (idx: number) => void;
  onNextRound: () => void;
  onEndTournament: () => void;
  onGoBack: () => void;
  onOpenAdmin: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  state, categories, projectorMode, onOpenQ, onNextRound, onEndTournament, onGoBack, onOpenAdmin
}) => {
  const [openPanels, setOpenPanels] = React.useState<Record<string, boolean>>({
    tourn: true,
    winner: false,
    settings: false
  });

  const toggleCP = (id: string) => {
    setOpenPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totals = state.tournScores.map(r => r.reduce((a, b) => a + (b || 0), 0));
  const sortedTeams = Array.from({ length: state.tc }, (_, i) => ({
    i,
    n: state.tnames[i] || TDEF[i],
    r: state.tournScores[i],
    t: totals[i]
  })).sort((a, b) => b.t - a.t);

  return (
    <div id="game-layout" className="flex flex-1 flex-col bg-[var(--bg3)]">
      {projectorMode && (
        <div className="flex w-full items-center justify-around bg-black/40 p-6 backdrop-blur-xl border-b border-white/5">
          {state.tnames.slice(0, state.tc).map((n, i) => {
            const c = TC[i];
            const act = state.curTeam === i;
            return (
              <div 
                key={i} 
                className={`flex flex-col items-center transition-all duration-700 ${act ? 'scale-125' : 'opacity-40 grayscale-[0.5]'}`}
                style={{ color: c }}
              >
                <div className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-1">{n || TDEF[i]}</div>
                <div className="font-oswald text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{state.scores[i]}</div>
                {act && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="mt-2 h-1.5 w-16 rounded-full" 
                    style={{ backgroundColor: c, boxShadow: `0 0 15px ${c}` }} 
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div id="main-content" className="flex flex-1 p-3 md:p-5 gap-4 lg:gap-6 max-w-[1600px] mx-auto w-full">
        {/* Sidebar: Scores & Status */}
        {!projectorMode && (
          <div id="sidebar" className="w-40 lg:w-48 xl:w-56 shrink-0 flex flex-col gap-3 pr-1">
            <div className="text-[10px] font-black tracking-[3px] uppercase text-[var(--text3)] mb-1 px-2">Командалар</div>
            {state.tnames.slice(0, state.tc).map((n, i) => {
              const c = TC[i];
              const r = TCR[i];
              const act = state.curTeam === i;
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl p-4 border-2 transition-all duration-500 overflow-hidden ${act ? 'border-[var(--tc)] shadow-[0_0_25px_rgba(var(--tc-r),0.2)] scale-[1.02]' : 'border-white/5 opacity-70'}`}
                  style={{
                    background: act ? `linear-gradient(145deg, rgba(${r},0.2), rgba(${r},0.05))` : 'rgba(255,255,255,0.02)',
                    // @ts-ignore
                    '--tc': c,
                    '--tc-r': r
                  } as any}
                >
                  <div className="text-[10px] font-bold tracking-wider uppercase text-white/40 mb-1">{n || TDEF[i]}</div>
                  <div className="font-oswald text-4xl lg:text-5xl font-bold text-white leading-none">{state.scores[i]}</div>
                  {act && (
                    <div className="absolute top-3 right-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--tc)] animate-pulse shadow-[0_0_10px_var(--tc)]" />
                    </div>
                  )}
                  <div className="mt-2 text-[9px] font-bold tracking-widest uppercase opacity-40">{act ? '▶ КЕЗЕК' : 'БАЛЛ'}</div>
                </div>
              );
            })}

            <div className="mt-auto pt-4 flex flex-col gap-2">
              <button 
                onClick={onOpenAdmin}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] hover:bg-white/10 hover:text-white transition-all"
              >
                🔐 Мұғалім
              </button>
              <button 
                onClick={onGoBack}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] hover:bg-white/10 hover:text-white transition-all"
              >
                ↩ Шығу
              </button>
            </div>
          </div>
        )}

        {/* Center: Game Grid & Info */}
        <div id="center-area" className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" />
              <div className="text-xs font-bold tracking-widest uppercase text-[var(--text2)]">
                Кезек: <span className="text-white">{state.tnames[state.curTeam] || TDEF[state.curTeam]}</span>
              </div>
            </div>
            <div className="px-4 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-xs font-bold text-[var(--gold)] tracking-wider">
              {categories[state.cat]?.name || 'Белгісіз'}
            </div>
          </div>

          <div className={`flex-none flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-4 lg:p-6 relative ${projectorMode ? 'justify-center min-h-[600px]' : ''}`}>
            {state.frActive && !state.frDone && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2 bg-[var(--gold)] text-black font-oswald font-bold text-sm tracking-[4px] rounded-full shadow-[0_0_30px_rgba(240,180,41,0.4)] animate-pulse">
                ⚡ ФИНАЛ ТУРЫ ⚡
              </div>
            )}

            <div className={`grid grid-cols-3 gap-3 lg:gap-5 h-full ${projectorMode ? 'max-w-5xl mx-auto w-full' : ''}`}>
              {state.qs.map((q, i) => {
                if (!q) return <div key={i} />;
                const st = state.cellSt[i];
                const isB = state.bonus.includes(i);
                const used = st !== 'open';
                
                let colorClass = q.pts === 10 ? 'blue' : q.pts === 20 ? 'gold' : 'red';

                return (
                  <motion.div
                    key={i}
                    whileHover={!used ? { scale: 1.05, y: -5 } : {}}
                    whileTap={!used ? { scale: 0.95 } : {}}
                    className={`relative flex flex-col items-center justify-center rounded-2xl lg:rounded-3xl cursor-pointer border-2 transition-all duration-300 select-none overflow-hidden
                      ${used ? 'opacity-20 grayscale cursor-not-allowed border-transparent' : 'border-white/10 hover:border-white/30'}
                      ${colorClass === 'blue' ? 'bg-gradient-to-br from-[#1e40af]/20 to-[#1e3a8a]/40' : colorClass === 'gold' ? 'bg-gradient-to-br from-[#b45309]/20 to-[#92400e]/40' : 'bg-gradient-to-br from-[#991b1b]/20 to-[#7f1d1d]/40'}
                      ${isB && !used ? 'ring-2 ring-[var(--gold)] ring-offset-4 ring-offset-[var(--bg3)]' : ''}
                      ${projectorMode ? 'aspect-square' : 'aspect-[4/3]'}
                    `}
                    onClick={() => !used && onOpenQ(i)}
                  >
                    <div className={`font-oswald font-bold leading-none transition-all ${projectorMode ? 'text-8xl' : 'text-4xl lg:text-5xl'} ${colorClass === 'blue' ? 'text-blue-400' : colorClass === 'gold' ? 'text-[var(--gold)]' : 'text-red-400'}`}>
                      {used ? (st === 'correct' ? '✓' : '✗') : q.pts}
                    </div>
                    <div className="mt-2 text-[10px] font-black tracking-[3px] uppercase opacity-40">ҰПАЙ</div>
                    
                    {isB && !used && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--gold)] rounded-full flex items-center justify-center text-black text-xs font-bold shadow-[0_0_15px_var(--gold)]">
                        ★
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Panels: Tournament & Stats */}
          {!projectorMode && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 shrink-0">
              {state.opts.tournament && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text2)]">Турнир кестесі</div>
                    <div className="text-[10px] font-bold text-[var(--gold)]">ТУР {state.tournRound + 1}/5</div>
                  </div>
                  <div className="p-3 overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-white/30 uppercase tracking-tighter">
                          <th className="pb-2 font-bold">#</th>
                          <th className="pb-2 font-bold">Команда</th>
                          <th className="pb-2 font-bold">Ұпай</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/80">
                        {sortedTeams.map((t, rank) => (
                          <tr key={t.i} className="border-t border-white/5">
                            <td className="py-2">{rank === 0 ? '🥇' : rank + 1}</td>
                            <td className="py-2 font-bold">{t.n}</td>
                            <td className="py-2 font-oswald text-[var(--gold)]">{t.t}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3">
                      {state.tournRound < 4 ? (
                        <button onClick={onNextRound} className="w-full py-2 bg-[var(--gold)] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">Келесі тур ▶</button>
                      ) : (
                        <button onClick={onEndTournament} className="w-full py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">Турнирді аяқтау</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text3)] mb-3">Ойын күйі</div>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-bold text-white/30 uppercase mb-1">Қалған сұрақтар</div>
                    <div className="text-2xl font-oswald text-white">{state.cellSt.filter(s => s === 'open').length}</div>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-bold text-white/30 uppercase mb-1">Орташа балл</div>
                    <div className="text-2xl font-oswald text-[var(--gold)]">
                      {Math.round(state.scores.reduce((a, b) => a + b, 0) / state.tc)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
