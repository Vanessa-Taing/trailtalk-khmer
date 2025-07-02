

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { Language, LanguageCode, User, Word, LearntWord, LearntPhrase, Payment, AppContextType } from './types';
import { LANGUAGES, VOCABULARY_DATA, ADMIN_EMAIL } from './constants';
import { translateText, generatePhrase, getPhonetics, generateCombinedPhrase } from './services/gemini';

// --- ICONS (as components) ---
const LogoIcon = () => (
    <svg className="w-10 h-10 text-brand-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C7.8 2 4.1 5.3 4 9.5c-.1 2.4.9 4.6 2.6 6.1L12 22l5.4-6.4c1.7-1.5 2.7-3.7 2.6-6.1C19.9 5.3 16.2 2 12 2zm0 10.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" fill="currentColor"/>
        <path d="M12 2a10 10 0 00-7.07 17.07 1 1 0 001.41-1.41A8 8 0 1112 20a8.06 8.06 0 01-5.66-2.34" fill="currentColor" opacity="0.6"/>
    </svg>
);
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" /></svg>;
const CheckIcon = ({ className } : { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;
const XCircleIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const RunningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const StackedBooksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l-3.75-2.25L9 7.5m0 0l-3.75 2.25M9 7.5v9l3.75 2.25M15 7.5v9l-3.75 2.25m0 0V9.75" /></svg>;

// --- CONTEXT ---
const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromLang, setFromLang] = useState<LanguageCode>('EN');
  const [toLang, setToLang] = useState<LanguageCode>('TH');
  const [user, setUser] = useState<User | null>(() => {
    try {
        const savedUser = localStorage.getItem('lingotrek-user');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        return null;
    }
  });
  const [learntWords, setLearntWords] = useState<LearntWord[]>(() => {
    try {
        const saved = localStorage.getItem('lingotrek-learnt-words');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });
   const [learntPhrases, setLearntPhrases] = useState<LearntPhrase[]>(() => {
    try {
        const saved = localStorage.getItem('lingotrek-learnt-phrases');
        return saved ? JSON.parse(saved) : [];
    } catch(e) {
        return [];
    }
  });

  useEffect(() => {
    try {
        if (user) localStorage.setItem('lingotrek-user', JSON.stringify(user));
        else localStorage.removeItem('lingotrek-user');
    } catch (e) {
        console.error("Failed to save user to localStorage", e);
    }
  }, [user]);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  const addLearntWords = (words: LearntWord[]) => {
    setLearntWords(prev => {
        const existingKeys = new Set(prev.map(lw => `${lw.fromLangCode}:${lw.toLangCode}:${lw.word.EN}`));
        const newWords = words.filter(nw => !existingKeys.has(`${nw.fromLangCode}:${nw.toLangCode}:${nw.word.EN}`));
        const updatedWords = [...prev, ...newWords];
        try {
            localStorage.setItem('lingotrek-learnt-words', JSON.stringify(updatedWords));
        } catch(e) {
            console.error("Failed to save learnt words", e);
        }
        return updatedWords;
    });
  };

  const updateLearntWord = (word: Word, fromLangCode: LanguageCode, toLangCode: LanguageCode, isCorrect: boolean) => {
    setLearntWords(prev => {
        const existingIndex = prev.findIndex(lw => lw.word['EN'] === word['EN'] && lw.fromLangCode === fromLangCode && lw.toLangCode === toLangCode);
        let newWords;
        if (existingIndex > -1) {
            const updatedWords = [...prev];
            updatedWords[existingIndex] = { ...updatedWords[existingIndex], isCorrect };
            newWords = updatedWords;
        } else {
            newWords = [...prev, { word, fromLangCode, toLangCode, isCorrect }];
        }
        try {
            localStorage.setItem('lingotrek-learnt-words', JSON.stringify(newWords));
        } catch(e) {
            console.error("Failed to save learnt words", e);
        }
        return newWords;
    });
  };

  const addLearntPhrase = (phrase: LearntPhrase) => {
    setLearntPhrases(prev => {
        if (!prev.some(p => p.phrase.EN === phrase.phrase.EN && p.fromLangCode === phrase.fromLangCode && p.toLangCode === phrase.toLangCode)) {
            const newPhrases = [...prev, phrase];
             try {
                localStorage.setItem('lingotrek-learnt-phrases', JSON.stringify(newPhrases));
            } catch(e) {
                console.error("Failed to save learnt phrases", e);
            }
            return newPhrases;
        }
        return prev;
    });
  };
  
  const updateLearntPhrase = (phrase: Word, fromLangCode: LanguageCode, toLangCode: LanguageCode, isCorrect: boolean) => {
    setLearntPhrases(prev => {
        const newPhrases = prev.map(lp => (lp.phrase['EN'] === phrase['EN'] && lp.fromLangCode === fromLangCode && lp.toLangCode === toLangCode ? { ...lp, isCorrect } : lp));
        try {
            localStorage.setItem('lingotrek-learnt-phrases', JSON.stringify(newPhrases));
        } catch(e) {
            console.error("Failed to save learnt phrases", e);
        }
        return newPhrases;
    });
  };

  const value = {
    fromLang, toLang, setFromLang, setToLang,
    user, login, logout,
    learntWords, addLearntWords, updateLearntWord,
    learntPhrases, addLearntPhrase, updateLearntPhrase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- HOOKS ---
const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = React.useRef<any>(null);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  }, []);

  const listen = useCallback((lang: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const newTranscript = event.results[0][0].transcript;
      setTranscript(newTranscript);
      stopListening();
    };

    recognition.onspeechend = () => {
      stopListening();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();

  }, [isListening, stopListening]);

  return { isListening, transcript, listen, setTranscript };
};

const useTextToSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
              setVoices(availableVoices);
            }
        };
        
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        // This is a common trick to trigger voice loading on some browsers
        if (window.speechSynthesis.getVoices().length === 0) {
            const utterance = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(utterance);
            window.speechSynthesis.cancel();
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const findVoice = useCallback((lang: string) => {
        if (voices.length === 0) return null;
        // Prioritize exact match
        let voice = voices.find(v => v.lang === lang);
        if (!voice) {
            // Fallback to language prefix (e.g., 'en-US' -> 'en')
            const langPrefix = lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        return voice || null;
    }, [voices]);

    const isVoiceAvailable = useCallback((lang: string) => !!findVoice(lang), [findVoice]);

    const speakWithVoice = useCallback((text: string, lang: string) => {
        if (!text || typeof window.speechSynthesis === 'undefined') return null;

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = findVoice(lang);
        
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No specific voice found for lang: ${lang}. Using browser default.`);
        }
        
        utterance.lang = lang;
        utterance.rate = 0.9;
        
        return utterance;
    }, [findVoice]);


    const speak = useCallback((text: string, lang: string) => {
        const utterance = speakWithVoice(text, lang);
        if(utterance){
            window.speechSynthesis.cancel(); // Stop any currently playing speech
            window.speechSynthesis.speak(utterance);
        }
    }, [speakWithVoice]);

    const speakSequence = useCallback((speeches: { text: string; lang: string }[]) => {
        if (!speeches.length || typeof window.speechSynthesis === 'undefined') return;

        window.speechSynthesis.cancel();

        const speakNext = (index: number) => {
            if (index >= speeches.length) return;

            const { text, lang } = speeches[index];
            const utterance = speakWithVoice(text, lang);

            if(!utterance) return;

            utterance.onend = () => {
                if (index + 1 < speeches.length) {
                    setTimeout(() => speakNext(index + 1), 500); // 0.5-second pause
                }
            };
            
            utterance.onerror = (e) => {
              console.error("Speech synthesis error:", e);
              if (index + 1 < speeches.length) {
                setTimeout(() => speakNext(index + 1), 500);
              }
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext(0);
    }, [speakWithVoice]);

    return { speak, speakSequence, isVoiceAvailable };
};


// --- UI COMPONENTS ---
const PageLayout: React.FC<{ title: string; children: React.ReactNode; showControls?: boolean; onBack?: () => void; }> = ({ title, children, showControls = true, onBack }) => {
    const navigate = useNavigate();
    const handleBack = onBack || (() => navigate(-1));
    
    return (
        <div className="min-h-screen bg-brand-darker p-4 sm:p-6 lg:p-8 flex flex-col animate-fade-in">
            {showControls && (
                <header className="flex justify-between items-center mb-6">
                    <button onClick={handleBack} className="p-2 rounded-full hover:bg-brand-dark"><BackIcon /></button>
                    <h1 className="text-xl sm:text-2xl font-bold text-brand-light text-center">{title}</h1>
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-brand-dark"><CloseIcon /></button>
                </header>
            )}
            <main className="flex-grow">{children}</main>
        </div>
    );
};

const FlagButton: React.FC<{ lang: Language; onClick: () => void; isSelected?: boolean }> = ({ lang, onClick, isSelected }) => (
    <button onClick={onClick} className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-200 ${isSelected ? 'bg-brand-primary/30 ring-2 ring-brand-primary' : 'hover:bg-brand-dark'}`}>
        <span className="text-4xl">{lang.flag}</span>
        <span className="text-sm font-medium text-brand-light">{lang.name}</span>
    </button>
);

const ActionButton: React.FC<{ to: string; label: string }> = ({ to, label }) => (
    <Link to={to} className="w-full text-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl transition-transform duration-200 hover:scale-105 shadow-lg">
        {label}
    </Link>
);

const Fireworks: React.FC = () => (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute text-4xl animate-firework" style={{ 
                top: `${Math.random() * 80 + 10}%`, 
                left: `${Math.random() * 80 + 10}%`,
                animationDelay: `${Math.random() * 0.5}s`,
            }}>
                {['🎉', '🎊', '✨', '💥'][i % 4]}
            </div>
        ))}
    </div>
);

const PracticeItem: React.FC<{
  item: Word;
  fromLangCode: LanguageCode;
  toLangCode: LanguageCode;
  isCorrect: boolean | null;
  onCheck: (item: Word) => void;
  onSpeak: (text: string, lang: string) => void;
  onListen: (item: Word) => void;
  isListening: boolean;
  isCurrentItem: boolean;
  isVoiceAvailable: (lang: string) => boolean;
  feedback?: 'correct' | 'incorrect' | null;
}> = ({ item, fromLangCode, toLangCode, isCorrect, onCheck, onSpeak, onListen, isListening, isCurrentItem, isVoiceAvailable, feedback }) => {
    const toLang = LANGUAGES[toLangCode];
    const fromLang = LANGUAGES[fromLangCode];
    const hasVoice = isVoiceAvailable(toLang.speechLang);

    const baseClasses = "bg-brand-dark p-4 rounded-lg flex items-center space-x-4 transition-all";
    const statusClasses = 
        isCorrect === true ? "border-l-4 border-green-500" :
        isCorrect === false ? "border-l-4 border-red-500" :
        "border-l-4 border-slate-600";
    
    return (
        <div className={`${baseClasses} ${statusClasses}`}>
            <button onClick={() => onCheck(item)} aria-label="Mark as learned manually">
                <CheckIcon className={`transition-colors h-6 w-6 ${isCorrect === true ? 'text-green-500' : 'text-slate-600 hover:text-green-500'}`} />
            </button>
            <div className="flex-grow">
                <p className="text-lg text-brand-light">{item[toLangCode]}</p>
                <p className="text-sm text-brand-muted">{item[fromLangCode]}</p>
            </div>
            <div className="flex items-center space-x-2">
                {feedback === 'correct' && <CheckCircleIcon className="text-green-500" />}
                {feedback === 'incorrect' && <XCircleIcon className="text-red-500" />}
                <button 
                    onClick={() => onSpeak(item[toLangCode], toLang.speechLang)} 
                    className="p-2 rounded-full hover:bg-brand-primary/20 disabled:text-slate-500 disabled:cursor-not-allowed"
                    disabled={!hasVoice}
                    aria-label={hasVoice ? `Speak ${item[toLangCode]}` : `Speech not available for ${toLang.name}`}
                    title={hasVoice ? `Speak ${item[toLangCode]}` : `Speech not available for ${toLang.name}`}
                >
                    <SpeakerIcon />
                </button>
                <button 
                    onClick={() => onListen(item)} 
                    className={`p-2 rounded-full hover:bg-brand-primary/20 ${isListening && isCurrentItem ? 'bg-red-500/50 animate-pulse' : ''}`}
                    aria-label={`Pronounce ${item[toLangCode]}`}>
                    <MicIcon />
                </button>
            </div>
        </div>
    );
}

// --- PAGES / MAIN COMPONENTS ---
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAppContext();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return children;
};

