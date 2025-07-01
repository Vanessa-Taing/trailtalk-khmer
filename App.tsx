

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_WORDS } from './constants';
import { TranslateView } from './components/TranslateView';
import { VocabularyView } from './components/VocabularyView';
import { DictView } from './components/DictView';
import { CaptureView } from './components/CaptureView';
import { LearnView } from './components/LearnView';
import { AlreadyLearnedView } from './components/AlreadyLearnedView';
import { NeedsPracticeView } from './components/NeedsPracticeView';
import { WordPair, CorrectStatus, PronunciationMethod, Customer, UserProgress } from './types';
import { AdSense } from './components/AdSense';
import { useUser } from './contexts/UserContext';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { PaymentModal } from './components/PaymentModal';
import { CompleteProfileView } from './components/CompleteProfileView';
import { ReceiptView } from './components/ReceiptView';
import { Footer } from './components/Footer';
import { VoiceTrainingView } from './components/VoiceTrainingView';
import { PhraseOfTheDay } from './components/PhraseOfTheDay';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
  </svg>
);

const PronunciationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 17c-1.38 0-2.5-1.12-2.5-2.5V12h1.5v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12h1.5v2.5c0 1.38-1.12 2.5-2.5 2.5zm5.3-2.5c-1.04 0-1.9-.86-1.9-1.9V8.9c0-1.04.86-1.9 1.9-1.9s1.9.86 1.9 1.9v3.7c0 1.04-.86 1.9-1.9 1.9zm-1.9-5.3c-.22 0-.4.18-.4.4v3.7c0 .22.18.4.4.4s.4-.18.4-.4V9.3c0-.22-.18-.4-.4-.4z"/>
        <path d="M17 12.5c.83 0 1.5.67 1.5 1.5v.5h-1.5v-.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5v.5h-1.5v-.5c0-.83.67-1.5 1.5-1.5z" opacity=".3"/>
        <path d="M14.8,14.5c1.04,0,1.9-0.86,1.9-1.9V9.4c0-1.04-0.86-1.9-1.9-1.9s-1.9,0.86-1.9,1.9v3.2C12.9,13.64,13.76,14.5,14.8,14.5z M14.8,8.5c0.22,0,0.4,0.18,0.4,0.4v3.2c0,0.22-0.18,0.4-0.4,0.4s-0.4-0.18-0.4-0.4V8.9C14.4,8.68,14.58,8.5,14.8,8.5z"/>
    </svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
    </svg>
);

const WalkingPersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    {/* Head */}
    <circle cx="12" cy="5.5" r="1.5"/>
    <g className="walk-body-bounce">
      {/* Torso */}
      <line x1="12" y1="7" x2="12" y2="13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Arms (back arm drawn first) */}
      <path className="walk-arm-back" d="M12 8.5 L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path className="walk-arm-front" d="M12 8.5 L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Legs (back leg drawn first) */}
      <path className="walk-leg-back" d="M12 13.5 L9.5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path className="walk-leg-front" d="M12 13.5 L14.5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </g>
  </svg>
);

type View = 'home' | 'learn' | 'vocab' | 'dict' | 'translate' | 'capture' | 'learnt_words' | 'profile' | 'admin';

