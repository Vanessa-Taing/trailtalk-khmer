

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ALL_PHRASES } from '../constants';
import { PhrasePair } from '../types';

const SpeakerIcon: React.FC<{ isSpeaking: boolean; className?: string }> = ({ isSpeaking, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-200 ${isSpeaking ? 'scale-110' : ''} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface PhrasebookViewProps {
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
}

export const PhrasebookView: React.FC<PhrasebookViewProps> = ({ onClose, voices }) => {
  const [speakingPhrase, setSpeakingPhrase] = useState<{ id: number; lang: 'en' | 'km' } | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
    };
  }, []);

  const handleSpeak = useCallback((phrase: PhrasePair, lang: 'en' | 'km') => {
    if (speakingPhrase?.id === phrase.id && speakingPhrase?.lang === lang) {
      window.speechSynthesis.cancel();
      if (audioPlaybackRef.current) audioPlaybackRef.current.pause();
      setSpeakingPhrase(null);
      return;
    }

    window.speechSynthesis.cancel();
    if (audioPlaybackRef.current) audioPlaybackRef.current.pause();
    
    setSpeakingPhrase({ id: phrase.id, lang });
    const text = lang === 'en' ? phrase.english : phrase.khmer;

    const encodedText = encodeURIComponent(text);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
    
    const audio = audioPlaybackRef.current || new Audio();
    audioPlaybackRef.current = audio;

    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
    }

    audio.playbackRate = 1.0; // Normal speed
    audio.play().catch(() => setSpeakingPhrase(null));
    audio.onended = () => setSpeakingPhrase(null);
    audio.onerror = () => setSpeakingPhrase(null);
  }, [speakingPhrase]);

  const phrasesByCategory = ALL_PHRASES.reduce((acc, phrase) => {
    const { category } = phrase;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(phrase);
    return acc;
  }, {} as Record<string, PhrasePair[]>);

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 p-4 sm:p-8 overflow-y-auto" aria-modal="true" role="dialog">
       <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 text-gray-700 p-2 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 z-10"
            aria-label="Close"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
            <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">
            Useful Phrases
          </h2>
          <div className="w-[40px]"></div> {/* Spacer */}
        </header>

        <main className="max-w-3xl mx-auto space-y-8">
          {Object.entries(phrasesByCategory).map(([category, phrases]) => (
            <section key={category}>
              <h3 className="text-2xl font-bold text-gray-700 mb-4 px-1">{category}</h3>
              <div className="space-y-4">
                {phrases.map(phrase => (
                  <div key={phrase.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">{phrase.english}</span>
                        <button
                          onClick={() => handleSpeak(phrase, 'en')}
                          className={`p-2 rounded-full transition-colors duration-200 ${speakingPhrase?.id === phrase.id && speakingPhrase?.lang === 'en' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
                          aria-label={`Listen to "${phrase.english}"`}
                        >
                          <SpeakerIcon isSpeaking={speakingPhrase?.id === phrase.id && speakingPhrase?.lang === 'en'} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-700" lang="km">{phrase.khmer}</span>
                        <button
                          onClick={() => handleSpeak(phrase, 'km')}
                          className={`p-2 rounded-full transition-colors duration-200 ${speakingPhrase?.id === phrase.id && speakingPhrase?.lang === 'km' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
                          aria-label={`Listen to "${phrase.khmer}" in Khmer`}
                        >
                          <SpeakerIcon isSpeaking={speakingPhrase?.id === phrase.id && speakingPhrase?.lang === 'km'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};