const MainPage = () => {
    const { fromLang, toLang, setFromLang, setToLang } = useAppContext();
    const [showFromModal, setShowFromModal] = useState(false);
    const [showToModal, setShowToModal] = useState(false);

    const LanguageModal: React.FC<{ onSelect: (lang: LanguageCode) => void; onClose: () => void; }> = ({ onSelect, onClose }) => (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-dark rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-center">Select a Language</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.values(LANGUAGES).map(lang => (
                        <FlagButton key={lang.code} lang={lang} onClick={() => { onSelect(lang.code); onClose(); }} />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <PageLayout title="" showControls={false}>
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <header className="flex items-center space-x-3 mb-8">
                    <LogoIcon />
                    <h1 className="text-4xl font-extrabold tracking-tight text-brand-light">LingoTrek</h1>
                </header>

                <p className="text-brand-muted mb-12 max-w-md">Your AI-powered travel companion for learning languages on the go. Select your languages to begin.</p>

                <div className="flex items-center justify-center space-x-6 sm:space-x-12 mb-16">
                    <div className="flex flex-col items-center space-y-3">
                        <h2 className="font-semibold text-lg">From</h2>
                        <FlagButton lang={LANGUAGES[fromLang]} onClick={() => setShowFromModal(true)} isSelected />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-muted"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3" /></svg>
                    <div className="flex flex-col items-center space-y-3">
                        <h2 className="font-semibold text-lg">To</h2>
                        <FlagButton lang={LANGUAGES[toLang]} onClick={() => setShowToModal(true)} isSelected />
                    </div>
                </div>

                <nav className="w-full max-w-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ActionButton to="/learn" label="Learn" />
                    <ActionButton to="/translate" label="Translate" />
                    <Link to="/profile" className="w-full text-center bg-brand-dark hover:bg-brand-primary/20 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-lg">Profile</Link>
                </nav>

                {showFromModal && <LanguageModal onSelect={setFromLang} onClose={() => setShowFromModal(false)} />}
                {showToModal && <LanguageModal onSelect={setToLang} onClose={() => setShowToModal(false)} />}
            </div>
        </PageLayout>
    );
};

const LearnPage = () => {
    const [view, setView] = useState<'menu' | 'vocab' | 'stats'>('menu');
    
    const { learntWords, toLang, fromLang } = useAppContext();
    const totalWordsCount = useMemo(() => VOCABULARY_DATA.reduce((acc, topic) => acc + topic.words.length, 0), []);
    
    const learntWordsForPair = useMemo(() => 
        new Set(learntWords
            .filter(lw => lw.fromLangCode === fromLang && lw.toLangCode === toLang)
            .map(lw => lw.word.EN)
        ).size,
    [learntWords, fromLang, toLang]);

    const progress = useMemo(() => totalWordsCount > 0 ? (learntWordsForPair / totalWordsCount) * 100 : 0, [learntWordsForPair, totalWordsCount]);


    if(view === 'vocab') return <VocabularyPage onBack={() => setView('menu')} key={`${fromLang}-${toLang}`} />;
    if(view === 'stats') return <StatsPage onBack={() => setView('menu')} />;

    return (
        <PageLayout title="Learn">
            <div className="text-center mb-8">
                <p className="text-lg text-brand-muted">
                    You are learning {LANGUAGES[toLang].name} from {LANGUAGES[fromLang].name}.
                </p>
                <div className="w-full bg-brand-dark rounded-full h-2.5 mt-4">
                  <div className="bg-brand-primary h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                </div>
                <p className="text-sm text-brand-muted mt-2">{learntWordsForPair} / {totalWordsCount} words learnt</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <button onClick={() => setView('vocab')} className="w-full text-left p-6 bg-brand-dark rounded-xl hover:bg-brand-primary/20 transition-colors duration-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Vocabulary</h3>
                        <p className="text-brand-muted">Learn new words and phrases.</p>
                    </div>
                    <RunningIcon />
                </button>
                 <button onClick={() => setView('stats')} className="w-full text-left p-6 bg-brand-dark rounded-xl hover:bg-brand-primary/20 transition-colors duration-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Stats & Practice</h3>
                        <p className="text-brand-muted">Review your learned items.</p>
                    </div>
                    <BookIcon />
                </button>
                 <Link to="/dictionary" className="w-full text-left p-6 bg-brand-dark rounded-xl hover:bg-brand-primary/20 transition-colors duration-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Dictionary</h3>
                        <p className="text-brand-muted">Search for words.</p>
                    </div>
                    <StackedBooksIcon />
                </Link>
            </div>
        </PageLayout>
    );
};


