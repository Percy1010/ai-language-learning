"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  BookOpen,
  MessageSquare,
  Sparkles,
  Volume2,
  Loader2,
  Menu,
  X,
  Settings,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Trophy,
  RotateCcw,
  AlertCircle,
  Check,
  XCircle,
} from 'lucide-react';
import { WordData, WordProgress, ChatMessage, LearningStats, APIConfig } from '@/types';
import {
  loadAPIConfig,
  loadWords,
  saveWords,
  loadStats,
  updateStats,
  calculateNextReview,
  getNextReviewDate,
  getWordsForReview,
  generateId,
} from '@/lib/utils';

export default function LanguageLearningApp() {
  const router = useRouter();

  // --- State Management ---
  const [input, setInput] = useState('');
  const [currentWord, setCurrentWord] = useState<WordProgress | null>(null);
  const [allWords, setAllWords] = useState<WordProgress[]>([]);
  const [wordsForReview, setWordsForReview] = useState<WordProgress[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [apiConfig, setApiConfig] = useState<APIConfig | null>(null);

  // UI States
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Speech synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Load Data on Mount ---
  useEffect(() => {
    const config = loadAPIConfig();
    setApiConfig(config);

    const words = loadWords();
    setAllWords(words);

    const loadedStats = loadStats();
    setStats(loadedStats);

    const dueWords = getWordsForReview(words);
    setWordsForReview(dueWords);
  }, []);

  // --- Save data whenever it changes ---
  useEffect(() => {
    if (allWords.length > 0) {
      saveWords(allWords);
    }
  }, [allWords]);

  // --- Speech Synthesis ---
  const speakWord = (text: string) => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis not supported in your browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- API Call to Generate Word ---
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    if (!apiConfig || !apiConfig.apiKey) {
      setError('Please configure your API settings first');
      setTimeout(() => router.push('/settings'), 1500);
      return;
    }

    setError('');
    setCurrentWord(null);
    setChatHistory([]);
    setIsLoadingText(true);
    setIsLoadingImage(true);

    try {
      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: input,
          apiConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate word data');
      }

      const wordData: WordData = await response.json();
      setIsLoadingText(false);

      // Convert to WordProgress
      const wordProgress: WordProgress = {
        ...wordData,
        id: generateId(),
        timestamp: new Date(wordData.timestamp),
        reviewCount: 0,
        lastReviewed: new Date(),
        nextReview: getNextReviewDate(1), // Review tomorrow
        confidence: 'learning',
        easeFactor: 2.5,
      };

      setCurrentWord(wordProgress);

      // Add to words list
      setAllWords((prev) => {
        const existing = prev.find((w) => w.word.toLowerCase() === wordProgress.word.toLowerCase());
        if (existing) {
          return prev;
        }
        return [wordProgress, ...prev];
      });

      // Update stats
      if (stats) {
        const newStats = updateStats('new_word', stats);
        setStats(newStats);
      }

      // Simulate image loading delay
      setTimeout(() => {
        setIsLoadingImage(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoadingText(false);
      setIsLoadingImage(false);
    }
  };

  // --- Chat with AI ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentWord) return;

    if (!apiConfig || !apiConfig.apiKey) {
      setError('Please configure your API settings');
      return;
    }

    const newMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatHistory((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, newMsg],
          word: currentWord.word,
          apiConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Review System ---
  const startReviewMode = () => {
    if (wordsForReview.length === 0) {
      alert('No words to review yet. Great job!');
      return;
    }
    setShowReviewMode(true);
    setCurrentReviewIndex(0);
    setCurrentWord(wordsForReview[0]);
    setChatHistory([]);
  };

  const handleReviewRating = (quality: number) => {
    if (!currentWord) return;

    const currentInterval =
      Math.floor((new Date(currentWord.nextReview).getTime() - new Date(currentWord.lastReviewed).getTime()) / 86400000) || 1;

    const { nextInterval, nextEaseFactor, nextRepetitions } = calculateNextReview(
      quality,
      currentWord.reviewCount,
      currentWord.easeFactor,
      currentInterval
    );

    const updatedWord: WordProgress = {
      ...currentWord,
      reviewCount: nextRepetitions,
      lastReviewed: new Date(),
      nextReview: getNextReviewDate(nextInterval),
      easeFactor: nextEaseFactor,
      confidence:
        nextRepetitions >= 5 ? 'mastered' : nextRepetitions >= 2 ? 'familiar' : 'learning',
    };

    // Update in allWords
    setAllWords((prev) =>
      prev.map((w) => (w.id === updatedWord.id ? updatedWord : w))
    );

    // Update stats
    if (stats) {
      const newStats = updateStats('review', stats);
      setStats(newStats);
    }

    // Move to next review word
    if (currentReviewIndex < wordsForReview.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
      setCurrentWord(wordsForReview[currentReviewIndex + 1]);
      setChatHistory([]);
    } else {
      setShowReviewMode(false);
      setCurrentWord(null);
      alert('Review session complete! 🎉');
      // Refresh review list
      const dueWords = getWordsForReview(allWords);
      setWordsForReview(dueWords);
    }
  };

  const handleHistoryClick = (item: WordProgress) => {
    setInput(item.word);
    setCurrentWord(item);
    setIsLoadingText(false);
    setIsLoadingImage(false);
    setChatHistory([]);
    setShowReviewMode(false);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:relative z-30 w-72 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Sparkles className="w-6 h-6" />
            <span>LingoGen.ai</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="p-4 border-b border-slate-100 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900">{stats.totalWords}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium">Streak</span>
                </div>
                <div className="text-2xl font-bold text-amber-900">{stats.streak} days</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium">Today</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{stats.wordsToday}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-medium">Reviews</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{stats.reviewsToday}</div>
              </div>
            </div>

            {wordsForReview.length > 0 && (
              <button
                onClick={startReviewMode}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Review {wordsForReview.length} word{wordsForReview.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Recent Words
          </h3>
          {allWords.length === 0 && (
            <p className="text-sm text-slate-400 px-2 italic">No history yet. Start learning!</p>
          )}
          {allWords.slice(0, 20).map((item) => (
            <button
              key={item.id}
              onClick={() => handleHistoryClick(item)}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800 group-hover:text-indigo-600">
                  {item.word}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.confidence === 'mastered'
                      ? 'bg-green-100 text-green-700'
                      : item.confidence === 'familiar'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.confidence}
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate mt-1">{item.translation}</div>
            </button>
          ))}
        </div>

        {/* Settings Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700 font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center px-4 justify-between sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-medium text-slate-500 hidden md:block">
            GenAI Language Tutor
          </div>
          <div className="flex items-center gap-3">
            {!apiConfig?.apiKey && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                API not configured
              </span>
            )}
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
              {stats?.totalWords || 0}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Search Section */}
            {!showReviewMode && (
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-6">
                  What do you want to learn today?
                </h1>
                <form onSubmit={handleSearch} className="relative shadow-lg rounded-2xl">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a word or sentence (e.g., Serendipity)..."
                    className="w-full h-16 pl-6 pr-14 rounded-2xl border-none outline-none text-lg placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingText}
                    className="absolute right-2 top-2 h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isLoadingText ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Review Mode Header */}
            {showReviewMode && wordsForReview.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Review Mode</h2>
                  <button
                    onClick={() => setShowReviewMode(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/90">
                  Progress: {currentReviewIndex + 1} / {wordsForReview.length}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${((currentReviewIndex + 1) / wordsForReview.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Word Card */}
            {(isLoadingText || currentWord) && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  {isLoadingText ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
                      <div className="h-6 bg-slate-100 rounded-lg w-1/4"></div>
                      <div className="h-20 bg-slate-50 rounded-lg w-full mt-6"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {currentWord?.word}
                          </h2>
                          <div className="flex items-center gap-3 mt-2 text-slate-500">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-sm">
                              {currentWord?.pronunciation}
                            </span>
                            <button
                              onClick={() => speakWord(currentWord?.word || '')}
                              disabled={isSpeaking}
                              className="p-1 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                            >
                              <Volume2
                                className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                            {currentWord?.partOfSpeech || 'Word'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xl font-medium text-slate-800">
                          {currentWord?.translation}
                        </p>
                        <p className="text-slate-600 leading-relaxed">{currentWord?.definition}</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
                        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                            Mnemonic Hint
                          </p>
                          <p className="text-amber-900 text-sm">{currentWord?.mnemonic}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Section */}
                <div className="relative bg-slate-900 min-h-[300px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
                  {isLoadingImage ? (
                    <div className="text-center space-y-4 z-10 p-6">
                      <Loader2 className="w-10 h-10 text-white/50 animate-spin mx-auto" />
                      <p className="text-white/70 text-sm font-medium animate-pulse">
                        Generating visual memory aid...
                      </p>
                    </div>
                  ) : (
                    <>
                      <img
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                          currentWord?.image_prompt || ''
                        )}?width=800&height=600&nologo=true`}
                        alt="AI Generated Mnemonic"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8 pt-20">
                        <p className="text-white/90 italic text-lg font-medium">
                          "{currentWord?.example_sentence}"
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Review Buttons */}
            {showReviewMode && currentWord && !isLoadingText && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 text-center">
                  How well did you remember this word?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleReviewRating(0)}
                    className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-red-900">Forgot</div>
                    <div className="text-xs text-red-600 mt-1">Reset</div>
                  </button>
                  <button
                    onClick={() => handleReviewRating(3)}
                    className="p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-xl transition-colors"
                  >
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-amber-900">Hard</div>
                    <div className="text-xs text-amber-600 mt-1">Difficult</div>
                  </button>
                  <button
                    onClick={() => handleReviewRating(4)}
                    className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-colors"
                  >
                    <Check className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-900">Good</div>
                    <div className="text-xs text-blue-600 mt-1">Correct</div>
                  </button>
                  <button
                    onClick={() => handleReviewRating(5)}
                    className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-colors"
                  >
                    <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-900">Easy</div>
                    <div className="text-xs text-green-600 mt-1">Perfect!</div>
                  </button>
                </div>
              </div>
            )}

            {/* Chat Section */}
            {currentWord && !isLoadingText && !showReviewMode && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4 border-b border-slate-100 pb-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <span>Ask AI about "{currentWord.word}"</span>
                </div>

                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-700 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-2 rounded-tl-none">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="E.g. How do I use this in a formal email?"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
