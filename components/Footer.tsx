import React from 'react';

export const Footer: React.FC = () => (
  <footer className="w-full text-center py-4 text-sm text-gray-400 bg-gray-50 flex-shrink-0">
    © {new Date().getFullYear()} TrailTalk
  </footer>
);
