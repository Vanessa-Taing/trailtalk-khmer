

import React from 'react';
import { WordPair, CorrectStatus, PronunciationMethod } from '../types';
import { WordCard } from './WordCard';
import { AdSense } from './AdSense';
import { Footer } from './Footer';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface NeedsPracticeViewProps {
  onClose: () => void;
  practiceWords: WordPair[];
  correctlyPronounced: CorrectStatus;
  onPronunciationResult: (wordId: number, lang: 'en' | 'km', method: PronunciationMethod) => void;
  voices: SpeechSynthesisVoice[];
}

export const NeedsPracticeView: React.FC<NeedsPracticeViewProps> = ({
  onClose,
  practiceWords,
  correctlyPronounced,
  onPronunciationResult,
  voices,
}) => {
  return (
    <div
      className="fixed inset-0 bg-gray-50 z-[70] flex flex-col animate-fade-in"
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
          <header className="flex justify-between items-center mb-8">
            <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">
              Practice Words
            </h2>
            <div className="w-[40px]"></div>
          </header>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-600 mb-8">
              These are words you manually marked as correct. Practice pronouncing them until the red highlight disappears!
            </p>
            
            {practiceWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceWords.map((word) => (
                  <WordCard
                    key={`practice-${word.id}`}
                    wordPair={word}
                    correctStatus={correctlyPronounced[word.id] || { en: false, km: false }}
                    onPronunciationResult={onPronunciationResult}
                    voices={voices}
                    highlightManual={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xl font-semibold text-gray-700">All practiced up!</p>
                <p className="text-gray-500 mt-2">You have no words that need specific practice. Great job!</p>
              </div>
            )}
            
            <AdSense />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};