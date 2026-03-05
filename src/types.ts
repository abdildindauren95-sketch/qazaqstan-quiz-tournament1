export interface Question {
  cat: number;
  pts: number;
  q: string;
  opts: string[];
  correct: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface TeamScore {
  name: string;
  score: number;
}

export interface HistoryEntry {
  date: string;
  type: string;
  category?: string;
  scores: TeamScore[];
  winner: string;
}

export interface GameState {
  tc: number;
  tnames: string[];
  cat: number;
  opts: {
    minus: boolean;
    tournament: boolean;
    final: boolean;
  };
  timer: number;
  bonusPct: number;
  scores: number[];
  curTeam: number;
  qs: (Question | null)[];
  cellSt: ('open' | 'correct' | 'wrong')[];
  bonus: number[];
  shuffled: { opts: string[]; ci: number }[];
  frActive: boolean;
  frDone: boolean;
  tournActive: boolean;
  tournRound: number;
  tournScores: (number | null)[][];
  usedCats: number[];
}
