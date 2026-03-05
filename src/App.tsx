import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Monitor, 
  Lock, 
  Moon, 
  Sun, 
  History, 
  ArrowLeft,
  LogIn,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { CATS, TC, TCR, TDEF, DQ } from "./constants";
import { Question, GameState, HistoryEntry, Category } from "./types";
import { useAudio } from "./hooks/useAudio";
import { useConfetti } from "./hooks/useConfetti";
import { subscribeToAuthChanges, logout } from "./services/firebase";
import { User } from "firebase/auth";

// Components
import { SetupScreen } from "./components/SetupScreen";
import { GameScreen } from "./components/GameScreen";
import { WinnerScreen } from "./components/WinnerScreen";
import { QuestionModal } from "./components/QuestionModal";
import { AdminPanel } from "./components/AdminPanel";
import { HistoryModal } from "./components/HistoryModal";
import { ChatBot } from "./components/ChatBot";
import { AuthModal } from "./components/AuthModal";

export default function App() {
  // --- State ---
  const [screen, setScreen] = useState<'setup' | 'game' | 'winner'>('setup');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [projectorMode, setProjectorMode] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    tc: 2,
    tnames: ['', '', ''],
    cat: 0,
    opts: { minus: false, tournament: false, final: false },
    timer: 15,
    bonusPct: 20,
    scores: [0, 0, 0],
    curTeam: 0,
    qs: [],
    cellSt: [],
    bonus: [],
    shuffled: [],
    frActive: false,
    frDone: false,
    tournActive: false,
    tournRound: 0,
    tournScores: [],
    usedCats: []
  });

  const [curIdx, setCurIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);

  // --- Hooks ---
  const { sfxWin, sfxSel } = useAudio();
  const { canvasRef, launch: launchConfetti } = useConfetti();

  // --- Derived Data ---
  const allCategories = useMemo(() => [...CATS, ...dynamicCategories], [dynamicCategories]);

  const allQuestions = useMemo(() => {
    const combined = [...DQ, ...customQuestions];
    return combined;
  }, [customQuestions]);

  // --- Effects ---
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('qt') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
    
    const savedHist = localStorage.getItem('qh');
    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {}
    }

    const savedQs = localStorage.getItem('qq');
    if (savedQs) {
      try {
        setCustomQuestions(JSON.parse(savedQs));
      } catch (e) {}
    }

    const savedCats = localStorage.getItem('qcats');
    if (savedCats) {
      try {
        setDynamicCategories(JSON.parse(savedCats));
      } catch (e) {}
    }

    // Fetch from API
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setDynamicCategories(prev => {
            // Merge or replace? Let's replace to ensure sync across devices
            return data.categories;
          });
        }
        if (data.questions) {
          setCustomQuestions(prev => {
            return data.questions;
          });
        }
      })
      .catch(err => console.error('Failed to fetch shared data:', err));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qt', theme);
  }, [theme]);

  // --- Game Actions ---
  const startGame = () => {
    const names = gameState.tnames.map((n, i) => n.trim() || TDEF[i]);
    const catQ = allQuestions.filter(q => q.cat === gameState.cat);
    
    const shuf = (a: any[]) => {
      const r = [...a];
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
      }
      return r;
    };

    const q10 = shuf(catQ.filter(q => q.pts === 10));
    const q20 = shuf(catQ.filter(q => q.pts === 20));
    const q30 = shuf(catQ.filter(q => q.pts === 30));
    
    const take = gameState.tc === 2 ? 4 : 6;
    const pool: (Question | null)[] = [];
    for (let r = 0; r < take; r++) {
      pool.push(q10[r] || null);
      pool.push(q20[r] || null);
      pool.push(q30[r] || null);
    }

    const bonus: number[] = [];
    if (gameState.bonusPct > 0) {
      const bn = Math.max(0, Math.round(pool.length * gameState.bonusPct / 100));
      const indices = shuf(Array.from({ length: pool.length }, (_, i) => i));
      indices.slice(0, bn).forEach(i => bonus.push(i));
    }

    const shuffled = pool.map(q => {
      if (!q) return { opts: [], ci: -1 };
      const opts = shuf([...q.opts]);
      return { opts, ci: opts.indexOf(q.opts[q.correct]) };
    });

    let tournScores = gameState.tournScores;
    if (gameState.opts.tournament && gameState.tournRound === 0) {
      tournScores = Array.from({ length: gameState.tc }, () => new Array(5).fill(null));
    }

    setGameState(prev => ({
      ...prev,
      tnames: names,
      scores: new Array(gameState.tc).fill(0),
      qs: pool,
      cellSt: pool.map(() => 'open'),
      bonus,
      shuffled,
      curTeam: 0,
      frActive: false,
      frDone: false,
      tournScores,
      usedCats: prev.usedCats.includes(gameState.cat) ? prev.usedCats : [...prev.usedCats, gameState.cat]
    }));

    setScreen('game');
  };

  const openQuestion = (idx: number) => {
    if (gameState.cellSt[idx] !== 'open') return;
    sfxSel();
    setCurIdx(idx);
    setQuestionOpen(true);
  };

  const handleAnswer = (correct: boolean) => {
    if (curIdx === null) return;
    const q = gameState.qs[curIdx];
    if (!q) return;

    const isBonus = gameState.bonus.includes(curIdx);
    const pts = gameState.frActive ? 50 : (isBonus ? q.pts * 2 : q.pts);

    const newScores = [...gameState.scores];
    const newCellSt = [...gameState.cellSt];

    if (correct) {
      newScores[gameState.curTeam] += pts;
      newCellSt[curIdx] = 'correct';
    } else {
      newCellSt[curIdx] = 'wrong';
      if (gameState.opts.minus) {
        newScores[gameState.curTeam] = Math.max(0, newScores[gameState.curTeam] - pts);
      }
    }

    setGameState(prev => ({ ...prev, scores: newScores, cellSt: newCellSt }));
  };

  const closeQuestion = () => {
    setQuestionOpen(false);
    const allUsed = gameState.cellSt.every(s => s !== 'open');
    const nextTeam = (gameState.curTeam + 1) % gameState.tc;
    
    if (allUsed) {
      if (gameState.opts.final && !gameState.frDone && !gameState.frActive) {
        startFinalRound();
      } else {
        endGame();
      }
    } else {
      setGameState(prev => ({ ...prev, curTeam: nextTeam }));
    }
  };

  const startFinalRound = () => {
    const catQ = allQuestions.filter(q => q.cat === gameState.cat && q.pts >= 30);
    const shuf = (a: any[]) => {
      const r = [...a];
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
      }
      return r;
    };
    const pool = shuf(catQ).slice(0, gameState.tc);
    const shuffled = pool.map(q => {
      const opts = shuf([...q.opts]);
      return { opts, ci: opts.indexOf(q.opts[q.correct]) };
    });

    setGameState(prev => ({
      ...prev,
      qs: pool,
      cellSt: pool.map(() => 'open'),
      bonus: [],
      shuffled,
      frActive: true,
      frDone: false,
      curTeam: 0
    }));
  };

  const endGame = () => {
    sfxWin();
    if (gameState.opts.tournament) {
      const newTournScores = [...gameState.tournScores];
      for (let i = 0; i < gameState.tc; i++) {
        newTournScores[i][gameState.tournRound] = gameState.scores[i];
      }
      setGameState(prev => ({ ...prev, tournScores: newTournScores }));
      
      const winner = getWinner();
      saveToHistory('Турнир туры ' + (gameState.tournRound + 1), winner.name);
      
      if (gameState.tournRound + 1 >= 5) {
        setScreen('winner');
        launchConfetti();
      }
    } else {
      const winner = getWinner();
      saveToHistory('Жай ойын', winner.name);
      setScreen('winner');
      launchConfetti();
    }
  };

  const nextTournamentRound = () => {
    setGameState(prev => ({ ...prev, tournRound: prev.tournRound + 1 }));
    setScreen('setup');
  };

  const getWinner = () => {
    let best = { i: 0, s: -1, name: '' };
    if (gameState.opts.tournament && gameState.tournRound >= 4) {
      const totals = gameState.tournScores.map(r => r.reduce((a, b) => a + (b || 0), 0));
      for (let i = 0; i < gameState.tc; i++) {
        if (totals[i] > best.s) {
          best = { i, s: totals[i], name: gameState.tnames[i] };
        }
      }
    } else {
      for (let i = 0; i < gameState.tc; i++) {
        if (gameState.scores[i] > best.s) {
          best = { i, s: gameState.scores[i], name: gameState.tnames[i] };
        }
      }
    }
    return best;
  };

  const saveToHistory = (type: string, winner: string) => {
    const entry: HistoryEntry = {
      date: new Date().toLocaleString('kk-KZ'),
      type,
      category: allCategories[gameState.cat]?.name || 'Белгісіз',
      scores: gameState.tnames.slice(0, gameState.tc).map((name, i) => ({ name, score: gameState.scores[i] })),
      winner
    };
    const newHist = [entry, ...history].slice(0, 50);
    setHistory(newHist);
    localStorage.setItem('qh', JSON.stringify(newHist));
  };

  const handleAddCategory = async (category: Category, questions: Question[]) => {
    const newCats = [...dynamicCategories, category];
    const newQs = [...customQuestions, ...questions];
    
    setDynamicCategories(newCats);
    setCustomQuestions(newQs);
    
    localStorage.setItem('qcats', JSON.stringify(newCats));
    localStorage.setItem('qq', JSON.stringify(newQs));

    // Save to API
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: [category], questions })
      });
    } catch (e) {
      console.error('Failed to save shared data:', e);
    }
  };

  return (
    <div className={`flex min-h-screen flex-col bg-[var(--bg3)] text-[var(--text)] transition-all ${projectorMode ? "projector-mode" : ""}`}>
      {/* Header */}
      {!projectorMode && (
        <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-[var(--border2)] bg-[var(--bg3)]/95 px-4 py-2 shadow-md">
          <div className="flex flex-col leading-none">
            <span className="font-oswald text-lg font-bold tracking-wider text-white">QAZAQSTAN</span>
            <span className="text-[8px] uppercase tracking-[3px] text-[var(--text2)]">Quiz Tournament</span>
          </div>
          <div className="mx-2 h-8 w-px bg-[var(--border2)]" />
          <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text2)]">
            {screen === 'game' ? (
              <>РАУНД <span className="text-white">{gameState.tournRound + 1}</span>: {allCategories[gameState.cat]?.name || 'Белгісіз'}</>
            ) : (
              <>БАСҚАРУ ПАНЕЛІ</>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setProjectorMode(!projectorMode)}
              className={`rounded-lg border p-2 transition-all ${projectorMode ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--border)] text-[var(--text2)] bg-white/5"}`}
              title="Projector Mode"
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setAdminOpen(true)}
              className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-[var(--text2)] transition-all hover:text-white"
              title="Admin Panel"
            >
              <Lock size={16} />
            </button>
          </div>
        </header>
      )}

      {projectorMode && (
        <button 
          onClick={() => setProjectorMode(false)}
          className="fixed top-4 right-4 z-[1000] rounded-full bg-black/50 p-3 text-white/50 backdrop-blur-md transition-all hover:bg-black/80 hover:text-white"
          title="Exit Projector Mode"
        >
          <Monitor size={20} />
        </button>
      )}

      {/* Main Content */}
      <main className="relative flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {screen === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
              <SetupScreen 
                tc={gameState.tc} setTc={n => setGameState(p => ({...p, tc: n}))}
                tnames={gameState.tnames} setTnames={n => setGameState(p => ({...p, tnames: n}))}
                cat={gameState.cat} setCat={c => setGameState(p => ({...p, cat: c}))}
                categories={allCategories}
                opts={gameState.opts} setOpts={o => setGameState(p => ({...p, opts: o}))}
                timer={gameState.timer} setTimer={t => setGameState(p => ({...p, timer: t}))}
                bonusPct={gameState.bonusPct} setBonusPct={b => setGameState(p => ({...p, bonusPct: b}))}
                onStart={startGame}
              />
            </motion.div>
          )}
          {screen === 'game' && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
              <GameScreen 
                state={gameState}
                categories={allCategories}
                projectorMode={projectorMode}
                onOpenQ={openQuestion}
                onNextRound={nextTournamentRound}
                onEndTournament={() => setScreen('winner')}
                onGoBack={() => setScreen('setup')}
                onOpenAdmin={() => setAdminOpen(true)}
              />
            </motion.div>
          )}
          {screen === 'winner' && (
            <motion.div key="winner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
              <WinnerScreen 
                winner={getWinner()}
                scores={gameState.tnames.slice(0, gameState.tc).map((n, i) => ({ name: n, score: gameState.scores[i] }))}
                onNewGame={() => {
                  setGameState(p => ({...p, tournRound: 0, tournScores: [], usedCats: []}));
                  setScreen('setup');
                }}
                onViewHistory={() => setHistoryOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Nav */}
      {!projectorMode && (
        <footer className="sticky bottom-0 z-50 flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg3)]/98 px-4 py-2">
          <div className="flex gap-2">
            <button onClick={() => setHistoryOpen(true)} className="p-2 text-[var(--text3)] hover:text-[var(--gold)]" title="History"><History size={20} /></button>
            <button onClick={() => setScreen('setup')} className="p-2 text-[var(--text3)] hover:text-[var(--text2)]" title="Back to Setup"><ArrowLeft size={20} /></button>
          </div>
          <div className="hidden sm:flex gap-3">
            <button onClick={() => setAdminOpen(true)} className="rounded-lg border border-[var(--border2)] bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] hover:bg-white/10 hover:text-white">Деректерді басқару</button>
          </div>
          <div className="flex gap-2 items-center">
            {user ? (
              <div className="flex items-center gap-2 mr-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white leading-none">{user.displayName || 'Пайдаланушы'}</span>
                  <span className="text-[8px] text-[var(--text3)] uppercase tracking-tighter">Аккаунт белсенді</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-[var(--gold)]/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/30">
                    <UserIcon size={14} />
                  </div>
                )}
                <button 
                  onClick={async () => { if(window.confirm('Шығуды растайсыз ба?')) await logout(); }} 
                  className="p-2 text-[var(--text3)] hover:text-red-400" 
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="flex items-center gap-2 rounded-lg bg-[var(--gold)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1a0f00] hover:scale-105 transition-all mr-2"
              >
                <LogIn size={14} />
                Кіру
              </button>
            )}
            <button onClick={() => setTheme('dark')} className={`p-2 ${theme === 'dark' ? "text-[var(--gold)]" : "text-[var(--text3)]"}`}><Moon size={18} /></button>
            <button onClick={() => setTheme('light')} className={`p-2 ${theme === 'light' ? "text-[var(--gold)]" : "text-[var(--text3)]"}`}><Sun size={18} /></button>
          </div>
        </footer>
      )}

      {/* Modals */}
      <QuestionModal 
        isOpen={questionOpen}
        onClose={closeQuestion}
        projectorMode={projectorMode}
        question={curIdx !== null ? gameState.qs[curIdx] : null}
        shuffled={curIdx !== null ? gameState.shuffled[curIdx] : null}
        isBonus={curIdx !== null ? gameState.bonus.includes(curIdx) : false}
        isFinal={gameState.frActive}
        timerSec={gameState.frActive ? Math.max(gameState.timer, 20) : gameState.timer}
        curTeamName={gameState.tnames[gameState.curTeam]}
        curTeamColor={TC[gameState.curTeam]}
        curTeamRGB={TCR[gameState.curTeam]}
        onAnswer={handleAnswer}
      />

      <AdminPanel 
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        questions={allQuestions}
        setQuestions={setCustomQuestions}
        categories={allCategories}
      />

      <HistoryModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
      />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {screen === 'setup' && (
        <ChatBot 
          onAddCategory={handleAddCategory}
          existingCategoryCount={allCategories.length}
        />
      )}

      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1000]" />
    </div>
  );
}
