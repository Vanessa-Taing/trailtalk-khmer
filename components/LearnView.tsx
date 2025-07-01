

import React from 'react';
import { AdSense } from './AdSense';
import { Footer } from './Footer';

// Icons for the buttons
const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface LearnViewProps {
  onNavigate: (view: 'vocab' | 'dict') => void;
  onClose: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onNavigate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fade-in" aria-modal="true" role="dialog">
       <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 text-gray-700 p-2 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 z-10"
            aria-label="Close"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
        <div className="container mx-auto">
          <header className="flex justify-between items-center mb-12">
            <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">
              Learn
            </h2>
            <div className="w-[40px]"></div> {/* Spacer */}
          </header>
          
          <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-800">Choose Your Learning Mode</h3>
                <p className="mt-2 text-gray-600">Practice vocabulary with flashcards or look up specific words in the dictionary.</p>
              </div>

              <button
                  onClick={() => onNavigate('vocab')}
                  className="w-full text-left bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-6 focus:outline-none focus:ring-4 focus:ring-orange-300"
                  aria-label="Open vocabulary learning page"
              >
                  <div className="bg-orange-100 p-4 rounded-full">
                      <BookOpenIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                      <h4 className="text-xl font-bold text-gray-900">Vocabulary</h4>
                      <p className="text-gray-600 mt-1">Practice with interactive flashcards.</p>
                  </div>
              </button>

              <button
                  onClick={() => onNavigate('dict')}
                  className="w-full text-left bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-6 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  aria-label="Open dictionary"
              >
                  <div className="bg-yellow-100 p-4 rounded-full">
                      <SearchIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                      <h4 className="text-xl font-bold text-gray-900">Dictionary</h4>
                      <p className="text-gray-600 mt-1">Look up words and their meanings.</p>
                  </div>
              </button>

              <div className="w-full pt-8">
                <AdSense containerClassName="w-full" />
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};