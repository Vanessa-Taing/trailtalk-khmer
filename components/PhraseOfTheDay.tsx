
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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isSpeakingRef = useRef(isSpeaking);
    isSpeakingRef.current = isSpeaking;

    useEffect(() => {
        const randomPhrase = ALL_PHRASES[Math.floor(Math.random() * ALL_PHRASES.length)];
        setPhrase(randomPhrase);
    }, []);

    const handleSpeak = useCallback(() => {
        if (!phrase) return;

        // Universal cancel
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);

        const playKhmer = () => {
            if (!isSpeakingRef.current) { // Check if user cancelled during the pause
                 setIsSpeaking(false);
                 return;
            }
            const encodedText = encodeURIComponent(phrase.khmer);
            const audioUrl = `/api/tts?lang=km&text=${encodedText}`;
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            const onEnd = () => {
                setIsSpeaking(false);
                audioRef.current = null;
            };
            audio.addEventListener('ended', onEnd);
            audio.addEventListener('error', onEnd);
            
            audio.play().catch(onEnd);
        };

        const enUtterance = new SpeechSynthesisUtterance(phrase.english);
        enUtterance.lang = 'en-US';
        enUtterance.rate = 1.0;
        
        enUtterance.onend = () => {
            setTimeout(playKhmer, 300);
        };
        
        enUtterance.onerror = (event) => {
            console.error("Phrase of the Day TTS Error:", event);
            setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(enUtterance);

    }, [phrase, isSpeaking]);

    useEffect(() => {
        // Cleanup function to stop any speech synthesis when the component unmounts
        return () => {
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
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
