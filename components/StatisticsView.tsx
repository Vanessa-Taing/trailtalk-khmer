import React from 'react';

interface StatisticsViewProps {
  totalLearnt: number;
  pronunciationScore: number;
  needsPracticeCount: number;
  totalWords: number;
  onShowPractice: () => void;
  pronunciationAccuracy: number;
  totalPronouncedCount: number;
}

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-green-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


export const StatisticsView: React.FC<StatisticsViewProps> = ({
  totalLearnt,
  pronunciationScore,
  needsPracticeCount,
  totalWords,
  onShowPractice,
  pronunciationAccuracy,
  totalPronouncedCount,
}) => {
  const percentageLearnt = totalWords > 0 ? (totalLearnt / totalWords) * 100 : 0;

  const getStarRating = (accuracy: number): number => {
    if (totalPronouncedCount === 0) return 0;
    if (accuracy >= 80) return 5;
    if (accuracy >= 60) return 4;
    if (accuracy >= 40) return 3;
    if (accuracy >= 20) return 2;
    return 1;
  };

  const starRating = getStarRating(pronunciationAccuracy);

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Learning Progress</h2>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 text-center mb-2">Pronunciation Accuracy</h3>
          <div className="flex justify-center items-center gap-4">
              <div className={`text-lg font-bold px-4 py-1.5 rounded-full ${pronunciationAccuracy >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {pronunciationAccuracy}%
              </div>
              <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < starRating} />
                  ))}
              </div>
          </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <span className="text-gray-700">Total Words Learnt</span>
          <span className="text-orange-600 font-bold">{totalLearnt} / {totalWords}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${percentageLearnt}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-600">{pronunciationScore}</p>
          <p className="text-sm text-green-800 font-semibold">Correct Pronunciations</p>
        </div>
        <button
          onClick={onShowPractice}
          disabled={needsPracticeCount === 0}
          className="w-full text-center bg-red-50 p-4 rounded-lg transition-colors hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label={`Practice ${needsPracticeCount} words`}
        >
          <ExclamationIcon className={`w-8 h-8 mx-auto mb-2 ${needsPracticeCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          <p className={`text-3xl font-bold ${needsPracticeCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>{needsPracticeCount}</p>
          <p className={`text-sm font-semibold ${needsPracticeCount > 0 ? 'text-red-800' : 'text-gray-600'}`}>Needs Practice</p>
        </button>
      </div>
    </div>
  );
};