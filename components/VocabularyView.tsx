


import React, { useEffect, useState } from 'react';
import { WordPair, CorrectStatus, PronunciationMethod } from '../types';
import { WordCard } from './WordCard';
import { AdSense } from './AdSense';
import { Footer } from './Footer';
import { useUser } from '../contexts/UserContext';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const CompletionCelebration: React.FC<{ onCelebrationEnd: () => void }> = ({ onCelebrationEnd }) => {
    const fireworkColors = ['#ff5722', '#ffc107', '#4caf50', '#2196f3', '#9c27b0', '#e91e63'];

    useEffect(() => {
        const sound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVhvT18AAAAAAAAAAAAAAAAAAAA+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pj8+Pj8+Pj8+Pj8+Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz4/Pj8+Pz..=");
        try {
            sound.play();
        } catch (e) {
            console.error("Audio play failed", e);
        }
        
        const timer = setTimeout(onCelebrationEnd, 5000);
        return () => clearTimeout(timer);
    }, [onCelebrationEnd]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center text-gray-500 py-10 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={i}
                    className="firework"
                    style={{
                        left: `${Math.random() * 90 + 5}%`,
                        top: `${Math.random() * 70 + 15}%`,
                        width: `${Math.random() * 30 + 20}px`,
                        height: `${Math.random() * 30 + 20}px`,
                        backgroundColor: fireworkColors[i % fireworkColors.length],
                        animationDelay: `${Math.random() * 1.5}s`,
                    }}
                />
            ))}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4 animate-scale-in" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-2xl font-semibold animate-scale-in" style={{ animationDelay: '0.2s' }}>Great work!</p>
            <p className="mt-2 animate-scale-in" style={{ animationDelay: '0.4s' }}>You've finished this batch. Loading new words...</p>
        </div>
    );
};


interface VocabularyViewProps {
  onClose: () => void;
  onViewLearnt: () => void;
  currentWords: WordPair[];
  alreadyLearntWordsCount: number;
  correctlyPronounced: CorrectStatus;
  onPronunciationResult: (wordId: number, lang: 'en' | 'km', method: PronunciationMethod) => void;
  voices: SpeechSynthesisVoice[];
  isCelebrating: boolean;
  onCelebrationEnd: () => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({ 
  onClose,
  onViewLearnt,
  currentWords,
  alreadyLearntWordsCount,
  correctlyPronounced,
  onPronunciationResult,
  voices,
  isCelebrating,
  onCelebrationEnd
}) => {
  const { user } = useUser();

  return (
    <div 
      className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
       <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 text-gray-700 p-2 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 z-10"
            aria-label="Close"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
        <div className="container mx-auto">
          <header className="grid grid-cols-3 items-center mb-8 gap-4">
            <div className="justify-self-start">
              <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
              </button>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700 text-center">
              Vocabulary
            </h2>
            <div className="justify-self-end">
              {alreadyLearntWordsCount > 0 && (
                  <button 
                    onClick={onViewLearnt} 
                    className="bg-white text-orange-600 font-bold py-2 px-4 rounded-full shadow-md hover:bg-orange-50 transition-colors duration-300 flex items-center gap-2"
                    aria-label={`View ${alreadyLearntWordsCount} learnt words`}
                  >
                      <span>Learnt</span>
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold rounded-full px-2 py-1">{alreadyLearntWordsCount}</span>
                  </button>
              )}
            </div>
          </header>
          
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 mt-4">
            <div className={!user?.isPremium ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="min-h-[300px]">
                {isCelebrating ? (
                    <CompletionCelebration onCelebrationEnd={onCelebrationEnd} />
                ) : currentWords.length > 0 ? (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${!user?.isPremium ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                      {currentWords.map((word) => (
                          <WordCard 
                            key={word.id} 
                            wordPair={word} 
                            correctStatus={correctlyPronounced[word.id] || { en: false, km: false }}
                            onPronunciationResult={onPronunciationResult}
                            voices={voices}
                          />
                        ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                      <p className="mt-4">Loading new words...</p>
                  </div>
                )}
              </div>
              
              <div className="lg:hidden">
                <AdSense />
              </div>
            </div>

            {!user?.isPremium && (
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sponsor</h3>
                    <AdSense containerClassName="w-full mt-0" />
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};