import React from 'react';
import { Category } from '../types';
import { CATS, TC, TDEF } from '../constants';

interface SetupScreenProps {
  tc: number;
  setTc: (n: number) => void;
  tnames: string[];
  setTnames: (names: string[]) => void;
  cat: number;
  setCat: (i: number) => void;
  categories: Category[];
  opts: { minus: boolean; tournament: boolean; final: boolean };
  setOpts: (opts: any) => void;
  timer: number;
  setTimer: (t: number) => void;
  bonusPct: number;
  setBonusPct: (p: number) => void;
  onStart: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  tc, setTc, tnames, setTnames, cat, setCat, categories, opts, setOpts, timer, setTimer, bonusPct, setBonusPct, onStart
}) => {
  const [showCats, setShowCats] = React.useState(false);

  const handleTnameChange = (i: number, val: string) => {
    const newNames = [...tnames];
    newNames[i] = val;
    setTnames(newNames);
  };

  const toggleOpt = (k: keyof typeof opts) => {
    setOpts({ ...opts, [k]: !opts[k] });
  };

  return (
    <div id="scr-setup" className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="setup-inner max-w-5xl mx-auto pb-12">
        <div className="setup-header text-center mb-6">
          <div className="setup-title font-oswald text-[clamp(24px,5vw,42px)] font-bold tracking-[2px] text-[var(--gold)] [text-shadow:var(--glow-gold)] leading-tight">
            🏛️ QAZAQSTAN TARIHY<br />
            <span className="text-[0.6em] text-white/80 tracking-[4px] uppercase">Quiz Tournament</span>
          </div>
          <div className="setup-sub text-[var(--text2)] text-xs mt-2 font-medium tracking-widest uppercase opacity-60">
            Оқушыларға арналған кәсіби тарихи викторина
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column: Settings & Config */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Team Count */}
            <div className="sc bg-[rgba(15,32,53,0.8)] border border-[var(--border2)] rounded-2xl p-5 backdrop-blur-md">
              <div className="sc-t text-[10px] font-extrabold tracking-[3px] uppercase text-[var(--text2)] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[var(--gold)] rounded-full" /> Команда саны
              </div>
              <div className="tc-row flex gap-3">
                {[2, 3].map(n => (
                  <button
                    key={n}
                    className={`tc-btn flex-1 p-4 rounded-xl bg-white/5 border-2 border-[var(--border)] text-[var(--text2)] font-oswald text-3xl font-bold cursor-pointer transition-all duration-300 text-center ${tc === n ? 'active border-[var(--gold)] text-[var(--gold)] bg-[rgba(240,180,41,0.15)] [box-shadow:var(--glow-gold)] scale-[1.02]' : 'hover:bg-white/10'}`}
                    onClick={() => setTc(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Options */}
            <div className="sc bg-[rgba(15,32,53,0.8)] border border-[var(--border2)] rounded-2xl p-5 backdrop-blur-md">
              <div className="sc-t text-[10px] font-extrabold tracking-[3px] uppercase text-[var(--text2)] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[var(--gold)] rounded-full" /> Ойын параметрлері
              </div>
              <div className="tog-list flex flex-col gap-2">
                {[
                  { id: 'minus', label: '➖ Қате жауап = минус балл' },
                  { id: 'tournament', label: '🏆 Турнир режимі (5 тур)' },
                  { id: 'final', label: '⚡ Финал туры (50 балл)' }
                ].map(o => (
                  <div key={o.id} className="tog-row flex items-center justify-between p-3 bg-white/5 border border-[var(--border)] rounded-xl hover:bg-white/10 transition-colors">
                    <span className="tog-lbl text-xs font-bold text-[var(--text2)]">{o.label}</span>
                    <button
                      className={`tog w-10 h-5 rounded-full border-none cursor-pointer relative transition-all duration-300 shrink-0 ${opts[o.id as keyof typeof opts] ? 'bg-[var(--gold)]' : 'bg-[var(--text3)]'}`}
                      onClick={() => toggleOpt(o.id as keyof typeof opts)}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${opts[o.id as keyof typeof opts] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer & Bonus */}
            <div className="sc bg-[rgba(15,32,53,0.8)] border border-[var(--border2)] rounded-2xl p-5 backdrop-blur-md">
              <div className="sc-t text-[10px] font-extrabold tracking-[3px] uppercase text-[var(--text2)] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[var(--gold)] rounded-full" /> Таймер және Бонус
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="albl text-[10px] font-bold tracking-[1px] uppercase text-[var(--text2)]">Уақыт шегі</div>
                    <span className="text-sm font-oswald font-bold text-[var(--gold)]">{timer} сек</span>
                  </div>
                  <input type="range" className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-[var(--gold)]" min="5" max="60" step="5" value={timer} onChange={(e) => setTimer(+e.target.value)} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="albl text-[10px] font-bold tracking-[1px] uppercase text-[var(--text2)]">Бонус жиілігі</div>
                    <span className="text-sm font-oswald font-bold text-[var(--gold)]">{bonusPct}%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-[var(--gold)]" min="0" max="50" step="5" value={bonusPct} onChange={(e) => setBonusPct(+e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Categories & Teams */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Categories */}
            <div className="sc bg-[rgba(15,32,53,0.8)] border border-[var(--border2)] rounded-2xl p-5 backdrop-blur-md flex-1">
              <div className="sc-t text-[10px] font-extrabold tracking-[3px] uppercase text-[var(--text2)] mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-[var(--gold)] rounded-full" /> Ойын тақырыбы
                </div>
                <button 
                  onClick={() => setShowCats(!showCats)}
                  className="px-3 py-1 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] text-[9px] font-bold uppercase tracking-wider hover:bg-[var(--gold)]/20 transition-all"
                >
                  {showCats ? 'Жабу' : 'Таңдау'}
                </button>
              </div>

              {!showCats ? (
                <div 
                  onClick={() => setShowCats(true)}
                  className="flex items-center gap-4 p-5 rounded-xl bg-white/5 border-2 border-[var(--gold)]/30 cursor-pointer hover:bg-white/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {categories[cat]?.icon || '🏛️'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-[var(--text2)] uppercase tracking-widest font-bold mb-1">Таңдалған тақырып:</div>
                    <div className="text-lg font-bold text-white">{categories[cat]?.name || 'Таңдалмаған'}</div>
                  </div>
                  <div className="text-[var(--gold)] opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              ) : (
                <div className="cat-grid grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {categories.map((c, i) => (
                    <button
                      key={c.id}
                      className={`cat-btn flex items-center gap-3 p-4 rounded-xl bg-white/5 border-2 border-[var(--border)] text-[var(--text2)] cursor-pointer transition-all duration-300 text-sm font-bold hover:border-[var(--border2)] hover:bg-white/10 ${cat === i ? 'active border-[var(--gold)] text-[var(--gold)] bg-[rgba(240,180,41,0.1)]' : ''}`}
                      onClick={() => {
                        setCat(i);
                        setShowCats(false);
                      }}
                    >
                      <span className="text-xl">{c.icon}</span>
                      <span className="flex-1 text-left">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Team Names */}
            <div className="sc bg-[rgba(15,32,53,0.8)] border border-[var(--border2)] rounded-2xl p-5 backdrop-blur-md">
              <div className="sc-t text-[10px] font-extrabold tracking-[3px] uppercase text-[var(--text2)] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[var(--gold)] rounded-full" /> Команда атаулары
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: tc }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ background: TC[i] }} />
                    <input
                      className="tinput flex-1 p-3 bg-white/5 border-2 border-[var(--border2)] rounded-xl text-[var(--text)] font-sans text-sm outline-none transition-all duration-300 focus:border-[var(--gold)] focus:bg-white/10"
                      placeholder={TDEF[i]}
                      value={tnames[i] || ''}
                      onChange={(e) => handleTnameChange(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              className="start-btn w-full p-5 bg-gradient-to-r from-[var(--gold)] to-[#b07010] border-none rounded-2xl font-oswald text-xl font-bold tracking-[3px] uppercase text-[#1a0f00] cursor-pointer shadow-[0_10px_30px_rgba(240,180,41,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(240,180,41,0.5)] active:scale-[0.98] flex items-center justify-center gap-3"
              onClick={onStart}
            >
              <span className="text-2xl">⚔️</span> ОЙЫНДЫ БАСТАУ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
