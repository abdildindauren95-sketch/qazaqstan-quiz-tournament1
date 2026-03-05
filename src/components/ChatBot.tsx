import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Loader2, Sparkles, Trash2, ChevronDown, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAIStream, generateCategory } from '../services/geminiService';
import { Category, Question } from '../types';

interface ChatBotProps {
  onAddCategory: (category: Category, questions: Question[]) => void;
  existingCategoryCount: number;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  isGenerating?: boolean;
  type?: 'chat' | 'category';
}

const SUGGESTED_QUESTIONS = [
  "Абылай хан туралы айтып бер",
  "Алтын Орда тарихы",
  "Жаңа категория қос: Қазақ хандығы",
  "Ойын ережелері қандай?"
];

export const ChatBot: React.FC<ChatBotProps> = ({ onAddCategory, existingCategoryCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Сәлем! Мен Қазақстан тарихы бойынша AI көмекшімін. Маған сұрақ қоя аласыз немесе жаңа тест категориясын жасауды сұрай аласыз (мысалы: "Абылай хан туралы категория жаса").' }
    ];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages.filter(m => !m.isGenerating)));
  }, [messages]);

  const chatHistory = useMemo(() => {
    return messages
      .filter(m => !m.isGenerating)
      .map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const userText = (customText || input).trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const text = userText.toLowerCase();
      const isCategoryRequest = 
        (text.includes('категория') || text.includes('тест') || text.includes('жаса') || text.includes('қос')) &&
        !text.includes('?') && text.length < 50;

      if (isCategoryRequest) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Жаңа категория және сұрақтар дайындаудамын... ⏳', isGenerating: true, type: 'category' }]);
        
        const { category, questions } = await generateCategory(userText, existingCategoryCount);
        onAddCategory(category, questions);

        setMessages(prev => {
          const filtered = prev.filter(m => !m.isGenerating);
          return [...filtered, { 
            role: 'bot', 
            text: `✅ **"${category.icon} ${category.name}"** категориясы сәтті қосылды! \n\nОйынды бастау үшін "ОЙЫНДЫ БАСТАУ" батырмасын басыңыз. Тағы не көмектесе аламын?`,
            type: 'category'
          }];
        });
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: '', isGenerating: true, type: 'chat' }]);
        
        let fullText = '';
        const stream = chatWithAIStream(userText, chatHistory);

        for await (const chunk of stream) {
          fullText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.isGenerating) {
              return [...prev.slice(0, -1), { ...last, text: fullText }];
            }
            return prev;
          });
        }

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.isGenerating) {
            return [...prev.slice(0, -1), { ...last, isGenerating: false }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isGenerating);
        return [...filtered, { role: 'bot', text: 'Кешіріңіз, қате орын алды. Қайтадан байқап көріңізші.' }];
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Чат тарихын өшіруді растайсыз ба?')) {
      setMessages([{ role: 'bot', text: 'Сәлем! Мен Қазақстан тарихы бойынша AI көмекшімін. Маған сұрақ қоя аласыз немесе жаңа тест категориясын жасауды сұрай аласыз.' }]);
      localStorage.removeItem('chat_history');
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[#b07010] text-[#1a0f00] shadow-lg shadow-[var(--gold)]/20"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile/outside click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[65] bg-black/20 backdrop-blur-sm lg:hidden"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-[70] flex h-[550px] w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--border2)] bg-[var(--panel)] shadow-2xl backdrop-blur-xl max-sm:right-4 max-sm:left-4 max-sm:w-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between bg-white/5 p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/20 text-[var(--gold)]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">AI Көмекші</div>
                  <div className="text-[10px] text-[var(--text2)] uppercase tracking-widest">History Expert</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-2 text-[var(--text3)] hover:text-red-400 transition-colors"
                  title="Тарихты тазалау"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-[var(--text3)] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-[var(--gold)] text-[#1a0f00] rounded-tr-none font-medium' 
                      : 'bg-white/5 border border-[var(--border)] text-[var(--text)] rounded-tl-none'
                  }`}>
                    {m.isGenerating && !m.text ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="animate-pulse">Ойлануда...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1].role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-[var(--border)] text-[var(--text)] rounded-2xl rounded-tl-none p-3 shadow-sm">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {!loading && messages.length < 10 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[10px] bg-white/5 border border-[var(--border)] rounded-full px-3 py-1 text-[var(--text2)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[var(--border)] bg-white/5">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Сұрақ қойыңыз немесе категория атауы..."
                  className="flex-1 rounded-xl border border-[var(--border2)] bg-[var(--bg3)] p-3 pr-10 text-sm text-white outline-none focus:border-[var(--gold)] transition-all"
                />
                <button
                  disabled={loading || !input.trim()}
                  onClick={() => handleSend()}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)] text-[#1a0f00] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-[10px] text-center text-[var(--text3)] flex items-center justify-center gap-1">
                <Sparkles size={10} />
                <span>AI автоматты түрде 18 сұрақ дайындай алады</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
};
