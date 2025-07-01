


import React, { useState } from 'react';
import { WordPair, PronunciationMethod } from '../types';
import { WordCard } from './WordCard';
import { AdSense } from './AdSense';
import { Footer } from './Footer';
import { useUser } from '../contexts/UserContext';

// --- Helper Components ---
const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

// --- Main Dictionary View Component ---
interface DictViewProps {
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
}

export const DictView: React.FC<DictViewProps> = ({ onClose, voices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordResult, setWordResult] = useState<WordPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [correctStatus, setCorrectStatus] = useState<{ en: PronunciationMethod; km: PronunciationMethod }>({ en: false, km: false });
  const { user } = useUser();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setWordResult(null);
    setCorrectStatus({ en: false, km: false });

    try {
      const prompt = `You are a helpful dictionary for a tourist. For the given word, provide its Khmer translation and a simple, one-sentence definition in both natural American English and polite Khmer, as if explaining to a beginner.
- User's word: "${searchTerm}"
- Respond ONLY with a valid JSON object in the format {"english": "EnglishWord", "khmer": "KhmerWord", "englishMeaning": "Simple English definition.", "khmerMeaning": "Simple Khmer definition."}. Do not include any other text, explanations, or markdown.`;

      const apiResponse = await fetch('/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        })
      });

      if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => ({}));
          console.error("API error:", errorData);
          throw new Error(errorData.error || 'Failed to fetch from dictionary');
      }
      
      const response = await apiResponse.json();
      let jsonStr = response.text.trim();
      
      // Remove potential markdown fences
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData = JSON.parse(jsonStr);

      if (parsedData.english && parsedData.khmer && parsedData.englishMeaning && parsedData.khmerMeaning) {
        setWordResult({
          id: Date.now(), // Use a temporary unique ID
          english: parsedData.english,
          khmer: parsedData.khmer,
          englishMeaning: parsedData.englishMeaning,
          khmerMeaning: parsedData.khmerMeaning,
        });
      } else {
        throw new Error("Invalid format received from API.");
      }

    } catch (err) {
      console.error("Dictionary error:", err);
      setError("Could not find a translation for that word. Please try another.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePronunciationResult = (wordId: number, lang: 'en' | 'km', method: 'auto' | 'manual') => {
    // wordId is unused here since there's only one card.
    setCorrectStatus(prev => ({
      ...prev,
      [lang]: method
    }));
  };

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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">
              Dictionary
            </h2>
            <div className="w-[40px]"></div> {/* Spacer to balance the header */}
          </header>
          
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className={!user?.isPremium ? "lg:col-span-2" : "lg:col-span-3"}>
                  <div className={`max-w-md mx-auto ${!user?.isPremium ? 'lg:mx-0' : 'lg:mx-auto'} text-center`}>
                      <form 
                          className="flex items-center gap-2"
                          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                      >
                        <input
                          type="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Enter a word..."
                          className="w-full p-3 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm text-lg"
                          aria-label="Search for a word"
                        />
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          aria-label="Search"
                        >
                          {isLoading ? (
                              <div className="w-6 h-6 animate-spin rounded-full border-t-2 border-white"></div>
                          ) : (
                              <SearchIcon className="w-6 h-6" />
                          )}
                        </button>
                      </form>

                      <div className="mt-8 min-h-[200px]">
                          {isLoading && <div className="flex justify-center"><Spinner /></div>}
                          {error && <p className="text-red-500">{error}</p>}
                          {!isLoading && !error && !wordResult && (
                            <p className="text-gray-500">Look up a word to get started.</p>
                          )}
                          {wordResult && (
                              <div className="transition-opacity duration-500 animate-fade-in">
                                  <WordCard 
                                      wordPair={wordResult}
                                      correctStatus={correctStatus}
                                      onPronunciationResult={handlePronunciationResult}
                                      isStandalone={true}
                                      voices={voices}
                                  />
                              </div>
                          )}
                      </div>
                      <div className="lg:hidden">
                        <AdSense containerClassName="mt-12 w-full"/>
                      </div>
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