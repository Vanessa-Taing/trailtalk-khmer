





import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { StatisticsView } from './StatisticsView';
import { Customer } from '../types';

// --- Icons ---
const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
    </svg>
);
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.002L10 18.451l7.834-13.449A11.954 11.954 0 0110 1.944zM9 13a1 1 0 112 0v2a1 1 0 11-2 0v-2zm1-4a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
    </svg>
);
const ReceiptIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const VoiceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

interface ProfileViewProps {
  onClose: () => void;
  onNavigateToAdmin: () => void;
  stats: {
    totalLearnt: number;
    pronunciationScore: number;
    needsPracticeCount: number;
    pronunciationAccuracy: number;
    totalPronouncedCount: number;
  };
  totalWords: number;
  onShowPractice: () => void;
  onShowReceipt: (customer: Customer) => void;
  onInitiateUpgrade: (gateway: 'stripe' | 'paypal') => void;
  onOpenVoiceTraining: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onClose, onNavigateToAdmin, stats, totalWords, onShowPractice, onShowReceipt, onInitiateUpgrade, onOpenVoiceTraining }) => {
  const { user, customers, login, logout, paymentSettings } = useUser();
  const [email, setEmail] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      login(email);
      setEmail('');
      onClose();
    }
  };
  
  const customerRecord = user && customers ? customers.find(c => c.email === user.email) : null;
  const isAdmin = user?.email === 'thegreenhomecommunity@gmail.com';
  const isGatewayConfigured = paymentSettings && (paymentSettings.stripeKey || paymentSettings.paypalId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transition-transform duration-300 transform animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <UserCircleIcon className="w-6 h-6 text-orange-500"/>
            <span>{user ? 'My Profile' : 'Login'}</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Close profile">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xl p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-full hover:bg-orange-700 transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300">
                Login / Register
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600">Welcome back,</p>
                <p className="font-bold text-lg text-gray-800">{customerRecord?.name || user.email}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md border">
                <StatisticsView 
                  totalLearnt={stats.totalLearnt}
                  pronunciationScore={stats.pronunciationScore}
                  needsPracticeCount={stats.needsPracticeCount}
                  totalWords={totalWords}
                  onShowPractice={onShowPractice}
                  pronunciationAccuracy={stats.pronunciationAccuracy}
                  totalPronouncedCount={stats.totalPronouncedCount}
                />
              </div>

              {user.isPremium ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex justify-between items-center">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                You are a <span className="font-bold">Premium Member</span>. Ads are disabled.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => customerRecord && onShowReceipt(customerRecord)} className="flex items-center gap-1 text-sm font-semibold text-yellow-800 hover:text-yellow-900 bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded-full transition-colors">
                        <ReceiptIcon className="w-4 h-4"/>
                        <span>Receipt</span>
                    </button>
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center space-y-3">
                    <h3 className="font-bold text-gray-800">Remove Ads Forever</h3>
                    <p className="text-sm text-gray-600">Support the app and enjoy an ad-free experience with a one-time payment of $9.99 USD.</p>
                    {isGatewayConfigured ? (
                        <div className="flex gap-2">
                        {paymentSettings?.stripeKey && (
                            <button onClick={() => onInitiateUpgrade('stripe')} className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                                Pay with Card
                            </button>
                        )}
                        {paymentSettings?.paypalId && (
                            <button onClick={() => onInitiateUpgrade('paypal')} className="flex-1 bg-sky-600 text-white font-bold py-3 px-4 rounded-full hover:bg-sky-700 transition-colors shadow-lg">
                                Pay with PayPal
                            </button>
                        )}
                        </div>
                    ) : (
                        <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-full cursor-not-allowed">
                            Upgrade Unavailable
                        </button>
                    )}
                </div>
              )}
              
              <div className="space-y-3 pt-4 border-t">
                 {isAdmin && (
                    <button
                        onClick={onNavigateToAdmin}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2"
                    >
                       <ShieldCheckIcon className="w-5 h-5"/>
                       Admin Panel
                    </button>
                )}
                 <button
                    onClick={onOpenVoiceTraining}
                    className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-full hover:bg-teal-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                 >
                    <VoiceIcon className="w-5 h-5"/>
                    Voice Training
                 </button>
                <button
                    onClick={logout}
                    className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                    Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};