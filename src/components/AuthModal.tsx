import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Chrome, Apple, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { loginWithGoogle, loginWithApple } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    setError(null);
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithApple();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Кіру кезінде қате орын алды. Firebase конфигурациясын тексеріңіз.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border2)] bg-[var(--panel)] shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--gold)]/20 to-transparent p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gold)]/20 text-[var(--gold)] shadow-lg shadow-[var(--gold)]/10">
                <ShieldCheck size={32} />
              </div>
              <h2 className="font-oswald text-2xl font-bold tracking-wider text-white uppercase">
                Жүйеге кіру
              </h2>
              <p className="mt-2 text-sm text-[var(--text2)]">
                Нәтижелеріңізді сақтау және жеке категориялар жасау үшін аккаунтыңызға кіріңіз
              </p>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-[var(--text3)] hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={() => handleLogin('google')}
                disabled={!!loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading === 'google' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Chrome size={20} />
                )}
                Google арқылы кіру
              </button>

              <button
                onClick={() => handleLogin('apple')}
                disabled={!!loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black border border-white/20 p-4 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading === 'apple' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Apple size={20} />
                )}
                Apple арқылы кіру
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-[var(--panel)] px-4 text-[var(--text3)]">немесе</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 border border-[var(--border)] p-4 text-sm font-bold text-[var(--text2)] transition-all hover:bg-white/10"
              >
                <UserIcon size={20} />
                Қонақ ретінде жалғастыру
              </button>
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 text-center">
              <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest">
                Қазақстан тарихы турнирі &copy; 2024
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
