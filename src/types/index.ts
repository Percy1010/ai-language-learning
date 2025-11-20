// --- Core Types ---
export interface WordData {
  word: string;
  translation: string;
  pronunciation: string;
  definition: string;
  mnemonic: string;
  image_prompt: string;
  example_sentence: string;
  timestamp: Date;
  partOfSpeech?: string;
}

export interface WordProgress extends WordData {
  id: string;
  reviewCount: number;
  lastReviewed: Date;
  nextReview: Date;
  confidence: 'learning' | 'familiar' | 'mastered';
  easeFactor: number; // SM-2 算法的难度因子
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface LearningStats {
  totalWords: number;
  wordsToday: number;
  reviewsToday: number;
  streak: number;
  lastStudyDate: string;
}

export type AIProvider =
  | 'openai'
  | 'deepseek'
  | 'zhipu'
  | 'qwen'
  | 'moonshot'
  | 'ernie'
  | 'custom';

export interface APIConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string;
  model: string;
}

export interface ProviderPreset {
  name: string;
  baseURL: string;
  defaultModel: string;
  models: string[];
  description: string;
  websiteURL: string;
}
