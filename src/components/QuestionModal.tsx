import React, { useEffect, useState } from 'react';
import { LTRS, TC, TCR } from '../constants';
import { Question } from '../types';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectorMode?: boolean;
  question: Question | null;
  shuffled: { opts: string[]; ci: number } | null;
  isBonus: boolean;
  isFinal: boolean;
  timerSec: number;
  curTeamName: string;
  curTeamColor: string;
  curTeamRGB: string;
  onAnswer: (correct: boolean) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen, onClose, projectorMode, question, shuffled, isBonus, isFinal, timerSec, curTeamName, curTeamColor, curTeamRGB, onAnswer
}) => {
  const [timeLeft, setTimeLeft] = useState(timerSec);
  const [selected, setSelected] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(timerSec);
      setSelected(null);
      setIsLocked(false);
      setShowResult(false);
    }
  }, [isOpen, timerSec]);

  useEffect(() => {
    if (isOpen && !isLocked && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, isLocked, timeLeft]);

  const handleTimeout = () => {
    setIsLocked(true);
    setCorrect(false);
    setShowResult(true);
    onAnswer(false);
  };

  const handleSubmit = () => {
    if (selected === null || isLocked) return;
    setIsLocked(true);
    const isCorrect = selected === shuffled?.ci;
    setCorrect(isCorrect);
    setShowResult(true);
    onAnswer(isCorrect);
  };

  if (!isOpen || !question || !shuffled) return null;

  const pts = isFinal ? 50 : (isBonus ? question.pts * 2 : question.pts);
  const circ = 2 * Math.PI * 45;
  const pct = timeLeft / timerSec;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-start md:items-center justify-center bg-black/90 p-2 md:p-8 backdrop-blur-xl transition-all duration-500 overflow-y-auto ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className={`relative my-4 md:my-16 flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f2035] to-[#0a1828] shadow-2xl transition-all duration-500 ${projectorMode ? 'w-full max-w-5xl p-4 md:p-12' : 'w-full max-w-xl p-5 md:p-8'} ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
        
        {/* Timer */}
        <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2">
          <div className={`relative flex items-center justify-center rounded-full bg-[#0f2035] border-4 border-white/10 shadow-2xl ${projectorMode ? 'h-20 w-20 md:h-32 md:w-32' : 'h-16 w-16 md:h-24 md:w-24'}`}>
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={timeLeft <= 5 ? "#ef4444" : "var(--gold)"} 
                strokeWidth="8" 
                strokeDasharray={circ} 
                strokeDashoffset={circ * (1 - pct)}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className={`font-oswald font-bold text-white ${projectorMode ? 'text-2xl md:text-5xl' : 'text-xl md:text-3xl'} ${timeLeft <= 5 ? 'animate-pulse text-red-500' : ''}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="mt-4 md:mt-8 text-center">
          <div 
            className={`mx-auto mb-3 md:mb-6 inline-block rounded-full px-3 md:px-6 py-1 md:py-2 text-[9px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[4px] shadow-lg ${isBonus ? 'bg-[var(--gold)] text-black' : 'bg-white/10 text-[var(--gold)]'}`}
            style={!isBonus ? { color: curTeamColor, backgroundColor: `rgba(${curTeamRGB}, 0.1)`, borderColor: `rgba(${curTeamRGB}, 0.2)`, border: '1px solid' } : {}}
          >
            {isBonus ? `★ БОНУС ${pts} ҮПАЙ` : `${pts} ҮПАЙЛЫҚ СҰРАҚ`}
          </div>
          
          <h2 className={`font-oswald font-bold leading-tight text-white mb-4 md:mb-10 ${projectorMode ? 'text-2xl md:text-5xl' : 'text-lg md:text-3xl'}`}>
            {question.q}
          </h2>

          {!showResult ? (
            <div className={`grid gap-2 md:gap-4 ${projectorMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {shuffled.opts.map((opt, i) => (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => setSelected(i)}
                  className={`group relative flex items-center gap-2 md:gap-4 rounded-lg md:rounded-2xl border-2 p-3 md:p-6 text-left transition-all duration-300 ${selected === i ? 'border-[var(--gold)] bg-[var(--gold)]/10' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                >
                  <div className={`flex h-8 w-8 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-md md:rounded-xl font-oswald text-base md:text-xl font-bold transition-all ${selected === i ? 'bg-[var(--gold)] text-black' : 'bg-white/10 text-white'}`}>
                    {LTRS[i]}
                  </div>
                  <div className={`font-medium text-white ${projectorMode ? 'text-lg md:text-2xl' : 'text-sm md:text-lg'}`}>
                    {opt}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 md:py-10">
              <div className={`mb-3 md:mb-6 flex h-20 w-20 md:h-32 md:w-32 items-center justify-center rounded-full text-3xl md:text-6xl shadow-2xl ${correct ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {correct ? '✓' : '✗'}
              </div>
              <div className={`font-oswald text-2xl md:text-5xl font-black uppercase tracking-widest ${correct ? 'text-green-500' : 'text-red-500'}`}>
                {correct ? 'ДҰРЫС!' : 'ҚАТЕ!'}
              </div>
              {!correct && (
                <div className="mt-2 md:mt-4 text-base md:text-xl text-white/60">
                  Дұрыс жауап: <span className="font-bold text-[var(--gold)]">{shuffled.opts[shuffled.ci]}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 border-t border-white/5 pt-4 md:pt-8">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 md:h-3 md:w-3 rounded-full animate-pulse" style={{ backgroundColor: curTeamColor }} />
              <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/40">Кезек: <span className="text-white">{curTeamName}</span></span>
            </div>
            
            {!showResult ? (
              <button
                disabled={selected === null || isLocked}
                onClick={handleSubmit}
                className="w-full md:w-auto rounded-lg md:rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[#b07010] px-6 md:px-10 py-2.5 md:py-4 font-oswald text-sm md:text-lg font-black tracking-widest text-[#1a0f00] shadow-xl transition-all hover:scale-105 hover:shadow-[var(--gold)]/20 disabled:opacity-30 disabled:hover:scale-100"
              >
                ЖАУАПТЫ ТЕКСЕРУ
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full md:w-auto rounded-lg md:rounded-2xl bg-white/10 px-6 md:px-10 py-2.5 md:py-4 font-oswald text-sm md:text-lg font-black tracking-widest text-white shadow-xl transition-all hover:bg-white/20 hover:scale-105"
              >
                КЕЛЕСІ СҰРАҚ ▶
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
