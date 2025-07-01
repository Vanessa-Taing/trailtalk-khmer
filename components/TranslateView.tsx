
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordPair } from '../types';
import { AdSense } from './AdSense';
import { Footer } from './Footer';

// --- Helper Components ---

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a8 8 0 0 0 7 7.93V22h2v-2.07A8 8 0 0 0 21 12v-2h-2z"></path>
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6V6z"></path>
    </svg>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
);

const PronunciationIcon: React.FC<{ isSpeaking: boolean, className?: string }> = ({ isSpeaking, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isSpeaking ? 'scale-110' : ''} ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 17c-1.38 0-2.5-1.12-2.5-2.5V12h1.5v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12h1.5v2.5c0 1.38-1.12 2.5-2.5 2.5zm5.3-2.5c-1.04 0-1.9-.86-1.9-1.9V8.9c0-1.04.86-1.9 1.9-1.9s1.9.86 1.9 1.9v3.7c0 1.04-.86 1.9-1.9 1.9zm-1.9-5.3c-.22 0-.4.18-.4.4v3.7c0 .22.18.4.4.4s.4-.18.4-.4V9.3c0-.22-.18-.4-.4-.4z"/>
        <path d="M17 12.5c.83 0 1.5.67 1.5 1.5v.5h-1.5v-.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5v.5h-1.5v-.5c0-.83.67-1.5 1.5-1.5z" opacity=".3"/>
        <path d="M14.8,14.5c1.04,0,1.9-0.86,1.9-1.9V9.4c0-1.04-0.86-1.9-1.9-1.9s-1.9,0.86-1.9,1.9v3.2C12.9,13.64,13.76,14.5,14.8,14.5z M14.8,8.5c0.22,0,0.4,0.18,0.4,0.4v3.2c0,0.22-0.18,0.4-0.4,0.4s-0.4-0.18-0.4-0.4V8.9C14.4,8.68,14.58,8.5,14.8,8.5z"/>
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

// --- Main Translate View Component ---

interface TranslateViewProps {
  onClose: () => void;
  vocabulary: WordPair[];
  voices: SpeechSynthesisVoice[];
}

type ListenLanguage = 'en' | 'km';

export const TranslateView: React.FC<TranslateViewProps> = ({ onClose, vocabulary, voices }) => {
  const [listeningLang, setListeningLang] = useState<ListenLanguage | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const listeningLangRef = useRef<ListenLanguage | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    listeningLangRef.current = listeningLang;
  }, [listeningLang]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current && listeningLangRef.current) {
        recognitionRef.current.stop();
    }
  }, []);

  const handleTranslate = useCallback(async (text: string, sourceLang: ListenLanguage) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setTranslatedText('');
    setError('');

    const targetLangSpec = sourceLang === 'en' ? 'natural, conversational Khmer' : 'natural, conversational American English';
    const sourceLangText = sourceLang === 'en' ? 'English' : 'Khmer';

    try {
      const prompt = `You are a high-quality translation engine for a tourist. Provide a natural, conversational translation. Avoid being overly formal or literal.

- **Source Language:** ${sourceLangText}
- **Target Language:** ${targetLangSpec}
- **Source Text:** "${text}"

Please provide only the translated text. Do not add any explanations, apologies, or extra formatting.`;
      
      const apiResponse = await fetch('/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: prompt,
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch translation');
      }

      const response = await apiResponse.json();
      setTranslatedText(response.text.trim());
    } catch (err) {
        console.error("Translation error:", err);
        setError("A translation error occurred. Please try again.");
    } finally {
        setIsTranslating(false);
    }
  }, []);

  // Effect to initialize SpeechRecognition and handlers ONCE
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError("Speech recognition is not supported by this browser.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = window.setTimeout(() => {
            stopListening();
        }, 2000); // 2 seconds of silence
    };

    recognition.onstart = () => {
        resetSilenceTimer();
    };

    recognition.onresult = (event: any) => {
      resetSilenceTimer(); // Reset timer on any speech activity
      let interimTranscript = '';
      let finalTranscript = '';
       for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart.trim() + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      finalTranscriptRef.current += finalTranscript;
      setTranscribedText(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const lang = listeningLangRef.current;
      if (finalTranscriptRef.current.trim() && lang) {
        handleTranslate(finalTranscriptRef.current.trim(), lang);
      }
      setListeningLang(null);
    };

    recognition.onerror = (event: any) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      console.error("Speech recognition error:", event.error);
      let errorMessage = `An error occurred: ${event.error}`;
      if (event.error === 'no-speech') errorMessage = "I didn't hear anything. Please try again.";
      else if (event.error === 'network') errorMessage = "Network error. Please check your connection.";
      else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "Microphone access denied. Please allow it in your browser settings.";
      }
      setError(errorMessage);
      setListeningLang(null);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [handleTranslate, stopListening]);

  const startListening = (lang: ListenLanguage) => {
      const recognition = recognitionRef.current;
      if (!isSupported || !recognition || listeningLang) return;
      
      finalTranscriptRef.current = '';
      setTranscribedText('');
      setTranslatedText('');
      setError('');
      
      recognition.lang = lang === 'en' ? 'en-US' : 'km-KH';
      
      try {
          recognition.start();
          setListeningLang(lang);
      } catch (e) {
          console.error("Error starting recognition:", e);
          setError("Could not start microphone. Please check permissions.");
          setListeningLang(null);
      }
  };

  const handleSpeakTranslation = useCallback((text: string) => {
    // Universal stop logic
    window.speechSynthesis.cancel();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const isKhmer = /[\u1780-\u17FF]/.test(text);
    const lang = isKhmer ? 'km' : 'en';

    setIsSpeaking(true);

    if (lang === 'en') {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.lang.startsWith('en-'));
        if (voice) utterance.voice = voice;
        else utterance.lang = 'en-US';
        utterance.rate = 1.0;
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => { setIsSpeaking(false); setError("Failed to play audio."); };

        window.speechSynthesis.speak(utterance);
    } else { // lang === 'km'
        const encodedText = encodeURIComponent(text);
        const audioUrl = `/api/tts?lang=km&text=${encodedText}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        const onEnd = () => {
            setIsSpeaking(false);
            audioRef.current = null;
        };

        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', () => {
            setError("Failed to play audio.");
            onEnd();
        });
        
        audio.play().catch(() => onEnd());
    }
  }, [isSpeaking, voices]);

  useEffect(() => {
    if (translatedText && !isTranslating) {
      handleSpeakTranslation(translatedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatedText, isTranslating]);

  const renderListenButton = (lang: ListenLanguage, label: string, color: string) => {
    const isThisLangListening = listeningLang === lang;
    
    if (listeningLang && !isThisLangListening) {
      return (
        <button
          disabled={true}
          className="bg-gray-300 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-not-allowed"
        >
          <MicrophoneIcon className="w-6 h-6"/>
          {label}
        </button>
      )
    }

    if (isThisLangListening) {
       return (
         <button
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300 animate-pulse"
            aria-label="Stop listening"
        >
            <StopIcon className="w-6 h-6"/>
            Listening...
        </button>
       )
    }

    return (
        <button
            onClick={() => startListening(lang)}
            className={`${color} text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4`}
            aria-label={`Speak in ${label}`}
        >
            <MicrophoneIcon className="w-6 h-6"/>
            {label}
        </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fade-in" aria-modal="true" role="dialog">
       <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 text-gray-700 p-2 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 z-10"
            aria-label="Close"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto">
        <div className="container mx-auto flex flex-col h-full">
          <header className="grid grid-cols-3 items-center mb-6 flex-shrink-0">
            <div className="justify-self-start">
                <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                </button>
            </div>
            <h2 className="col-start-2 text-3xl sm:text-4xl font-bold text-gray-700 flex items-center justify-center gap-2 sm:gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg" alt="Cambodian Flag" className="h-8 w-12 sm:h-10 sm:w-16 object-cover rounded" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2,12 L8,6 L8,9 L16,9 L16,6 L22,12 L16,18 L16,15 L8,15 L8,18 L2,12 Z" />
              </svg>
              <img src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" alt="British Flag" className="h-8 w-12 sm:h-10 sm:w-16 object-cover rounded" />
            </h2>
          </header>

          <div className="flex-grow flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-2xl text-center">
              <p className="text-lg text-gray-600 mb-2">Source Text:</p>
              <p className="text-2xl font-semibold text-gray-800 h-16" lang={listeningLang || undefined}>{transcribedText || '...'}</p>
            </div>

            <div className="w-full max-w-2xl text-center bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                  <p className="text-lg text-gray-600">Translated Text:</p>
                  {translatedText && !isTranslating && (
                      <button
                          onClick={() => handleSpeakTranslation(translatedText)}
                          className={`p-2 rounded-full transition-colors duration-200 ${isSpeaking ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
                          aria-label={`Listen to translation`}
                      >
                          <PronunciationIcon isSpeaking={isSpeaking} className="w-6 h-6" />
                      </button>
                  )}
              </div>
              
              <div className="text-2xl font-semibold text-orange-600 h-16 flex items-center justify-center">
                  {isTranslating ? <Spinner /> : (translatedText || '...')}
              </div>
            </div>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center pt-6">
              {!isSupported ? (
                  <p className="text-red-500">Speech recognition not supported by your browser.</p>
              ) : (
                  <div className="flex items-center gap-4">
                      {renderListenButton('km', 'ភាសាខ្មែរ', 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-300')}
                      {renderListenButton('en', 'English', 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300')}
                  </div>
              )}
              <AdSense containerClassName="mt-8 w-full max-w-2xl" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