const VocabularyPage: React.FC<{onBack: () => void}> = ({onBack}) => {
    const { fromLang, toLang, learntWords, updateLearntWord, addLearntPhrase, updateLearntPhrase } = useAppContext();
    const [wordBatch, setWordBatch] = useState<Word[]>([]);
    const [learntInBatch, setLearntInBatch] = useState<Set<string>>(new Set());
    const [showCongrats, setShowCongrats] = useState(false);
    const [isLoadingPhrase, setIsLoadingPhrase] = useState<string | null>(null);
    const [practicingWord, setPracticingWord] = useState<Word | null>(null);
    const [phonetics, setPhonetics] = useState<Record<string, string>>({});
    const [isLoadingPhonetics, setIsLoadingPhonetics] = useState(false);
    const [practiceFeedback, setPracticeFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
    const [isLearntVisible, setIsLearntVisible] = useState(true);
    const [generatedStory, setGeneratedStory] = useState<LearntPhrase | null>(null);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);

    const { isListening, transcript, listen, setTranscript } = useSpeech();
    const { speak, isVoiceAvailable } = useTextToSpeech();

    const fetchNewBatch = useCallback(() => {
        const learntWordForPair = new Set(learntWords
            .filter(lw => lw.fromLangCode === fromLang && lw.toLangCode === toLang)
            .map(lw => lw.word.EN)
        );
        const availableWords = VOCABULARY_DATA.flatMap(topic => topic.words).filter(word => !learntWordForPair.has(word.EN));
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        const newBatch = shuffled.slice(0, 10);
        
        setWordBatch(newBatch);
        setLearntInBatch(new Set());
        setGeneratedStory(null);

        if (newBatch.length > 0) {
            setIsLoadingPhonetics(true);
            const phoneticsPromises = newBatch.map(word =>
                getPhonetics(word[toLang], toLang).then(p => ({ enWord: word.EN, phonetic: p }))
            );
            Promise.all(phoneticsPromises).then(results => {
                const newPhonetics: Record<string, string> = {};
                results.forEach(result => {
                    if(result.phonetic) newPhonetics[result.enWord] = result.phonetic;
                });
                setPhonetics(prev => ({ ...prev, ...newPhonetics }));
                setIsLoadingPhonetics(false);
            });
        }

    }, [learntWords, fromLang, toLang]);

    useEffect(() => {
        fetchNewBatch();
    }, [fetchNewBatch]);
    
    useEffect(() => {
        if (!transcript || !practicingWord) return;

        const expectedText = practicingWord[toLang].toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
        const spokenText = transcript.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
        const isCorrect = spokenText === expectedText;
        
        updateLearntWord(practicingWord, fromLang, toLang, isCorrect);
        setPracticeFeedback(prev => ({ ...prev, [practicingWord.EN]: isCorrect ? 'correct' : 'incorrect' }));
        
        if(isCorrect) {
            setLearntInBatch(prev => new Set(prev).add(practicingWord.EN));
        }

        setTimeout(() => {
            setPracticeFeedback(prev => {
                const newState = {...prev};
                delete newState[practicingWord.EN];
                return newState;
            });
        }, 2000);
        
        setTranscript('');
        setPracticingWord(null);
    }, [transcript, practicingWord, toLang, fromLang, updateLearntWord, setTranscript]);
    
    const handleManualTick = (word: Word) => {
        updateLearntWord(word, fromLang, toLang, false); // Manual check is not a correct pronunciation
        setLearntInBatch(prev => new Set(prev).add(word.EN));
    };

    const handleListen = (word: Word) => {
        setPracticingWord(word);
        listen(LANGUAGES[toLang].speechLang);
    };

     const handleSpeak = (text: string, lang: string) => {
        speak(text, lang);
    };
    
    useEffect(() => {
        if(wordBatch.length > 0 && learntInBatch.size === wordBatch.length){
            setShowCongrats(true);
            setTimeout(() => {
                setShowCongrats(false);
                fetchNewBatch();
            }, 4000);
        }
    }, [learntInBatch, wordBatch, fetchNewBatch]);

    const generateAndStorePhrase = async (word: Word) => {
        setIsLoadingPhrase(word.EN);
        const phrase = await generatePhrase(word, toLang);
        if (phrase) {
            addLearntPhrase({ phrase, fromLangCode: fromLang, toLangCode: toLang, isCorrect: null });
            alert(`New phrase available in your 'Stats & Practice' section!`);
        } else {
            alert('Could not generate a phrase. Please try again.');
        }
        setIsLoadingPhrase(null);
    };

    const handleGenerateStory = async (words: Word[]) => {
        setIsGeneratingStory(true);
        setGeneratedStory(null);
        const phrase = await generateCombinedPhrase(words, toLang);
        if (phrase) {
            const newStory: LearntPhrase = { phrase, fromLangCode: fromLang, toLangCode: toLang, isCorrect: null };
            addLearntPhrase(newStory);
            setGeneratedStory(newStory);
        } else {
            alert('Could not generate a story. Please try again.');
        }
        setIsGeneratingStory(false);
    };


    const currentWords = wordBatch.filter(w => !learntInBatch.has(w.EN));
    const batchLearntWords = wordBatch.filter(w => learntInBatch.has(w.EN));


    return (
        <PageLayout title="Vocabulary" onBack={onBack}>
            {showCongrats && <Fireworks />}
             {showCongrats && (
                <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center text-center">
                    <h2 className="text-4xl font-bold mb-4">Congratulations!</h2>
                    <p className="text-xl text-brand-muted">You've mastered this batch. Fetching new words...</p>
                </div>
            )}
            
            <div className="space-y-3">
            {currentWords.length > 0 ? currentWords.map(word => (
                <div key={word.EN} className="bg-brand-dark p-4 rounded-lg flex items-center space-x-4 animate-fade-in">
                    <button onClick={() => handleManualTick(word)}><CheckIcon className="text-slate-600 hover:text-green-500 transition-colors" /></button>
                    <div className="flex-grow">
                        <p className="text-lg text-brand-light">{word[toLang]}</p>
                        {isLoadingPhonetics && !phonetics[word.EN] 
                            ? <div className="h-5 bg-slate-700 rounded animate-pulse w-24 mt-1"></div>
                            : <p className="text-sm text-brand-accent">{phonetics[word.EN] || ' '}</p>
                        }
                        <p className="text-sm text-brand-muted">{word[fromLang]}</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        {practiceFeedback[word.EN] === 'correct' && <CheckCircleIcon className="text-green-500" />}
                        {practiceFeedback[word.EN] === 'incorrect' && <XCircleIcon className="text-red-500" />}
                        <button onClick={() => handleSpeak(word[toLang], LANGUAGES[toLang].speechLang)} className="p-2 rounded-full hover:bg-brand-primary/20 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={!isVoiceAvailable(LANGUAGES[toLang].speechLang)}><SpeakerIcon /></button>
                        <button onClick={() => handleListen(word)} className={`p-2 rounded-full hover:bg-brand-primary/20 ${isListening && practicingWord?.EN === word.EN ? 'bg-red-500/50 animate-pulse' : ''}`}>
                            <MicIcon />
                        </button>
                    </div>
                </div>
            )) : wordBatch.length === 0 && !showCongrats ? (
                 <div className="text-center text-brand-muted pt-8 px-4">
                    <p className="text-xl font-bold">All Words Mastered!</p>
                    <p className="mt-2">You've learned all the available words for {LANGUAGES[fromLang].name} to {LANGUAGES[toLang].name}. Try a new language pair!</p>
                </div>
            ): (
                 <p className="text-center text-brand-muted pt-8">Loading new words...</p>
            )}
            </div>

            {batchLearntWords.length > 0 && (
                 <div className="mt-8">
                    <button onClick={() => setIsLearntVisible(!isLearntVisible)} className="w-full flex justify-between items-center text-left p-2 -m-2">
                        <h3 className="text-xl font-bold text-brand-accent">Learnt in this Batch ({batchLearntWords.length})</h3>
                        <ChevronDownIcon className={`transition-transform ${isLearntVisible ? '' : '-rotate-90'}`} />
                    </button>
                    {isLearntVisible && (
                        <div className="space-y-3 animate-fade-in mt-4">
                        {batchLearntWords.map(word => (
                            <div key={word.EN} className="bg-green-500/10 p-4 rounded-lg flex items-center space-x-4 border-l-4 border-green-500">
                                <CheckIcon className="text-green-500" />
                                <div className="flex-grow">
                                    <p className="text-lg text-brand-light">{word[toLang]}</p>
                                    <p className="text-sm text-brand-accent">{phonetics[word.EN] || ' '}</p>
                                    <p className="text-sm text-brand-muted">{word[fromLang]}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleSpeak(word[toLang], LANGUAGES[toLang].speechLang)} className="p-2 rounded-full hover:bg-brand-primary/20 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={!isVoiceAvailable(LANGUAGES[toLang].speechLang)}><SpeakerIcon /></button>
                                    <button onClick={() => handleListen(word)} className={`p-2 rounded-full hover:bg-brand-primary/20 ${isListening && practicingWord?.EN === word.EN ? 'bg-red-500/50 animate-pulse' : ''}`}><MicIcon /></button>
                                    <button 
                                        onClick={() => generateAndStorePhrase(word)} 
                                        disabled={!!isLoadingPhrase}
                                        className="text-xs bg-brand-accent text-brand-darker font-semibold py-1 px-3 rounded-full hover:bg-amber-300 disabled:bg-slate-500">
                                        {isLoadingPhrase === word.EN ? '...' : 'Phrase'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4">
                           <button onClick={() => handleGenerateStory(batchLearntWords)} disabled={isGeneratingStory} className="w-full bg-brand-secondary hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:bg-slate-500">
                               {isGeneratingStory ? 'Generating Story...' : 'Practice with a Story'}
                           </button>
                        </div>
                         {generatedStory && (
                            <div className="mt-4">
                                <h4 className="text-lg font-bold mb-2 text-brand-light">Your story:</h4>
                                <PracticeItem 
                                    item={generatedStory.phrase}
                                    fromLangCode={generatedStory.fromLangCode}
                                    toLangCode={generatedStory.toLangCode}
                                    isCorrect={null}
                                    onCheck={() => updateLearntPhrase(generatedStory.phrase, generatedStory.fromLangCode, generatedStory.toLangCode, false)}
                                    onSpeak={speak}
                                    onListen={(item) => alert("Practice story listening in Stats section")}
                                    isListening={false}
                                    isCurrentItem={false}
                                    isVoiceAvailable={isVoiceAvailable}
                                />
                            </div>
                         )}
                        </div>
                    )}
                </div>
            )}
        </PageLayout>
    );
};

const TranslatePage = () => {
    const { fromLang, toLang } = useAppContext();
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeInput, setActiveInput] = useState<'top' | 'bottom' | null>(null);

    const { isListening: isTopListening, transcript: topTranscript, listen: topListen, setTranscript: setTopTranscript } = useSpeech();
    const { isListening: isBottomListening, transcript: bottomTranscript, listen: bottomListen, setTranscript: setBottomTranscript } = useSpeech();
    const { speak, isVoiceAvailable } = useTextToSpeech();

    useEffect(() => {
        if(topTranscript){
            setTopText(topTranscript);
            setActiveInput('top');
            setTopTranscript('');
        }
    }, [topTranscript, setTopTranscript]);

    useEffect(() => {
        if(bottomTranscript){
            setBottomText(bottomTranscript);
            setActiveInput('bottom');
            setBottomTranscript('');
        }
    }, [bottomTranscript, setBottomTranscript]);

    const handleTranslate = useCallback(async (text: string, sourceLang: LanguageCode, targetLang: LanguageCode, setText: (text:string) => void, speakResult: boolean) => {
        if (!text.trim()) {
            setText('');
            return;
        };
        setIsTranslating(true);
        const translated = await translateText(text, sourceLang, targetLang);
        setText(translated);
        if(speakResult && isVoiceAvailable(LANGUAGES[targetLang].speechLang)) {
            speak(translated, LANGUAGES[targetLang].speechLang);
        }
        setIsTranslating(false);
    }, [speak, isVoiceAvailable]);

    useEffect(() => {
        if (activeInput !== 'top' || !topText) {
             if(activeInput === 'top' && !topText) setBottomText('');
            return;
        }
        const debounce = setTimeout(() => {
            handleTranslate(topText, fromLang, toLang, setBottomText, true);
        }, 1000);
        return () => clearTimeout(debounce);
    }, [topText, fromLang, toLang, handleTranslate, activeInput]);
    
    useEffect(() => {
         if (activeInput !== 'bottom' || !bottomText) {
            if(activeInput === 'bottom' && !bottomText) setTopText('');
            return;
        }
        const debounce = setTimeout(() => {
            handleTranslate(bottomText, toLang, fromLang, setTopText, false);
        }, 1000);
        return () => clearTimeout(debounce);
    }, [bottomText, fromLang, toLang, handleTranslate, activeInput]);

    const TranslationCard: React.FC<{
        langCode: LanguageCode;
        text: string;
        setText: (text: string) => void;
        onListen: () => void;
        isListening: boolean;
        onFocus: () => void;
    }> = ({ langCode, text, setText, onListen, isListening, onFocus }) => {
        const lang = LANGUAGES[langCode];
        const hasVoice = isVoiceAvailable(lang.speechLang);
        return (
            <div className="bg-brand-dark p-4 rounded-2xl flex-1 flex flex-col h-full">
                <h3 className="text-sm font-semibold text-brand-muted mb-2">{lang.name}</h3>
                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        onFocus();
                    }}
                    onFocus={onFocus}
                    className="flex-grow bg-transparent text-brand-light text-lg w-full resize-none focus:outline-none"
                    placeholder={`Enter text in ${lang.name}...`}
                />
                <div className="flex items-center justify-end space-x-2 mt-2">
                    <button onClick={() => speak(text, lang.speechLang)} className="p-3 rounded-full hover:bg-brand-primary/20 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={!text || !hasVoice} title={hasVoice ? 'Speak' : 'Speech not available'}>
                        <SpeakerIcon />
                    </button>
                    <button onClick={onListen} className={`p-3 rounded-full text-white transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-primary'}`}>
                        <MicIcon />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <PageLayout title="Translate">
            <div className="flex flex-col space-y-4 h-[calc(100vh-150px)]">
                <TranslationCard
                    langCode={fromLang}
                    text={topText}
                    setText={setTopText}
                    onListen={() => topListen(LANGUAGES[fromLang].speechLang)}
                    isListening={isTopListening}
                    onFocus={() => setActiveInput('top')}
                />
                 <div className="flex justify-center">
                    <button className="p-2 bg-brand-dark rounded-full" aria-label="Translation status">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 text-brand-accent transition-transform duration-300 ${isTranslating ? 'animate-spin' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.183m0 0a8.25 8.25 0 0111.667 0l3.181 3.183" />
                        </svg>
                    </button>
                </div>
                <TranslationCard
                    langCode={toLang}
                    text={bottomText}
                    setText={setBottomText}
                    onListen={() => bottomListen(LANGUAGES[toLang].speechLang)}
                    isListening={isBottomListening}
                    onFocus={() => setActiveInput('bottom')}
                />
            </div>
        </PageLayout>
    );
};

const StatsPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const { learntWords, learntPhrases, updateLearntWord, updateLearntPhrase } = useAppContext();
    const { isListening, transcript, listen, setTranscript } = useSpeech();
    const { speak, isVoiceAvailable } = useTextToSpeech();

    const [visibleSection, setVisibleSection] = useState<string | null>(null);
    const [practicingItem, setPracticingItem] = useState<{item: Word, type: 'word' | 'phrase', fromLangCode: LanguageCode, toLangCode: LanguageCode} | null>(null);
    const [practiceFeedback, setPracticeFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});

    const allStatsByPair = useMemo(() => {
        const pairs: Record<string, { fromLangCode: LanguageCode, toLangCode: LanguageCode, words: LearntWord[], phrases: LearntPhrase[] }> = {};

        learntWords.forEach(word => {
            const key = `${word.fromLangCode}-${word.toLangCode}`;
            if (!pairs[key]) {
                pairs[key] = { fromLangCode: word.fromLangCode, toLangCode: word.toLangCode, words: [], phrases: [] };
            }
            if (!pairs[key].words.some(lw => lw.word.EN === word.word.EN)) {
                pairs[key].words.push(word);
            }
        });

        learntPhrases.forEach(phrase => {
            const key = `${phrase.fromLangCode}-${phrase.toLangCode}`;
            if (!pairs[key]) {
                pairs[key] = { fromLangCode: phrase.fromLangCode, toLangCode: phrase.toLangCode, words: [], phrases: [] };
            }
             if (!pairs[key].phrases.some(lp => lp.phrase.EN === phrase.phrase.EN)) {
                pairs[key].phrases.push(phrase);
            }
        });
        
        return Object.values(pairs).map(pairData => {
            const correctWords = pairData.words.filter(lw => lw.isCorrect === true).length;
            const totalPracticedWords = pairData.words.filter(lw => lw.isCorrect !== null).length;
            const wordAccuracy = totalPracticedWords > 0 ? (correctWords / totalPracticedWords) * 100 : 0;
            
            const correctPhrases = pairData.phrases.filter(lp => lp.isCorrect === true).length;
            const totalPracticedPhrases = pairData.phrases.filter(lp => lp.isCorrect !== null).length;
            const phraseAccuracy = totalPracticedPhrases > 0 ? (correctPhrases / totalPracticedPhrases) * 100 : 0;

            return {
                ...pairData,
                totalWords: pairData.words.length,
                wordAccuracy,
                totalPhrases: pairData.phrases.length,
                phraseAccuracy,
            };
        }).sort((a, b) => `${a.fromLangCode}-${a.toLangCode}`.localeCompare(`${b.fromLangCode}-${b.toLangCode}`));
    }, [learntWords, learntPhrases]);

    useEffect(() => {
        if (!transcript || !practicingItem) return;

        const { item, type, fromLangCode, toLangCode } = practicingItem;
        const expectedText = item[toLangCode].toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
        const spokenText = transcript.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
        const isCorrect = spokenText === expectedText;

        if (type === 'word') {
            updateLearntWord(item, fromLangCode, toLangCode, isCorrect);
        } else {
            updateLearntPhrase(item, fromLangCode, toLangCode, isCorrect);
        }

        const itemKey = type === 'word' ? item.EN : item.EN + item[toLangCode];
        setPracticeFeedback(prev => ({...prev, [itemKey]: isCorrect ? 'correct' : 'incorrect' }));
        setTimeout(() => {
            setPracticeFeedback(prev => {
                const newState = {...prev};
                delete newState[itemKey];
                return newState;
            });
        }, 2000);


        setTranscript('');
        setPracticingItem(null);
    }, [transcript, practicingItem, updateLearntWord, updateLearntPhrase, setTranscript]);

    const handleListen = (item: Word, type: 'word' | 'phrase', fromLangCode: LanguageCode, toLangCode: LanguageCode) => {
        setPracticingItem({ item, type, fromLangCode, toLangCode });
        listen(LANGUAGES[toLangCode].speechLang);
    };

    const handleCheck = (item: Word, type: 'word' | 'phrase', fromLangCode: LanguageCode, toLangCode: LanguageCode) => {
        if (type === 'word') updateLearntWord(item, fromLangCode, toLangCode, false);
        else updateLearntPhrase(item, fromLangCode, toLangCode, false);
    };

    const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subValue: string; onClick: () => void; isExpanded: boolean }> = ({ icon, title, value, subValue, onClick, isExpanded }) => (
        <button onClick={onClick} className={`w-full bg-brand-dark p-6 rounded-2xl flex items-center space-x-4 text-left transition-all ${isExpanded ? 'ring-2 ring-brand-primary' : 'hover:bg-brand-dark/70'}`}>
            <div className="p-3 bg-brand-primary/20 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-brand-muted">{title}</p>
                <p className="text-2xl font-bold text-brand-light">{value}</p>
                <p className="text-sm font-semibold text-brand-accent">{subValue}</p>
            </div>
        </button>
    );

    const toggleSection = (pairKey: string, type: 'words' | 'phrases') => {
        const sectionId = `${pairKey}-${type}`;
        setVisibleSection(prev => prev === sectionId ? null : sectionId);
    };
    
    return (
        <PageLayout title="Your Learning Statistics" onBack={onBack}>
            <div className="space-y-10">
                {allStatsByPair.length === 0 && (
                    <div className="text-center text-brand-muted py-10">
                        <p className="text-xl font-bold">No Stats Yet!</p>
                        <p>Start learning in the Vocabulary section to see your progress here.</p>
                    </div>
                )}
                {allStatsByPair.map(stats => {
                    const pairKey = `${stats.fromLangCode}-${stats.toLangCode}`;
                    return (
                        <div key={pairKey}>
                            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-4">
                                <span>{LANGUAGES[stats.fromLangCode].name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-muted"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                                <span>{LANGUAGES[stats.toLangCode].name}</span>
                            </h2>
                            <div className="space-y-6">
                                <StatCard 
                                    icon={<BookIcon />}
                                    title="Words Learnt"
                                    value={`${stats.totalWords}`}
                                    subValue={`${stats.wordAccuracy.toFixed(0)}% Accuracy`}
                                    onClick={() => toggleSection(pairKey, 'words')}
                                    isExpanded={visibleSection === `${pairKey}-words`}
                                />
                                {visibleSection === `${pairKey}-words` && (
                                    <div className="space-y-3 pl-4 border-l-2 border-brand-primary/20 animate-fade-in">
                                        {stats.words.length > 0 ? stats.words.map(({word, isCorrect}) => (
                                            <PracticeItem
                                                key={word.EN}
                                                item={word}
                                                fromLangCode={stats.fromLangCode}
                                                toLangCode={stats.toLangCode}
                                                isCorrect={isCorrect}
                                                onCheck={(item) => handleCheck(item, 'word', stats.fromLangCode, stats.toLangCode)}
                                                onSpeak={speak}
                                                onListen={(item) => handleListen(item, 'word', stats.fromLangCode, stats.toLangCode)}
                                                isListening={isListening}
                                                isCurrentItem={practicingItem?.type === 'word' && practicingItem?.item.EN === word.EN}
                                                isVoiceAvailable={isVoiceAvailable}
                                                feedback={practiceFeedback[word.EN]}
                                            />
                                        )) : <p className="text-brand-muted p-4">No words practiced yet for this language pair.</p>}
                                    </div>
                                )}
                                 <StatCard 
                                    icon={<StackedBooksIcon />}
                                    title="Phrases Learnt"
                                    value={`${stats.totalPhrases}`}
                                    subValue={`${stats.phraseAccuracy.toFixed(0)}% Accuracy`}
                                    onClick={() => toggleSection(pairKey, 'phrases')}
                                    isExpanded={visibleSection === `${pairKey}-phrases`}
                                 />
                                 {visibleSection === `${pairKey}-phrases` && (
                                    <div className="space-y-3 pl-4 border-l-2 border-brand-primary/20 animate-fade-in">
                                        {stats.phrases.length > 0 ? stats.phrases.map(({phrase, isCorrect}) => (
                                           <PracticeItem
                                                key={phrase.EN + phrase[stats.toLangCode]}
                                                item={phrase}
                                                fromLangCode={stats.fromLangCode}
                                                toLangCode={stats.toLangCode}
                                                isCorrect={isCorrect}
                                                onCheck={(item) => handleCheck(item, 'phrase', stats.fromLangCode, stats.toLangCode)}
                                                onSpeak={speak}
                                                onListen={(item) => handleListen(item, 'phrase', stats.fromLangCode, stats.toLangCode)}
                                                isListening={isListening}
                                                isCurrentItem={practicingItem?.type === 'phrase' && practicingItem?.item.EN === phrase.EN}
                                                isVoiceAvailable={isVoiceAvailable}
                                                feedback={practiceFeedback[phrase.EN + phrase[stats.toLangCode]]}
                                            />
                                        )) : <p className="text-brand-muted p-4">No phrases generated yet. Create some from the vocabulary page!</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </PageLayout>
    )
};


const ProfilePage = () => {
    const { user, login, logout } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ email: '', name: '', mobile: '', country: '' });
    const [payments, setPayments] = useState<Payment[]>([]);
    const [adminSettings, setAdminSettings] = useState(() => {
        const saved = localStorage.getItem('lingotrek-admin-settings');
        return saved ? JSON.parse(saved) : { paypal: '', stripe: '', donationAmount: 5 };
    });
    const [allUsers, setAllUsers] = useState<User[]>([]);
    
    useEffect(() => {
        if(user) {
            const savedPayments = localStorage.getItem('lingotrek-payments');
            if (savedPayments) setPayments(JSON.parse(savedPayments));

            if(user.email === ADMIN_EMAIL){
                const savedUsers = localStorage.getItem('lingotrek-all-users');
                if(savedUsers) setAllUsers(JSON.parse(savedUsers));
            }
        }
    }, [user]);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const from = location.state?.from?.pathname || '/';
        const newUser = { ...formData };
        login(newUser);

        // Save user for admin view (for demo purposes)
        try {
            const allUsersStr = localStorage.getItem('lingotrek-all-users');
            const currentUsers = allUsersStr ? JSON.parse(allUsersStr) : [];
            if (!currentUsers.some((u: User) => u.email === newUser.email)) {
                currentUsers.push(newUser);
                localStorage.setItem('lingotrek-all-users', JSON.stringify(currentUsers));
            }
        } catch (error) {
            console.error("Could not save user to all-users list", error);
        }

        navigate(from, { replace: true });
    };
    
    const handlePayment = (method: 'PayPal' | 'Stripe') => {
        const newPayment: Payment = { date: new Date().toISOString().split('T')[0], amount: adminSettings.donationAmount, method };
        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);
        localStorage.setItem('lingotrek-payments', JSON.stringify(updatedPayments));
        alert('Thank you for your donation!');
    };

    const handleAdminSave = () => {
        localStorage.setItem('lingotrek-admin-settings', JSON.stringify(adminSettings));
        alert('Admin settings saved!');
    };

    if (!user) {
        return (
            <PageLayout title="Register" showControls={false}>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <header className="flex items-center space-x-3 mb-8">
                        <LogoIcon />
                        <h1 className="text-3xl font-extrabold tracking-tight text-brand-light">Welcome to LingoTrek</h1>
                    </header>
                    <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full p-3 bg-brand-dark rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-3 bg-brand-dark rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        <input type="tel" placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full p-3 bg-brand-dark rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        <input type="text" placeholder="Country of Residence" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-3 bg-brand-dark rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl transition-transform duration-200 hover:scale-105 shadow-lg">Register & Start</button>
                    </form>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Profile">
            <div className="space-y-8">
                <div className="bg-brand-dark p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Account Information</h3>
                    <div className="space-y-2 text-brand-muted">
                        <p><span className="font-semibold text-brand-light">Name:</span> {user.name}</p>
                        <p><span className="font-semibold text-brand-light">Email:</span> {user.email}</p>
                        <p><span className="font-semibold text-brand-light">Mobile:</span> {user.mobile}</p>
                        <p><span className="font-semibold text-brand-light">Country:</span> {user.country}</p>
                    </div>
                </div>
                
                <div className="bg-brand-dark p-6 rounded-xl">
                     <h3 className="text-xl font-bold mb-4">Support LingoTrek</h3>
                     <p className="text-brand-muted mb-4">Your donations of ${adminSettings.donationAmount} help us keep the app free and ad-free for everyone.</p>
                     <div className="flex space-x-4">
                        <button onClick={() => handlePayment('PayPal')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Donate with PayPal</button>
                        <button onClick={() => handlePayment('Stripe')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Donate with Stripe</button>
                     </div>
                </div>

                {payments.length > 0 && (
                     <div className="bg-brand-dark p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Payment History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                            <thead><tr className="border-b border-slate-600"><th className="py-2">Date</th><th className="py-2">Amount</th><th className="py-2">Method</th></tr></thead>
                            <tbody>
                                    {payments.map((p, i) => <tr key={i} className="border-b border-slate-700"><td className="py-2">{p.date}</td><td className="py-2">${p.amount.toFixed(2)}</td><td className="py-2">{p.method}</td></tr>)}
                            </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {user.email === ADMIN_EMAIL && (
                     <div className="bg-brand-dark border border-brand-accent p-6 rounded-xl space-y-6">
                        <h3 className="text-xl font-bold text-brand-accent">Admin Panel</h3>
                        <div>
                            <h4 className="text-lg font-bold mb-2">API & Payment Settings</h4>
                            <div className="space-y-4">
                                <input type="text" placeholder="PayPal Client ID" value={adminSettings.paypal} onChange={e => setAdminSettings({...adminSettings, paypal: e.target.value})} className="w-full p-3 bg-slate-900 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                                <input type="text" placeholder="Stripe Publishable Key" value={adminSettings.stripe} onChange={e => setAdminSettings({...adminSettings, stripe: e.target.value})} className="w-full p-3 bg-slate-900 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="donationAmount" className="text-brand-muted">Donation Amount: $</label>
                                    <input id="donationAmount" type="number" value={adminSettings.donationAmount} onChange={e => setAdminSettings({...adminSettings, donationAmount: Number(e.target.value) || 0})} className="p-2 bg-slate-900 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none w-24" />
                                </div>
                                <button onClick={handleAdminSave} className="w-full bg-brand-accent hover:bg-amber-300 text-brand-darker font-bold py-2 px-4 rounded-lg">Save Settings</button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-2">Registered Users ({allUsers.length})</h4>
                            <div className="overflow-x-auto max-h-60 bg-slate-900 rounded-lg p-2">
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="border-b border-slate-600"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Country</th></tr></thead>
                                    <tbody>
                                        {allUsers.map((u, i) => (
                                            <tr key={i} className="border-b border-slate-700">
                                                <td className="p-2">{u.name}</td>
                                                <td className="p-2">{u.email}</td>
                                                <td className="p-2">{u.country}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                <button onClick={() => { logout(); navigate('/'); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl">Log Out</button>
            </div>
        </PageLayout>
    );
};

const DictionaryPage = () => {
    const { fromLang, toLang } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Word[]>([]);
    const [phonetics, setPhonetics] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    const { speak, isVoiceAvailable } = useTextToSpeech();

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const lowerSearchTerm = searchTerm.toLowerCase();
        const allWords = VOCABULARY_DATA.flatMap(topic => topic.words);
        const filtered = allWords.filter(word => 
            word[fromLang]?.toLowerCase().includes(lowerSearchTerm) || 
            word[toLang]?.toLowerCase().includes(lowerSearchTerm)
        );
        setResults(filtered);

        const fetchPhonetics = async () => {
            const newPhoneticsToFetch = filtered.filter(word => !phonetics[word.EN]);
            if (newPhoneticsToFetch.length === 0) {
                setIsLoading(false);
                return;
            }
            const phoneticsPromises = newPhoneticsToFetch.map(word =>
                getPhonetics(word[toLang], toLang).then(p => ({ enWord: word.EN, phonetic: p }))
            );
            const phoneticResults = await Promise.all(phoneticsPromises);
            const newPhonetics: Record<string, string> = {};
            phoneticResults.forEach(result => {
                if(result.phonetic) newPhonetics[result.enWord] = result.phonetic;
            });
            setPhonetics(prev => ({ ...prev, ...newPhonetics }));
            setIsLoading(false);
        };
        fetchPhonetics();

    }, [searchTerm, fromLang, toLang]);

    return (
        <PageLayout title="Dictionary">
            <div className="relative">
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={`Search in ${LANGUAGES[fromLang].name} or ${LANGUAGES[toLang].name}`}
                    className="w-full p-4 pl-10 bg-brand-dark rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-muted"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </div>
            </div>
            <div className="space-y-3 mt-6">
                {isLoading && <p className="text-center text-brand-muted">Searching...</p>}
                {!isLoading && results.length === 0 && searchTerm.length > 0 && <p className="text-center text-brand-muted">No results found for "{searchTerm}"</p>}
                {results.map(word => (
                    <div key={word.EN} className="bg-brand-dark p-4 rounded-lg flex items-center space-x-4 animate-fade-in">
                        <div className="flex-grow">
                            <p className="text-lg text-brand-light">{word[toLang]}</p>
                            <p className="text-sm text-brand-accent">{phonetics[word.EN] || ' '}</p>
                            <p className="text-sm text-brand-muted">{word[fromLang]}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => speak(word[toLang], LANGUAGES[toLang].speechLang)} className="p-2 rounded-full hover:bg-brand-primary/20 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={!isVoiceAvailable(LANGUAGES[toLang].speechLang)}>
                                <SpeakerIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PageLayout>
    );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/learn" element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          } />
           <Route path="/dictionary" element={
            <ProtectedRoute>
              <DictionaryPage />
            </ProtectedRoute>
          } />
          <Route path="/translate" element={
            <ProtectedRoute>
              <TranslatePage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}