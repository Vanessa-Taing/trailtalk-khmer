import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="TrailTalk Logo">
    <defs>
      <path id="textCircle" d="M 10,50 A 40,40 0 1 1 90,50 A 40,40 0 1 1 10,50" />
    </defs>
    <g>
        <circle cx="50" cy="50" r="39" fill="#e0f2f1" stroke="#4db6ac" strokeWidth="1.5" />
        <g fill="#a7d8c8" stroke="#00796b" strokeWidth="0.3">
            <path d="M48 45 l -4 3 l -2 5 l 3 2 l 4 -1 l 3 -4 l 2 -5 l -1 -2 l -3 2 z" />
            <path d="M44 55 l -3 6 l 4 2 l 3 -4 l -2 -5 z" />
            <path d="M56 57 l 5 -1 l 2 4 l -4 3 z" />
            <path d="M65 50 l 2 3 l -1 3 l -3 -1 z" />
        </g>
        <text style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', fill: '#ea580c' }} className="logo-text">
            <textPath href="#textCircle" startOffset="75%" textAnchor="middle" dominantBaseline="middle">
                TALK
            </textPath>
            <textPath href="#textCircle" startOffset="25%" textAnchor="middle" dominantBaseline="middle">
                TRAIL
            </textPath>
        </text>
    </g>
  </svg>
);