const shuffleArray = (array: WordPair[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPracticeViewVisible, setIsPracticeViewVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isCompleteProfileVisible, setIsCompleteProfileVisible] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [isVoiceTrainingVisible, setIsVoiceTrainingVisible] = useState(false);
  const [activeCustomerForReceipt, setActiveCustomerForReceipt] = useState<Customer | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'paypal' | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const { user, setPremium, customers, paymentSettings } = useUser();

  // --- Vocabulary State ---
  const [wordBank, setWordBank] = useState<WordPair[]>(() => shuffleArray(ALL_WORDS));
  const [currentWords, setCurrentWords] = useState<WordPair[]>([]);
  const [alreadyLearntWords, setAlreadyLearntWords] = useState<WordPair[]>([]);
  const [correctlyPronounced, setCorrectlyPronounced] = useState<CorrectStatus>({});
  
  // --- Voice Loading ---
  useEffect(() => {
    let voicePollInterval: number | null = null;
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (voicePollInterval) {
          clearInterval(voicePollInterval);
        }
      }
    };
    
    loadVoices();
    
    if (window.speechSynthesis.getVoices().length === 0) {
      voicePollInterval = window.setInterval(loadVoices, 250);
    }
    
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (voicePollInterval) {
        clearInterval(voicePollInterval);
      }
    };
  }, []);
  
  // --- User-Specific Progress Management ---
  const getStorageKey = useCallback((email: string) => `trailTalkProgress_${email}`, []);

  // Load user data on login/user change
  useEffect(() => {
    if (user?.email) {
        const key = getStorageKey(user.email);
        try {
            const storedData = window.localStorage.getItem(key);
            if (storedData) {
                const data: UserProgress = JSON.parse(storedData);
                setCorrectlyPronounced(data.correctlyPronounced || {});
                const learntWordIds = new Set(data.alreadyLearntWordsIds || []);
                const learntWords = ALL_WORDS.filter(w => learntWordIds.has(w.id));
                setAlreadyLearntWords(learntWords);
            } else {
                // No data for this user, reset to empty
                setCorrectlyPronounced({});
                setAlreadyLearntWords([]);
            }
        } catch (e) {
            console.error("Failed to load user progress", e);
            setCorrectlyPronounced({});
            setAlreadyLearntWords([]);
        }
    } else {
        // User is logged out, reset all progress
        setCorrectlyPronounced({});
        setAlreadyLearntWords([]);
        setCurrentWords([]);
        setWordBank(shuffleArray(ALL_WORDS));
    }
  }, [user, getStorageKey]);

  // Save user data on progress change
  useEffect(() => {
    if (user?.email && (alreadyLearntWords.length > 0 || Object.keys(correctlyPronounced).length > 0)) {
        const key = getStorageKey(user.email);
        try {
            const dataToStore: UserProgress = {
                correctlyPronounced,
                alreadyLearntWordsIds: alreadyLearntWords.map(w => w.id)
            };
            window.localStorage.setItem(key, JSON.stringify(dataToStore));
        } catch (e) {
            console.error("Failed to save user progress", e);
        }
    }
  }, [correctlyPronounced, alreadyLearntWords, user, getStorageKey]);


  // Check if a newly logged-in user needs to complete their profile
  useEffect(() => {
      if (user && customers) {
          const customerRecord = customers.find(c => c.email === user.email);
          // A user needs to complete their profile if they have no name and are not the admin.
          if (customerRecord && !customerRecord.name && user.email !== 'thegreenhomecommunity@gmail.com') {
              setIsCompleteProfileVisible(true);
          }
      }
  }, [user, customers]);


  // --- Vocabulary Logic ---

  const handlePronunciationResult = (wordId: number, lang: 'en' | 'km', method: PronunciationMethod) => {
    if (method === false) return;
    setCorrectlyPronounced(prev => ({
      ...prev,
      [wordId]: {
        ...(prev[wordId] || { en: false, km: false }),
        [lang]: method,
      },
    }));
  };

  useEffect(() => {
    if (currentWords.length === 0) return;

    const completedWordIds = currentWords
      .filter(word => {
        const status = correctlyPronounced[word.id];
        return status && status.en && status.km;
      })
      .map(word => word.id);

    if (completedWordIds.length > 0) {
      const completedSet = new Set(completedWordIds);
      const wordsToMove = currentWords.filter(w => completedSet.has(w.id));
      
      const newCurrentWords = currentWords.filter(w => !completedSet.has(w.id));
      setCurrentWords(newCurrentWords);

      if (newCurrentWords.length === 0) {
        setIsCelebrating(true);
      }

      setAlreadyLearntWords(prev => {
        const newLearntWords = wordsToMove.filter(
          newWord => !prev.some(learntWord => learntWord.id === newWord.id)
        );
        return [...newLearntWords, ...prev];
      });
    }
  }, [correctlyPronounced, currentWords]);

  const fetchNextBatch = useCallback(() => {
    let bank = [...wordBank];
    if (bank.length < 9) {
        const allLearntIds = new Set([...alreadyLearntWords, ...currentWords].map(w => w.id));
        const availableWords = ALL_WORDS.filter(w => !allLearntIds.has(w.id));
        
        if (availableWords.length === 0) {
            setCurrentWords([]);
            setWordBank([]);
            return;
        }
        bank = shuffleArray(availableWords);
    }
    
    const nextCurrentWords = bank.slice(0, 9);
    const nextBank = bank.slice(9);

    setCurrentWords(nextCurrentWords);
    setWordBank(nextBank);
  }, [wordBank, alreadyLearntWords, currentWords]);
  
  useEffect(() => {
    if (view === 'vocab' && currentWords.length === 0 && !isCelebrating) {
      setTimeout(() => fetchNextBatch(), 500);
    }
  }, [view, currentWords.length, fetchNextBatch, isCelebrating]);

  const wordsNeedingPractice = useMemo(() => {
    return alreadyLearntWords.filter(word => {
        const status = correctlyPronounced[word.id];
        if (!status) return false;
        // A word needs practice if either language was manually marked.
        const needsPracticeEn = status.en === 'manual';
        const needsPracticeKm = status.km === 'manual';
        return needsPracticeEn || needsPracticeKm;
    });
  }, [alreadyLearntWords, correctlyPronounced]);

  const stats = useMemo(() => {
    const totalLearnt = alreadyLearntWords.length;
    let autoCorrectCount = 0;
    let totalPronouncedCount = 0;
    
    Object.values(correctlyPronounced).forEach(status => {
      if (status.en !== false) {
        totalPronouncedCount++;
        if (status.en === 'auto') {
          autoCorrectCount++;
        }
      }
      if (status.km !== false) {
        totalPronouncedCount++;
        if (status.km === 'auto') {
          autoCorrectCount++;
        }
      }
    });

    const pronunciationAccuracy = totalPronouncedCount > 0 ? Math.round((autoCorrectCount / totalPronouncedCount) * 100) : 0;
    
    const needsPracticeCount = wordsNeedingPractice.length;

    return { totalLearnt, pronunciationScore: autoCorrectCount, needsPracticeCount, pronunciationAccuracy, totalPronouncedCount };
  }, [alreadyLearntWords, correctlyPronounced, wordsNeedingPractice]);

  const handleShowReceipt = (customer: Customer) => {
    setActiveCustomerForReceipt(customer);
    setIsReceiptVisible(true);
  };

  const handleCloseViews = () => {
    setView('home');
  }


  const renderView = () => {
    switch (view) {
      case 'learn':
        return <LearnView onNavigate={(target) => setView(target as View)} onClose={handleCloseViews} />;
      case 'vocab':
        return <VocabularyView 
                  onClose={() => setView('learn')}
                  onViewLearnt={() => setView('learnt_words')}
                  currentWords={currentWords}
                  alreadyLearntWordsCount={alreadyLearntWords.length}
                  correctlyPronounced={correctlyPronounced}
                  onPronunciationResult={handlePronunciationResult}
                  voices={voices}
                  isCelebrating={isCelebrating}
                  onCelebrationEnd={() => setIsCelebrating(false)}
               />;
       case 'learnt_words':
         return <AlreadyLearnedView
                    onClose={() => setView('vocab')}
                    learntWords={alreadyLearntWords}
                    correctlyPronounced={correctlyPronounced}
                    onPronunciationResult={handlePronunciationResult}
                    voices={voices}
                />;
      case 'dict':
        return <DictView onClose={() => setView('learn')} voices={voices} />;
      case 'translate':
        return <TranslateView onClose={handleCloseViews} vocabulary={ALL_WORDS} voices={voices} />;
      case 'capture':
        return <CaptureView onClose={handleCloseViews} />;
      case 'profile':
        return <ProfileView 
                  onClose={handleCloseViews} 
                  onNavigateToAdmin={() => setView('admin')}
                  stats={stats}
                  totalWords={ALL_WORDS.length}
                  onShowPractice={() => setIsPracticeViewVisible(true)}
                  onShowReceipt={handleShowReceipt}
                  onInitiateUpgrade={(gateway) => {
                    setPaymentGateway(gateway);
                    setIsPaymentModalVisible(true);
                  }}
                  onOpenVoiceTraining={() => setIsVoiceTrainingVisible(true)}
               />;
      case 'admin':
        return <AdminView onClose={() => setView('profile')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <div className="flex-grow">
        <header className="text-center mb-8 mt-12 sm:mt-16 px-4 relative">
          <button 
            onClick={() => setView('profile')}
            className="absolute top-0 right-4 bg-white text-gray-500 p-2 rounded-full hover:bg-gray-200 hover:text-orange-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            aria-label="Open Profile"
          >
            <UserCircleIcon className="w-7 h-7" />
          </button>
          <div className="flex justify-center items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg" alt="Cambodian Flag" className="h-10 w-16 object-cover rounded" />
             <h1 className="text-4xl sm:text-5xl font-bold">
                <span className="title-letter text-orange-600" style={{ animationDelay: '0s' }}>T</span>
                <span className="title-letter text-orange-600" style={{ animationDelay: '0.05s' }}>r</span>
                <span className="title-letter text-orange-600" style={{ animationDelay: '0.1s' }}>a</span>
                <span className="title-letter text-orange-600" style={{ animationDelay: '0.15s' }}>i</span>
                <span className="title-letter text-orange-600" style={{ animationDelay: '0.2s' }}>l</span>
                <span className="title-letter text-teal-500" style={{ animationDelay: '0.25s' }}>T</span>
                <span className="title-letter text-teal-500" style={{ animationDelay: '0.3s' }}>a</span>
                <span className="title-letter text-teal-500" style={{ animationDelay: '0.35s' }}>l</span>
                <span className="title-letter text-teal-500" style={{ animationDelay: '0.4s' }}>k</span>
            </h1>
            <img src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" alt="British Flag" className="h-10 w-16 object-cover rounded" />
          </div>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Khmer English pocket vocabulary and translator
          </p>
        </header>

        <main className="container mx-auto px-4 pb-8 sm:pb-12">
          {user && stats.totalLearnt > 0 && (
            <div className="max-w-sm mx-auto bg-white p-4 rounded-xl shadow-md flex justify-center items-center gap-4 border border-gray-200 mb-8 animate-fade-in">
              <div className="bg-orange-100 p-3 rounded-full">
                  <WalkingPersonIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => setView('learnt_words')} className="flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-blue-200 transition-colors" title={`${stats.totalLearnt} words learned`}>
                      <BookIcon className="w-5 h-5" />
                      <span>{stats.totalLearnt}</span>
                  </button>
                  <button 
                    onClick={() => stats.needsPracticeCount > 0 && setIsPracticeViewVisible(true)}
                    disabled={stats.needsPracticeCount === 0}
                    className="flex items-center gap-2 bg-teal-100 text-teal-800 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed enabled:hover:bg-teal-200" 
                    title={stats.needsPracticeCount > 0 ? `${stats.pronunciationAccuracy}% accuracy. Click to practice ${stats.needsPracticeCount} words.` : `${stats.pronunciationAccuracy}% pronunciation accuracy`}
                  >
                      <PronunciationIcon className="w-5 h-5" />
                      <span>{stats.pronunciationAccuracy}%</span>
                  </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
            <button
              onClick={() => setView('learn')}
              className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center gap-2"
              aria-label="Open learning options"
            >
              <BookIcon className="w-6 h-6" />
              Learn
            </button>
            <button
                onClick={() => setView('translate')}
                className="bg-teal-500 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300 flex items-center gap-2"
                aria-label="Open translator"
              >
                <PronunciationIcon className="w-6 h-6"/>
                Translate
              </button>
              <button
                onClick={() => setView('capture')}
                className="bg-yellow-400 text-white font-bold p-3 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 glow-button-yellow"
                aria-label="Capture new ideas"
              >
                <LightbulbIcon className="w-6 h-6" />
              </button>
          </div>
          
          {view === 'home' && (
            user?.isPremium ? (
              <PhraseOfTheDay />
            ) : (
              <AdSense containerClassName="mt-12 w-full max-w-3xl mx-auto" />
            )
          )}
        </main>
      </div>
      
      <Footer />

      {renderView()}
      
      {isVoiceTrainingVisible && <VoiceTrainingView onClose={() => setIsVoiceTrainingVisible(false)} />}

      {isCompleteProfileVisible && (
        <CompleteProfileView onClose={() => setIsCompleteProfileVisible(false)} />
      )}

      {isPaymentModalVisible && paymentGateway && (
        <PaymentModal
          gateway={paymentGateway}
          onClose={() => setIsPaymentModalVisible(false)}
          onSuccess={() => {
            setPremium();
            setIsPaymentModalVisible(false);
            alert("Payment successful! Welcome to TrailTalk Premium.");
          }}
          paymentSettings={paymentSettings}
        />
      )}
      
      {isReceiptVisible && activeCustomerForReceipt && (
        <ReceiptView
            customer={activeCustomerForReceipt}
            onClose={() => setIsReceiptVisible(false)}
        />
      )}

      {isPracticeViewVisible && (
        <NeedsPracticeView
            onClose={() => setIsPracticeViewVisible(false)}
            practiceWords={wordsNeedingPractice}
            correctlyPronounced={correctlyPronounced}
            onPronunciationResult={handlePronunciationResult}
            voices={voices}
        />
      )}
    </div>
  );
};

export default App;