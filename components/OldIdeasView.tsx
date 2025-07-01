

import React from 'react';
import { Idea } from '../types';

// --- Icons ---
const CheckIcon: React.FC<{ className?: string; title?: string; }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        {title && <title>{title}</title>}
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CrossIcon: React.FC<{ className?: string; title?: string; }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        {title && <title>{title}</title>}
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface OldIdeasViewProps {
  ideas: Idea[];
  onClose: () => void;
  onUpdateStatus: (id: number, status: 'accepted' | 'rejected') => void;
}

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

export const OldIdeasView: React.FC<OldIdeasViewProps> = ({ ideas, onClose, onUpdateStatus }) => {
  const totalIdeas = ideas.length;
  const acceptedCount = ideas.filter(idea => idea.status === 'accepted').length;
  const rejectedCount = ideas.filter(idea => idea.status === 'rejected').length;

  const acceptedPercentage = totalIdeas > 0 ? Math.round((acceptedCount / totalIdeas) * 100) : 0;
  const rejectedPercentage = totalIdeas > 0 ? Math.round((rejectedCount / totalIdeas) * 100) : 0;
    
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 animate-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col transition-transform duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Old Ideas</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" aria-label="Close old ideas view">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {totalIdeas > 0 && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalIdeas}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
              </div>
              <div>
                 <p className="text-2xl font-bold text-green-600">{acceptedPercentage}%</p>
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
              </div>
               <div>
                <p className="text-2xl font-bold text-red-600">{rejectedPercentage}%</p>
                <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          )}
          
          {ideas.length > 0 ? (
            <ul className="space-y-3">
              {ideas.map((idea, index) => (
                <li key={idea.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3 flex-grow mr-2">
                    <span className="font-semibold text-gray-500">{index + 1}.</span>
                    <div className="flex-grow">
                      <p className="text-gray-700">{idea.text}</p>
                      {idea.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(idea.timestamp)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                          onClick={() => onUpdateStatus(idea.id, 'accepted')}
                          className={`p-2 rounded-full transition-colors ${idea.status === 'accepted' ? 'text-green-500 bg-green-100' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                          aria-label={`Accept idea: ${idea.text}`}
                      >
                          <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => onUpdateStatus(idea.id, 'rejected')}
                          className={`p-2 rounded-full transition-colors ${idea.status === 'rejected' ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          aria-label={`Reject idea: ${idea.text}`}
                      >
                          <CrossIcon className="w-5 h-5" />
                      </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No old ideas yet.</p>
          )}
        </main>
      </div>
    </div>
  );
};