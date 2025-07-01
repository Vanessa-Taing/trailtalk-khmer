
import React from 'react';
import { useUser } from '../contexts/UserContext';

interface AdSenseProps {
  // A custom class for the outer div to control margin, width, etc.
  containerClassName?: string;
}

export const AdSense: React.FC<AdSenseProps> = ({ containerClassName }) => {
  const { user } = useUser();

  // If user is premium, don't show any ads.
  if (user?.isPremium) {
    return null;
  }

  // Default classes for when no override is provided
  const defaultContainerClass = "mt-12 w-full max-w-4xl mx-auto";
  
  return (
    <div className={containerClassName || defaultContainerClass} aria-hidden="true">
      <div className="relative border border-gray-200 bg-white rounded-lg p-4 pt-7 md:p-3 overflow-hidden shadow-sm">
        {/* Ad Label */}
        <div className="absolute top-1 right-2 flex items-center gap-1">
          <span className="text-xs text-gray-400 font-semibold">Ad</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Ad Content Container */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            {/* Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            {/* Text */}
            <div className="flex-grow">
                <p className="text-sm font-bold text-blue-700 hover:underline cursor-pointer">
                    Find Your Perfect Mountain Getaway
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Exclusive deals on cabins and gear. Plan your next adventure today!
                </p>
            </div>
            {/* Button */}
            <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <button className="w-full md:w-auto bg-blue-500 text-white font-semibold text-sm py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                    Learn More
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
