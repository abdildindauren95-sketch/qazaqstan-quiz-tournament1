import React from 'react';
import { X, Trophy, Calendar, Hash } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f2035] to-[#0a1828] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-oswald text-xl font-bold text-[var(--gold)] flex items-center gap-2">
            📜 ОЙЫН ТАРИХЫ
          </h2>
          <button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-[var(--text2)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text3)]">
              <div className="text-5xl mb-4 opacity-20">📜</div>
              <p className="text-sm font-bold uppercase tracking-widest">Әзірге тарих бос</p>
              <p className="text-[10px] mt-2">Ойын аяқталған соң нәтижелер осында сақталады</p>
            </div>
          ) : (
            history.map((entry, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/8 hover:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white">{entry.date}</div>
                      <div className="text-[8px] uppercase tracking-widest text-[var(--text3)]">{entry.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 border border-green-500/20">
                    <Trophy size={12} className="text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{entry.winner}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-[8px] uppercase tracking-widest text-[var(--text3)] mb-1">Категория</div>
                    <div className="text-[10px] font-bold text-[var(--text2)]">{entry.category}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[8px] uppercase tracking-widest text-[var(--text3)] mb-1">Ұпайлар</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.scores.map((s, si) => (
                        <div key={si} className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 border border-white/5">
                          <span className="text-[9px] font-bold text-[var(--text2)]">{s.name}:</span>
                          <span className="text-[10px] font-oswald font-bold text-white">{s.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5 text-center">
          <p className="text-[9px] text-[var(--text3)] uppercase tracking-[2px]">Соңғы 50 ойын сақталады</p>
        </div>
      </div>
    </div>
  );
};
