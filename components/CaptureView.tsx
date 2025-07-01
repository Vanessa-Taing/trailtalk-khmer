

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Idea } from '../types';
import { OldIdeasView } from './OldIdeasView';
import { Footer } from './Footer';


// --- Icons ---
const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
  </svg>
);

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

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface CaptureViewProps {
  onClose: () => void;
}

const IDEAS_STORAGE_KEY = 'trailTalkCapturedIdeas_v2';

// --- Helper Functions ---
const formatTimestamp = (timestamp: number): string => {
    const now = new Date();
    const ideaDate = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - ideaDate.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return ideaDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};


export const CaptureView: React.FC<CaptureViewProps> = ({ onClose }) => {
  const [currentIdea, setCurrentIdea] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [isOldIdeasVisible, setIsOldIdeasVisible] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<number | null>(null);

  // Load ideas from localStorage on mount
  useEffect(() => {
    try {
      const storedIdeas = window.localStorage.getItem(IDEAS_STORAGE_KEY);
      if (storedIdeas) {
        setIdeas(JSON.parse(storedIdeas));
      }
    } catch (e) {
      console.error("Failed to load ideas from storage", e);
    }
  }, []);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.error("Failed to save ideas to storage", e);
    }
  }, [ideas]);

  const handleSaveIdea = useCallback((ideaText: string) => {
    if (ideaText.trim()) {
      const newIdea: Idea = {
        id: Date.now(),
        text: ideaText.trim(),
        status: 'new',
        timestamp: Date.now(),
      };
      setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
      setCurrentIdea('');
      finalTranscriptRef.current = '';
    }
  }, []);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported by your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = window.setTimeout(stopListening, 2000); // 2 seconds of silence
    };

    recognition.onstart = () => {
        setIsListening(true);
        resetSilenceTimer();
    };

    recognition.onresult = (event: any) => {
      resetSilenceTimer();
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript.trim() + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current += finalTranscript;
      setCurrentIdea(finalTranscriptRef.current + interimTranscript);
    };
    
    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      if (finalTranscriptRef.current.trim()) {
        handleSaveIdea(finalTranscriptRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      console.error("Speech recognition error:", event.error);
      setError(`Recording failed: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [handleSaveIdea]);

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
    } else {
      if (recognitionRef.current) {
        finalTranscriptRef.current = '';
        setCurrentIdea('');
        setError('');
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Could not start recording", e);
          setError("Could not start microphone. Check permissions.");
        }
      }
    }
  };
  
  const handleManualSave = () => {
      handleSaveIdea(currentIdea);
  };
  
  const handleUpdateIdeaStatus = (id: number, status: 'accepted' | 'rejected') => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === id ? { ...idea, status } : idea
      )
    );
  };

  const newIdeas = ideas.filter(idea => idea.status === 'new');
  const oldIdeas = ideas.filter(idea => idea.status !== 'new');

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
          <header className="flex justify-between items-center mb-8">
            <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700 flex items-center gap-2">
              <LightbulbIcon className="w-8 h-8 text-blue-500" />
              <span>Capture Idea</span>
            </h2>
            <div className="w-[40px]"></div>
          </header>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <textarea
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                placeholder="Type your idea or use the microphone..."
                className="w-full h-32 p-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                rows={4}
                aria-label="Idea input"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  onClick={handleToggleListening}
                  className={`p-3 rounded-full text-white transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 ${isListening ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'}`}
                  aria-label={isListening ? 'Stop recording' : 'Start recording with microphone'}
                >
                  {isListening ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={handleManualSave}
                  disabled={!currentIdea.trim() || isListening}
                  className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Save idea"
                >
                  Save Idea
                </button>
              </div>
              {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            </div>

            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                      <LightbulbIcon className="w-6 h-6 text-red-500" />
                      <span>Saved Ideas</span>
                  </h3>
                  <button
                      onClick={() => setIsOldIdeasVisible(true)}
                      disabled={oldIdeas.length === 0}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      aria-label={`View ${oldIdeas.length} old ideas`}
                  >
                      <LightbulbIcon className="w-4 h-4 text-green-500" />
                      <span>Old Ideas ({oldIdeas.length})</span>
                  </button>
              </div>
              {newIdeas.length > 0 ? (
                <ul className="space-y-4">
                  {newIdeas.slice(0, 5).map((idea, index) => (
                    <li key={idea.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start gap-3 flex-grow mr-4">
                        <span className="text-lg font-semibold text-gray-400">{index + 1}.</span>
                        <div className="flex-grow">
                          <p className="text-gray-800">{idea.text}</p>
                          {idea.timestamp && (
                              <p className="text-xs text-gray-400 mt-1">{formatTimestamp(idea.timestamp)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          <button 
                            onClick={() => handleUpdateIdeaStatus(idea.id, 'accepted')} 
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                            aria-label={`Accept idea: ${idea.text}`}
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateIdeaStatus(idea.id, 'rejected')} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label={`Reject idea: ${idea.text}`}
                          >
                            <CrossIcon className="w-5 h-5" />
                          </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-6">No new ideas saved yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {isOldIdeasVisible && <OldIdeasView ideas={oldIdeas} onClose={() => setIsOldIdeasVisible(false)} onUpdateStatus={handleUpdateIdeaStatus} />}
    </div>
  );
};