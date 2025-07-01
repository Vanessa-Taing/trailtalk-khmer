import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_PHRASES } from '../constants';
import { PhrasePair } from '../types';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
  </svg>
);

const SpeakerIcon: React.FC<{ isSpeaking: boolean, className?: string }> = ({ isSpeaking, className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-6 w-6 transition-transform duration-200 ${isSpeaking ? 'scale-110' : ''} ${className}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );

export const PhraseOfTheDay: React.FC = () => {
    const [phrase, setPhrase] = useState<PhrasePair | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioEnRef = useRef<HTMLAudioElement | null>(null);
    const audioKmRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const randomPhrase = ALL_PHRASES[Math.floor(Math.random() * ALL_PHRASES.length)];
        setPhrase(randomPhrase);
    }, []);

    const handleSpeak = useCallback(() => {
        if (!phrase) return;

        if (isSpeaking) {
            if (audioEnRef.current) audioEnRef.current.pause();
            if (audioKmRef.current) audioKmRef.current.pause();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);

        const enAudio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(phrase.english)}`);
        audioEnRef.current = enAudio;
        
        const kmAudio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=km&client=tw-ob&q=${encodeURIComponent(phrase.khmer)}`);
        audioKmRef.current = kmAudio;

        const errorHandler = () => {
            setIsSpeaking(false);
            console.error("Failed to play audio for Phrase of the Moment.");
        };
        
        enAudio.onerror = errorHandler;
        kmAudio.onerror = errorHandler;

        enAudio.onended = () => {
            setTimeout(() => {
                kmAudio.play().catch(errorHandler);
            }, 300); // Small pause between languages
        };
        
        kmAudio.onended = () => {
            setIsSpeaking(false);
        };
        
        enAudio.play().catch(errorHandler);

    }, [phrase, isSpeaking]);

    useEffect(() => {
        return () => {
            if (audioEnRef.current) {
                audioEnRef.current.pause();
                audioEnRef.current = null;
            }
            if (audioKmRef.current) {
                audioKmRef.current.pause();
                audioKmRef.current = null;
            }
        };
    }, []);

    if (!phrase) {
        return null;
    }

    return (
        <div className="mt-12 w-full max-w-3xl mx-auto animate-fade-in">
            <div className="relative border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-lg p-6 text-center shadow-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-full text-white shadow-md">
                    <LightbulbIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2 pt-3">Phrase of the Moment</h3>
                <p className="text-xl font-semibold text-gray-800">{phrase.english}</p>
                <p className="text-lg text-yellow-900 mt-1" lang="km">{phrase.khmer}</p>
                
                <div className="flex items-center justify-center mt-4">
                    <button
                        onClick={handleSpeak}
                        className={`p-2 rounded-full transition-colors duration-200 ${isSpeaking ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
                        aria-label="Listen to phrase"
                    >
                        <SpeakerIcon isSpeaking={isSpeaking} />
                    </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">Changes with each visit.</p>
            </div>
        </div>
    );
};
