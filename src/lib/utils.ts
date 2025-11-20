import { WordProgress, LearningStats, APIConfig } from '@/types';

// --- LocalStorage Keys ---
const STORAGE_KEYS = {
  WORDS: 'lingo-words',
  STATS: 'lingo-stats',
  API_CONFIG: 'lingo-api-config',
} as const;

// --- API Configuration Management ---
export const saveAPIConfig = (config: APIConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  }
};

export const loadAPIConfig = (): APIConfig | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
  return data ? JSON.parse(data) : null;
};

// --- Words Management ---
export const saveWords = (words: WordProgress[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  }
};

export const loadWords = (): WordProgress[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.WORDS);
  if (!data) return [];

  const words = JSON.parse(data);
  // 转换日期字符串回 Date 对象
  return words.map((w: any) => ({
    ...w,
    timestamp: new Date(w.timestamp),
    lastReviewed: new Date(w.lastReviewed),
    nextReview: new Date(w.nextReview),
  }));
};

// --- Learning Statistics ---
export const saveStats = (stats: LearningStats): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }
};

export const loadStats = (): LearningStats => {
  if (typeof window === 'undefined') {
    return {
      totalWords: 0,
      wordsToday: 0,
      reviewsToday: 0,
      streak: 0,
      lastStudyDate: new Date().toISOString().split('T')[0],
    };
  }

  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  if (!data) {
    return {
      totalWords: 0,
      wordsToday: 0,
      reviewsToday: 0,
      streak: 0,
      lastStudyDate: new Date().toISOString().split('T')[0],
    };
  }

  return JSON.parse(data);
};

export const updateStats = (
  action: 'new_word' | 'review',
  currentStats: LearningStats
): LearningStats => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStats = { ...currentStats };

  // 检查是否是新的一天
  if (currentStats.lastStudyDate !== today) {
    // 检查连续性
    if (currentStats.lastStudyDate === yesterday) {
      newStats.streak += 1;
    } else if (currentStats.lastStudyDate < yesterday) {
      newStats.streak = 1;
    }

    newStats.wordsToday = 0;
    newStats.reviewsToday = 0;
    newStats.lastStudyDate = today;
  }

  if (action === 'new_word') {
    newStats.totalWords += 1;
    newStats.wordsToday += 1;
  } else {
    newStats.reviewsToday += 1;
  }

  saveStats(newStats);
  return newStats;
};

// --- Spaced Repetition Algorithm (SuperMemo SM-2) ---
export const calculateNextReview = (
  quality: number, // 0-5 (0=complete blackout, 5=perfect response)
  repetitions: number,
  easeFactor: number,
  interval: number
): { nextInterval: number; nextEaseFactor: number; nextRepetitions: number } => {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  // 更新难度因子
  newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // 回答不好，重新开始
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return {
    nextInterval: newInterval,
    nextEaseFactor: newEaseFactor,
    nextRepetitions: newRepetitions,
  };
};

export const getNextReviewDate = (intervalDays: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

// --- Words Due for Review ---
export const getWordsForReview = (words: WordProgress[]): WordProgress[] => {
  const now = new Date();
  return words.filter(word => new Date(word.nextReview) <= now);
};

// --- Generate Unique ID ---
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
