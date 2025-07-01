
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordPair, CorrectStatus, PronunciationMethod } from '../types';
import { WordCard } from './WordCard';
import { AdSense } from './AdSense';
import { Footer } from './Footer';
import { useUser } from '../contexts/UserContext';

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
const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
);
const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

type Phrase = { english: string; khmer: string };

interface AlreadyLearnedViewProps {
  onClose: () => void;
  learntWords: WordPair[];
  correctlyPronounced: CorrectStatus;
  onPronunciationResult: (wordId: number, lang: 'en' | 'km', method: 'auto' | 'manual') => void;
  voices: SpeechSynthesisVoice[];
}

export const AlreadyLearnedView: React.FC<AlreadyLearnedViewProps> = ({
  onClose,
  learntWords,
  correctlyPronounced,
  onPronunciationResult,
  voices,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const { user } = useUser();

  // --- Phrase Practice State ---
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [phraseStatus, setPhraseStatus] = useState({ en: false, km: false });
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredLearnedWords = learntWords.filter(word => 
    word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.khmer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Phrase Generation ---
  const generateNewPhrase = useCallback(async () => {
    if (learntWords.length < 2) {
      setGenerationError("Learn at least 2 words to generate phrases.");
      return;
    }
    setIsGeneratingPhrase(true);
    setGenerationError('');
    setCurrentPhrase(null);

    const wordList = learntWords.map(w => `'${w.english}'`).join(', ');
    const prompt = `You are a language coach creating practice sentences for a tourist in Cambodia.

**Instructions:**
1.  **Create a practical, natural, and grammatically correct American English sentence.** The sentence should be something a tourist might actually say, between 5 and 10 words long.
2.  **Incorporate at least one or two words from this vocabulary list:** [${wordList}].
3.  **You can use common English "glue words"** (like 'a', 'the', 'is', 'from', 'to') to make the sentence sound natural.
4.  **Provide the most accurate and natural, polite Khmer translation** for the sentence.
5.  **Example:** If the list has 'market' and 'delicious', a good sentence is "The food at the market is delicious." not just "market delicious food".
6.  **Respond ONLY with a valid JSON object** in the format: {"english": "The English sentence.", "khmer": "The Khmer translation."}. Do not include any other text, explanations, or markdown formatting.`;

    try {
      const apiResponse = await fetch('/api/generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || 'Failed to generate phrase');
      }
      
      const response = await apiResponse.json();
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
      
      const parsedData = JSON.parse(jsonStr);
      if (parsedData.english && parsedData.khmer) {
        setCurrentPhrase(parsedData);
        setPhraseStatus({ en: false, km: false });
      } else {
        throw new Error("Invalid format received from API.");
      }
    } catch (err) {
      console.error("Phrase generation error:", err);
      setGenerationError("Couldn't generate a phrase. Try again.");
    } finally {
      setIsGeneratingPhrase(false);
    }
  }, [learntWords]);

  useEffect(() => {
    if (learntWords.length > 1) {
      generateNewPhrase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Audio and Speech Recognition Setup ---
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

  // --- Phrase Audio/Speech Handlers ---
  const handleSpeakPhrase = useCallback((text: string, lang: 'en' | 'km') => {
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
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.lang.startsWith('en-'));
        if (voice) utterance.voice = voice;
        else utterance.lang = 'en-US';
        utterance.rate = 1.0;
        
        utterance.onend = () => setIsSpeaking(null);
        utterance.onerror = () => {
            setIsSpeaking(null);
            alert(`Could not play audio for the phrase.`);
        };
        
        window.speechSynthesis.speak(utterance);
    } else { // lang === 'km'
        const encodedText = encodeURIComponent(text);
        const audioUrl = `/api/tts?lang=km&text=${encodedText}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const onEnd = () => {
            setIsSpeaking(null);
            audioRef.current = null;
        };

        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', () => {
            console.error("Error playing Khmer phrase audio from proxy.");
            onEnd();
            alert(`Could not play Khmer audio for the phrase.`);
        });

        audio.play().catch(() => {
            console.error("Khmer audio playback error.");
            onEnd();
        });
    }
  }, [isSpeaking, voices]);

  const startRecordingPhrase = (lang: 'en' | 'km') => {
    const recognition = recognitionRef.current;
    if (!recognition || isRecording || !currentPhrase) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(null);

    const targetText = lang === 'en' ? currentPhrase.english : currentPhrase.khmer;
    recognition.lang = lang === 'en' ? 'en-US' : 'km-KH';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const normalize = (text: string) => text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const isCorrect = normalize(transcript) === normalize(targetText);
      setPhraseStatus(prev => ({...prev, [lang]: isCorrect}));
    };
    recognition.onend = () => setIsRecording(null);
    recognition.onerror = () => setIsRecording(null);
    
    recognition.start();
    setIsRecording(lang);
  };
  
  const stopRecordingPhrase = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };
  
  const getPhraseCheckmarkButton = (lang: 'en' | 'km') => (
      <button
          onClick={() => !phraseStatus[lang] && setPhraseStatus(prev => ({...prev, [lang]: true}))}
          disabled={phraseStatus[lang]}
          className="p-1 -ml-1 rounded-full disabled:cursor-not-allowed group"
          aria-label={`Manually mark phrase as correct`}
      >
          <CheckmarkIcon className={`transition-colors w-6 h-6 flex-shrink-0 ${
              phraseStatus[lang] ? 'text-green-500' : 'text-gray-300 group-hover:text-green-400'
          }`} />
      </button>
  );

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
          <header className="flex justify-between items-center mb-8">
            <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">
                Learnt Words
            </h2>
            <div className="w-[40px]" />
          </header>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className={!user?.isPremium ? "lg:col-span-2" : "lg:col-span-3"}>
              {/* Phrase Practice Section */}
              <div className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Phrase Practice</h3>
                  <button onClick={generateNewPhrase} disabled={isGeneratingPhrase} className="bg-orange-100 text-orange-700 font-semibold py-2 px-4 rounded-full hover:bg-orange-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                      {isGeneratingPhrase ? <Spinner /> : <RefreshIcon className="w-5 h-5"/>}
                      <span>Next Phrase</span>
                  </button>
                </div>
                
                <div className="min-h-[100px] flex flex-col justify-center">
                  {isGeneratingPhrase && <div className="flex justify-center"><Spinner /></div>}
                  {generationError && <p className="text-red-500 text-center">{generationError}</p>}
                  {!isGeneratingPhrase && !generationError && learntWords.length <= 1 && <p className="text-gray-500 text-center">Learn more words to practice phrases!</p>}

                  {currentPhrase && !isGeneratingPhrase && (
                    <div className="space-y-3 animate-fade-in">
                      {/* English Phrase */}
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-2 flex-grow pr-2">
                              {getPhraseCheckmarkButton('en')}
                              <span className="text-lg text-gray-800">{currentPhrase.english}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => handleSpeakPhrase(currentPhrase.english, 'en')} disabled={isRecording !== null} className={`p-2 rounded-full ${isSpeaking==='en' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'} `}><SpeakerIcon isSpeaking={isSpeaking === 'en'} /></button>
                              <button onClick={() => isRecording === 'en' ? stopRecordingPhrase() : startRecordingPhrase('en')} disabled={isRecording !== null && isRecording !== 'en'} className={`p-2 rounded-full ${isRecording==='en' ? 'bg-red-100 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}>{isRecording==='en' ? <StopIcon/> : <RecordIcon/>}</button>
                          </div>
                      </div>
                      {/* Khmer Phrase */}
                      <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2 flex-grow pr-2">
                              {getPhraseCheckmarkButton('km')}
                              <span className="text-lg text-gray-800" lang="km">{currentPhrase.khmer}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => handleSpeakPhrase(currentPhrase.khmer, 'km')} disabled={isRecording !== null} className={`p-2 rounded-full ${isSpeaking==='km' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'}`}><SpeakerIcon isSpeaking={isSpeaking === 'km'} /></button>
                              <button onClick={() => isRecording === 'km' ? stopRecordingPhrase() : startRecordingPhrase('km')} disabled={isRecording !== null && isRecording !== 'km'} className={`p-2 rounded-full ${isRecording==='km' ? 'bg-red-100 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}>{isRecording==='km' ? <StopIcon/> : <RecordIcon/>}</button>
                          </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg">
                  <button
                      onClick={() => setIsReviewVisible(!isReviewVisible)}
                      className="w-full flex justify-between items-center p-4 sm:p-6 text-left font-bold text-lg text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                      aria-expanded={isReviewVisible}
                      aria-controls="review-section"
                  >
                      <span>Review Learnt Words ({learntWords.length})</span>
                      <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isReviewVisible ? 'rotate-180' : ''}`} />
                  </button>
                  {isReviewVisible && (
                    <div id="review-section" className="p-4 sm:p-6 border-t border-gray-200 space-y-6 animate-fade-in">
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`Search ${learntWords.length} learnt words...`}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          aria-label="Search learnt words"
                        />
                        
                        {filteredLearnedWords.length > 0 ? (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 ${!user?.isPremium ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                            {filteredLearnedWords.map((word) => (
                              <WordCard 
                                key={`learned-${word.id}`} 
                                wordPair={word} 
                                correctStatus={correctlyPronounced[word.id] || { en: false, km: false }}
                                onPronunciationResult={onPronunciationResult}
                                voices={voices}
                                highlightManual={true}
                              />
                            ))}
                          </div>
                        ) : (
                            <p className="text-center text-gray-600 py-4">
                                {learntWords.length > 0 ? "No learnt words match your search." : "You haven't learnt any words yet. Go practice!"}
                            </p>
                        )}
                    </div>
                  )}
              </div>
              <div className="lg:hidden mt-12">
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
