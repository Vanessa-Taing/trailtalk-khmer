
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordPair, PronunciationMethod } from '../types';

interface WordCardProps {
  wordPair: WordPair;
  correctStatus: { en: PronunciationMethod; km: PronunciationMethod };
  onPronunciationResult: (wordId: number, lang: 'en' | 'km', method: 'auto' | 'manual') => void;
  voices: SpeechSynthesisVoice[];
  isStandalone?: boolean;
  highlightManual?: boolean;
}

// --- Icons ---
const SpeakerIcon: React.FC<{ isSpeaking: boolean; className?: string }> = ({ isSpeaking, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-200 ${isSpeaking ? 'scale-110' : ''} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);
const RecordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A6.983 6.983 0 012 8V6h2v2a5 5 0 1010 0V6h2v2a6.983 6.983 0 01-5 6.93z" clipRule="evenodd" /></svg>
);
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
);
const CheckmarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);


export const WordCard: React.FC<WordCardProps> = ({ wordPair, correctStatus, onPronunciationResult, isStandalone = false, voices, highlightManual = false }) => {
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording'>('idle');
  const [recordingLang, setRecordingLang] = useState<'en' | 'km' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }

    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const handleVerification = (transcript: string, targetWord: string, lang: 'en' | 'km') => {
    const normalize = (text: string) => text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const isCorrect = normalize(transcript) === normalize(targetWord);
    if(isCorrect) {
      onPronunciationResult(wordPair.id, lang, 'auto');
    }
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFeedback(null), 1200);
  };
  
  const startRecording = (lang: 'en' | 'km') => {
    const recognition = recognitionRef.current;
    if (!recognition || recordingStatus !== 'idle') return;

    window.speechSynthesis.cancel();
    setIsSpeaking(null);

    const targetWord = lang === 'en' ? wordPair.english : wordPair.khmer;
    recognition.lang = lang === 'en' ? 'en-US' : 'km-KH';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleVerification(transcript, targetWord, lang);
    };

    recognition.onend = () => {
      setRecordingStatus('idle');
      setRecordingLang(null);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert(`Recording failed: ${event.error}`);
    };

    try {
      recognition.start();
      setRecordingStatus('recording');
      setRecordingLang(lang);
    } catch (e) {
      console.error("Could not start recording", e);
      alert("Could not start microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && recordingStatus === 'recording') {
      recognitionRef.current.stop();
    }
  };

  const handleSpeak = useCallback((word: string, lang: 'en' | 'km') => {
    // Universal stop logic
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (isSpeaking === lang) {
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(lang);

    if (lang === 'en') {
        const utterance = new SpeechSynthesisUtterance(word);
        const voice = voices.find(v => v.lang.startsWith('en-') || v.lang.startsWith('en_'));
        if (voice) {
            utterance.voice = voice;
        } else {
            utterance.lang = 'en-US';
        }
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(null);
        utterance.onerror = (event) => {
            console.error('SpeechSynthesis Error:', event);
            setIsSpeaking(null);
            if (isStandalone) {
                alert(`Could not play audio. Your browser might not support English TTS.`);
            }
        };
        window.speechSynthesis.speak(utterance);
    } else { // lang === 'km'
        const encodedWord = encodeURIComponent(word);
        const audioUrl = `/api/tts?lang=km&text=${encodedWord}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        const onEnd = () => {
            setIsSpeaking(null);
            audioRef.current = null;
        };

        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', () => {
            console.error("Error playing Khmer audio from proxy.");
            onEnd();
            if (isStandalone) {
              alert(`Could not play Khmer audio. Please check your internet connection and server status.`);
            }
        });

        audio.play().catch(() => {
            console.error("Khmer audio playback error.");
            onEnd();
        });
    }
  }, [isSpeaking, voices, isStandalone]);


  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'border-green-500 shadow-green-200';
    if (feedback === 'incorrect') return 'border-red-500 shadow-red-200';
    return 'border-transparent shadow-lg';
  };
  
  const getRecordButton = (lang: 'en' | 'km', word: string) => {
    const isRecordingThisLang = recordingStatus === 'recording' && recordingLang === lang;
    const isDisabled = recordingStatus === 'recording' && !isRecordingThisLang;

    if (isRecordingThisLang) {
      return (
        <button onClick={stopRecording} className="p-2 rounded-full text-white bg-red-500 animate-pulse" aria-label={`Stop recording`}>
          <StopIcon />
        </button>
      );
    }

    return (
      <button
        onClick={() => startRecording(lang)}
        disabled={isDisabled}
        className={`p-2 rounded-full transition-colors duration-200 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
        aria-label={`Record pronunciation for ${word}`}
      >
        <RecordIcon />
      </button>
    );
  };
  
  const getCheckmarkButton = (lang: 'en' | 'km') => {
    const isCorrect = correctStatus && !!correctStatus[lang];
    return (
        <button
            onClick={() => !isCorrect && onPronunciationResult(wordPair.id, lang, 'manual')}
            disabled={isCorrect}
            className="p-1 -ml-1 rounded-full disabled:cursor-not-allowed group"
            aria-label={`Manually mark ${lang === 'en' ? 'English' : 'Khmer'} as correct`}
        >
            <CheckmarkIcon className={`transition-colors w-6 h-6 flex-shrink-0 ${
                isCorrect ? 'text-green-500' : 'text-gray-300 group-hover:text-green-400'
            }`} />
        </button>
    );
  };

  const layoutClass = isStandalone ? '' : 'h-full justify-between';
  const needsPracticeEn = highlightManual && correctStatus?.en === 'manual';
  const needsPracticeKm = highlightManual && correctStatus?.km === 'manual';
  
  return (
    <div className={`bg-white rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-2 ${getFeedbackClass()} ${layoutClass}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-grow pr-4">
            <div className="flex items-center gap-2">
              {getCheckmarkButton('en')}
              <h3 className={`text-2xl font-bold ${needsPracticeEn ? 'text-red-600' : 'text-gray-900'} -ml-1`}>{wordPair.english}</h3>
            </div>
            {wordPair.englishMeaning && (
              <p className="mt-1 text-gray-600 text-base">{wordPair.englishMeaning}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
             <button onClick={() => handleSpeak(wordPair.english, 'en')} disabled={recordingStatus === 'recording'} className={`p-2 rounded-full transition-colors duration-200 ${isSpeaking === 'en' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'} ${recordingStatus === 'recording' ? 'text-gray-300 cursor-not-allowed' : ''}`} aria-label={`Listen to ${wordPair.english}`}>
              <SpeakerIcon isSpeaking={isSpeaking === 'en'} />
            </button>
            {getRecordButton('en', wordPair.english)}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-5 border-t border-gray-200">
        <div className="flex justify-between items-start">
            <div className="flex-grow pr-4">
                <div className="flex items-center gap-2">
                    {getCheckmarkButton('km')}
                    <p className={`text-xl ${needsPracticeKm ? 'text-red-600' : 'text-gray-700'} -ml-1`} lang="km">{wordPair.khmer}</p>
                </div>
                 {wordPair.khmerMeaning && (
                    <p className="mt-1 text-gray-600 text-base" lang="km">{wordPair.khmerMeaning}</p>
                )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleSpeak(wordPair.khmer, 'km')} disabled={recordingStatus === 'recording'} className={`p-2 rounded-full transition-colors duration-200 ${isSpeaking === 'km' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'} ${recordingStatus === 'recording' ? 'text-gray-300 cursor-not-allowed' : ''}`} aria-label={`Listen to ${wordPair.khmer} in Khmer`}>
                  <SpeakerIcon isSpeaking={isSpeaking === 'km'} />
                </button>
                {getRecordButton('km', wordPair.khmer)}
            </div>
        </div>
      </div>
    </div>
  );
};
