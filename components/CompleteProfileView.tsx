
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface CompleteProfileViewProps {
  onClose: () => void;
}

export const CompleteProfileView: React.FC<CompleteProfileViewProps> = ({ onClose }) => {
  const { user, updateCustomerDetails } = useUser();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && name.trim()) {
      updateCustomerDetails(user.email, { name: name.trim(), mobile: mobile.trim() });
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[90] flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transition-transform duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Complete Your Profile</h2>
          <p className="text-center text-gray-600 mt-2">Welcome to TrailTalk! Just a few more details to get you started.</p>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="e.g., Alex Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number (Optional)</label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="e.g., +1 555-123-4567"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Save and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
