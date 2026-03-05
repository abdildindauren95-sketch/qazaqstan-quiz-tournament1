import React, { useState } from 'react';
import { X, Trash2, Download, Upload, RefreshCw, Plus } from 'lucide-react';
import { Category, Question } from '../types';
import { CATS, DQ } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
  categories: Category[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, questions, setQuestions, categories }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<'list' | 'add' | 'io' | 'data'>('list');
  
  // Add Question State
  const [newQ, setNewQ] = useState<Question>({
    cat: 0,
    pts: 10,
    q: "",
    opts: ["", "", "", ""],
    correct: 0
  });

  if (!isOpen) return null;

  const handleLogin = () => {
    if (password === 'teacher123') {
      setLoggedIn(true);
    } else {
      alert('Қате құпия сөз!');
    }
  };

  const deleteQuestion = async (idx: number) => {
    if (!confirm('Жою керек пе?')) return;
    const newQs = [...questions];
    newQs.splice(idx, 1);
    setQuestions(newQs);
    localStorage.setItem('qq', JSON.stringify(newQs));
    
    // Sync with API (Assuming we want to keep questions in sync)
    try {
      await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: newQs, categories: categories.filter(c => c.id >= 100) }) // Only sync dynamic categories
      });
    } catch (e) {
      console.error('Failed to sync deletion:', e);
    }
  };

  const addQuestion = async () => {
    if (!newQ.q || newQ.opts.some(o => !o)) {
      alert('Барлық өрістерді толтырыңыз!');
      return;
    }
    const newQs = [...questions, newQ];
    setQuestions(newQs);
    localStorage.setItem('qq', JSON.stringify(newQs));
    
    // Sync with API
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [newQ] })
      });
    } catch (e) {
      console.error('Failed to sync addition:', e);
    }

    setNewQ({ cat: 0, pts: 10, q: "", opts: ["", "", "", ""], correct: 0 });
    setTab('list');
    alert('Сұрақ қосылды!');
  };

  const resetData = async () => {
    if (!confirm('Барлық деректерді өшіріп, бастапқы қалпына келтіру керек пе?')) return;
    setQuestions(DQ);
    localStorage.removeItem('qq');
    localStorage.removeItem('qh');
    localStorage.removeItem('qcats');

    // Sync with API
    try {
      await fetch('/api/data', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to reset server data:', e);
    }

    alert('Деректер қалпына келтірілді. Бетті жаңартыңыз.');
    window.location.reload();
  };

  const exportData = () => {
    const data = JSON.stringify(questions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qazaqstan_quiz_questions_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported)) {
          setQuestions(imported);
          localStorage.setItem('qq', JSON.stringify(imported));
          alert('Сұрақтар сәтті импортталды!');
        }
      } catch (err) {
        alert('Қате файл форматы!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f2035] to-[#0a1828] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-oswald text-xl font-bold text-[var(--gold)] flex items-center gap-2">
            🔐 МҰҒАЛІМ ПАНЕЛІ
          </h2>
          <button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-[var(--text2)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!loggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs space-y-4">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">👨‍🏫</div>
                <p className="text-xs text-[var(--text2)] uppercase tracking-widest">Админ ретінде кіру</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Құпия сөз..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-white outline-none focus:border-[var(--gold)]"
              />
              <button
                onClick={handleLogin}
                className="w-full rounded-xl bg-[var(--gold)] py-3 font-oswald font-bold tracking-widest text-[#1a0f00] hover:opacity-90 transition-all"
              >
                КІРУ
              </button>
              <p className="text-[10px] text-center text-[var(--text3)]">Әдепкі құпия сөз: teacher123</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-white/10 bg-white/5">
              {[
                { id: 'list', label: 'Сұрақтар', icon: '📚' },
                { id: 'add', label: 'Қосу', icon: '➕' },
                { id: 'io', label: 'Импорт/Экспорт', icon: '💾' },
                { id: 'data', label: 'Деректер', icon: '⚙️' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${tab === t.id ? 'bg-white/10 text-[var(--gold)] border-b-2 border-[var(--gold)]' : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
                >
                  <span className="mr-1">{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'list' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest">Барлық сұрақтар ({questions.length})</h3>
                    <div className="text-[10px] text-[var(--text3)]">Категория бойынша сұрыпталған</div>
                  </div>
                  {categories.map(cat => {
                    const catQs = questions.filter(q => q.cat === cat.id);
                    if (catQs.length === 0) return null;
                    return (
                      <div key={cat.id} className="space-y-2">
                        <div className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest bg-[var(--gold)]/10 p-1 px-2 rounded inline-block">
                          {cat.icon} {cat.name}
                        </div>
                        {catQs.map((q, i) => (
                          <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/8 transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-[var(--text2)]">{q.pts} үпай</span>
                                <span className="text-[11px] font-medium text-white truncate">{q.q}</span>
                              </div>
                              <div className="flex gap-2">
                                {q.opts.map((opt, oi) => (
                                  <span key={oi} className={`text-[8px] px-1 rounded ${oi === q.correct ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-[var(--text3)]'}`}>
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteQuestion(questions.indexOf(q))}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === 'add' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] mb-1">Категория</label>
                      <select 
                        value={newQ.cat}
                        onChange={e => setNewQ({...newQ, cat: +e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--gold)]"
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] mb-1">Ұпай</label>
                      <select 
                        value={newQ.pts}
                        onChange={e => setNewQ({...newQ, pts: +e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--gold)]"
                      >
                        {[10, 20, 30, 50].map(p => <option key={p} value={p}>{p} үпай</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] mb-1">Сұрақ мәтіні</label>
                    <textarea 
                      value={newQ.q}
                      onChange={e => setNewQ({...newQ, q: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--gold)] h-24 resize-none"
                      placeholder="Сұрақты жазыңыз..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text2)] mb-1">Жауап нұсқалары (Дұрыс жауапты таңдаңыз)</label>
                    {newQ.opts.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="correct" 
                          checked={newQ.correct === i}
                          onChange={() => setNewQ({...newQ, correct: i})}
                          className="accent-[var(--gold)]"
                        />
                        <input 
                          value={opt}
                          onChange={e => {
                            const newOpts = [...newQ.opts];
                            newOpts[i] = e.target.value;
                            setNewQ({...newQ, opts: newOpts});
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--gold)]"
                          placeholder={`Нұсқа ${i+1}...`}
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={addQuestion}
                    className="w-full bg-gradient-to-br from-[var(--gold)] to-[#b07010] py-4 rounded-xl font-oswald font-bold tracking-widest text-[#1a0f00] shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> СҰРАҚТЫ САҚТАУ
                  </button>
                </div>
              )}

              {tab === 'io' && (
                <div className="max-w-md mx-auto py-10 space-y-6">
                  <div className="p-6 rounded-2xl border border-white/5 bg-white/5 text-center">
                    <div className="text-3xl mb-3">📤</div>
                    <h3 className="text-sm font-bold text-white mb-2">Сұрақтарды экспорттау</h3>
                    <p className="text-[10px] text-[var(--text3)] mb-4">Барлық сұрақтарды JSON файлы ретінде жүктеп алыңыз.</p>
                    <button 
                      onClick={exportData}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold text-white transition-all"
                    >
                      <Download size={16} /> JSON ЖҮКТЕУ
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-white/5 bg-white/5 text-center">
                    <div className="text-3xl mb-3">📥</div>
                    <h3 className="text-sm font-bold text-white mb-2">Сұрақтарды импорттау</h3>
                    <p className="text-[10px] text-[var(--text3)] mb-4">JSON файлынан сұрақтарды жүктеңіз (бұрынғы сұрақтар сақталады).</p>
                    <label className="w-full flex items-center justify-center gap-2 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 border border-[var(--gold)]/30 py-3 rounded-xl text-xs font-bold text-[var(--gold)] transition-all cursor-pointer">
                      <Upload size={16} /> ФАЙЛ ТАҢДАУ
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {tab === 'data' && (
                <div className="max-w-md mx-auto py-10">
                  <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                    <div className="text-3xl mb-3">⚠️</div>
                    <h3 className="text-sm font-bold text-red-400 mb-2">Қауіпті аймақ</h3>
                    <p className="text-[10px] text-[var(--text3)] mb-6">Барлық сұрақтар мен ойын тарихы өшіріледі. Бұл әрекетті қайтару мүмкін емес.</p>
                    <button 
                      onClick={resetData}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 py-3 rounded-xl text-xs font-bold text-red-400 transition-all"
                    >
                      <RefreshCw size={16} /> БАРЛЫҚ ДЕРЕКТЕРДІ ТАЗАЛАУ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
